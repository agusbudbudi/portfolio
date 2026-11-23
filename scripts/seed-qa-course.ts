// Seed a QA Course from a content folder into Turso: one QA Library article per
// numbered .md file, plus the course row built from course.json.
//
// Everything is created as DRAFT (articles need a thumbnail before they can be
// published, and the course should be reviewed in the admin first). Safe to
// re-run: articles whose slug already exists are reused, not duplicated, and an
// existing course slug is left untouched.
//
// Usage (dry run by default, prints what would be written):
//   npm run seed:course -- content/qa-course/fintech-qa-ready
//   npm run seed:course -- content/qa-course/fintech-qa-ready --apply
// Options:
//   --author-id <id>  users.id linked as author of new articles
//                     (default: DEFAULT_AUTHOR_ID in scripts/lib/author.ts). SEO title/description
//                     come from frontmatter seo_title / seo_description.
//
// Missing QA Library categories (by frontmatter `category` label) are created,
// with descriptions from course.json `categories` when given.
//
// Reads TURSO_DATABASE_URL / TURSO_AUTH_TOKEN from .env.local.
import fs from 'node:fs';
import path from 'node:path';
import { readQaLibraryCategories, writeQaLibraryCategories } from '../api/_lib/configStore.js';
import { createQaLibraryArticle, readQaLibraryArticleBySlug } from '../api/_lib/qaLibraryStore.js';
import { createQaCourse, isCourseSlugTaken } from '../api/_lib/qaCourseStore.js';
import { computeReadingTimeMinutes, validateQaLibraryArticleData, validateQaLibraryCategories } from '../src/lib/qaLibraryValidation.js';
import { slugify } from '../src/lib/portfolioValidation.js';
import { validateQaCourseData } from '../src/lib/qaCourseValidation.js';
import type { QaLibraryArticleData } from '../src/types/qaLibrary.js';
import type { QaCourseData, QaCourseModule } from '../src/types/qaCourse.js';
import { loadCourseContent, parseCliArgs } from './lib/courseContent.js';
import { resolveAuthor } from './lib/author.js';

const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12);

const USAGE = 'Usage: seed-qa-course <content-dir> [--apply] [--author-id <users.id>]';

async function main() {
  const cli = parseCliArgs(process.argv.slice(2), { '--apply': 'bool', '--author-id': 'value' }, USAGE);
  const args = { dir: cli.dir, apply: cli.bool.has('--apply') };
  const author = await resolveAuthor(cli.value.get('--author-id'));
  const dir = path.resolve(args.dir);
  const { course, articles } = loadCourseContent(dir);

  // Missions must point at a real simulator project phase (static JSON in public/).
  for (const m of course.modules) {
    if (!m.mission) continue;
    const cfgPath = path.resolve('public/qa-simulator/config', `${m.mission.projectId}.json`);
    if (!fs.existsSync(cfgPath)) throw new Error(`Modul "${m.title}": project simulator "${m.mission.projectId}" tidak ada`);
    const phases = (JSON.parse(fs.readFileSync(cfgPath, 'utf8')) as { phases: { id: string }[] }).phases;
    if (!phases.some((p) => p.id === m.mission!.phaseId)) {
      throw new Error(`Modul "${m.title}": phase "${m.mission.phaseId}" tidak ada di ${m.mission.projectId}`);
    }
  }

  if (await isCourseSlugTaken(course.slug)) {
    throw new Error(`Course "${course.slug}" sudah ada. Ubah lewat /dashboard/qa-courses, bukan script ini.`);
  }

  console.log(`${args.apply ? 'APPLY' : 'DRY RUN'}: ${course.title} (${articles.length} artikel)\n`);

  // 0. Categories: match frontmatter label to an existing category (case-
  // insensitive); create the missing ones (description from course.json).
  const categoriesDoc = await readQaLibraryCategories();
  const categories = [...categoriesDoc.categories];
  const categoryIdByLabel = new Map(categories.map((c) => [c.label.toLowerCase(), c.id]));
  const missingLabels = [...new Set(articles.map((a) => a.category))]
    .filter((label) => !categoryIdByLabel.has(label.toLowerCase()));
  for (const label of missingLabels) {
    const id = slugify(label);
    if (categories.some((c) => c.id === id)) throw new Error(`Kategori "${label}": id "${id}" sudah dipakai kategori lain`);
    const description = course.categories?.find((c) => c.label.toLowerCase() === label.toLowerCase())?.description;
    categories.push({ id, label, ...(description ? { description } : {}) });
    categoryIdByLabel.set(label.toLowerCase(), id);
    console.log(`  + kategori ${label} (${id})`);
  }
  if (missingLabels.length) {
    const check = validateQaLibraryCategories({ categories });
    if (!check.ok) throw new Error(`Kategori: ${check.errors.join('; ')}`);
    if (args.apply) {
      const write = await writeQaLibraryCategories({ categories: check.categories }, categoriesDoc.updatedAt);
      if (!write.ok) throw new Error('Kategori berubah saat script berjalan (conflict). Jalankan ulang.');
    }
    console.log('');
  }
  const validCategoryIds = new Set(categories.map((c) => c.id));

  // 1. Articles (draft). Reuse by slug so a re-run after a partial failure is safe.
  const articleIdBySlug = new Map<string, string>();
  for (const a of articles) {
    const existing = await readQaLibraryArticleBySlug(a.slug);
    if (existing) {
      articleIdBySlug.set(a.slug, existing.id);
      console.log(`  = ${a.slug} (sudah ada, ${existing.status})`);
      continue;
    }
    const data: QaLibraryArticleData = {
      title: a.title,
      categoryId: categoryIdByLabel.get(a.category.toLowerCase())!,
      excerpt: a.excerpt,
      body: a.body,
      tags: a.tags,
      ...author,
      status: 'draft',
      visibility: a.visibility,
      seoMetaTitle: a.seoTitle,
      seoMetaDescription: a.seoDescription,
    };
    const check = validateQaLibraryArticleData(data, validCategoryIds);
    if (!check.ok) throw new Error(`${a.file}: ${check.errors.join('; ')}`);
    const minutes = computeReadingTimeMinutes(a.body);
    if (args.apply) {
      const created = await createQaLibraryArticle(a.slug, data, minutes);
      articleIdBySlug.set(a.slug, created.id);
    } else {
      articleIdBySlug.set(a.slug, `<new:${a.slug}>`);
    }
    console.log(`  + ${a.slug} [${a.category}, ${minutes} mnt]`);
  }

  // 2. Course (draft).
  const modules: QaCourseModule[] = course.modules.map((m) => ({
    id: newId(),
    title: m.title,
    intro: m.intro,
    items: [
      ...m.articles.map((slug) => ({ id: newId(), kind: 'article' as const, articleId: articleIdBySlug.get(slug)! })),
      ...(m.mission ? [{ id: newId(), kind: 'mission' as const, ...m.mission }] : []),
    ],
  }));
  const courseData: QaCourseData = {
    title: course.title,
    description: course.description,
    level: course.level,
    estimatedHours: course.estimatedHours,
    status: 'draft',
    modules,
  };
  const check = validateQaCourseData(courseData);
  if (!check.ok) throw new Error(`course.json: ${check.errors.join('; ')}`);

  if (args.apply) await createQaCourse(course.slug, check.course);
  console.log(`\n  + course ${course.slug}: ${modules.length} modul, ${modules.reduce((n, m) => n + m.items.length, 0)} item (draft)`);
  if (!args.apply) console.log('\nDry run selesai. Tambahkan --apply untuk menulis ke database.');
  else console.log('\nSelesai. Lanjut: unggah thumbnail tiap artikel + publish, lalu review & publish course di /dashboard/qa-courses.');
}

main().catch((err: unknown) => {
  console.error(`\nGagal: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
