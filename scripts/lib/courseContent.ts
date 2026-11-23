// Shared reader for a QA Course content folder (content/qa-course/<slug>/):
// numbered article .md files with frontmatter + course.json. Used by
// seed-qa-course.ts and publish-qa-course.ts so both read files identically.
import fs from 'node:fs';
import path from 'node:path';
import type { QaCourseLevel } from '../../src/types/qaCourse.js';

export interface CourseFile {
  slug: string;
  title: string;
  description: string;
  level: QaCourseLevel;
  estimatedHours: number;
  /** Course SEO; filled into the DB by publish-qa-course when still empty. */
  seoTitle?: string;
  seoDescription?: string;
  /** Optional descriptions for categories the seed script has to create. */
  categories?: { label: string; description?: string }[];
  modules: {
    title: string;
    intro?: string;
    articles: string[];
    mission?: { projectId: string; phaseId: string };
  }[];
}

export interface ParsedArticle {
  /** e.g. "01-membaca-prd.md" */
  file: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  visibility: 'library' | 'course-only';
  seoTitle?: string;
  seoDescription?: string;
  body: string;
}

function unquote(v: string): string {
  const t = v.trim();
  return (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t;
}

export function parseArticle(file: string): ParsedArticle {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: frontmatter tidak ditemukan`);
  const fm: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) fm[line.slice(0, i).trim()] = unquote(line.slice(i + 1));
  }
  for (const key of ['title', 'slug', 'excerpt', 'category']) {
    if (!fm[key]) throw new Error(`${file}: frontmatter "${key}" kosong`);
  }
  if (fm.status === 'outline' || /<!-- TODO/.test(m[2])) throw new Error(`${file}: masih outline/TODO`);
  return {
    file: path.basename(file),
    slug: fm.slug,
    title: fm.title,
    excerpt: fm.excerpt,
    // "Manual Testing (pilih di admin)" -> "Manual Testing"
    category: fm.category.replace(/\(.*?\)/g, '').trim(),
    tags: (fm.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    visibility: fm.visibility === 'course-only' ? 'course-only' : 'library',
    seoTitle: fm.seo_title || undefined,
    seoDescription: fm.seo_description || undefined,
    body: m[2].trim() + '\n',
  };
}

/** Every numbered article .md in a folder (no course.json needed). */
export function loadArticles(dir: string): ParsedArticle[] {
  return fs.readdirSync(dir)
    .filter((f) => /^\d+.*\.md$/.test(f))
    .sort()
    .map((f) => parseArticle(path.join(dir, f)));
}

/** Reads course.json + every numbered .md, and checks they reference each other. */
export function loadCourseContent(dir: string): { course: CourseFile; articles: ParsedArticle[] } {
  const course = JSON.parse(fs.readFileSync(path.join(dir, 'course.json'), 'utf8')) as CourseFile;
  const articles = loadArticles(dir);
  const slugs = new Set(articles.map((a) => a.slug));
  const referenced = course.modules.flatMap((m) => m.articles);
  const missing = referenced.filter((s) => !slugs.has(s));
  if (missing.length) throw new Error(`course.json merujuk slug tanpa file: ${missing.join(', ')}`);
  const unused = articles.filter((a) => !referenced.includes(a.slug)).map((a) => a.slug);
  if (unused.length) console.warn(`! File tidak dipakai di course.json: ${unused.join(', ')}`);
  return { course, articles };
}

/** Rejects stray positional args (zsh passes `# comments` through as words). */
export function parseCliArgs(argv: string[], flags: Record<string, 'bool' | 'value'>, usage: string) {
  const out: { dir: string; bool: Set<string>; value: Map<string, string> } = { dir: '', bool: new Set(), value: new Map() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const kind = flags[a];
      if (!kind) throw new Error(`Opsi tidak dikenal: ${a}\n${usage}`);
      if (kind === 'bool') out.bool.add(a);
      else {
        const v = argv[++i];
        if (v === undefined) throw new Error(`${a} butuh nilai\n${usage}`);
        out.value.set(a, v);
      }
    } else if (out.dir) {
      throw new Error(`Argumen berlebih: "${a}". Hanya satu folder yang diterima (komentar # ikut terbaca di zsh?).`);
    } else out.dir = a;
  }
  if (!out.dir) throw new Error(usage);
  return out;
}
