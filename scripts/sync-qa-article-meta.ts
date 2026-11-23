// Sync article metadata from a content folder's frontmatter into QA Library
// rows that already exist: author (linked to a registered user, like the
// admin author picker) and SEO (seo_title, seo_description; OG image = the
// article's thumbnail). Status, visibility, title and body are NOT touched.
// Works for any folder of numbered .md files (course.json not needed), e.g.
// content/qa-course/junior-qa-ready.
//
// Usage (dry run by default):
//   npm run sync:article-meta -- content/qa-course/junior-qa-ready
//   npm run sync:article-meta -- content/qa-course/junior-qa-ready --apply
// Options:
//   --author-id <id>  users.id to set as author (default: DEFAULT_AUTHOR_ID, Agus Budiman)
import path from 'node:path';
import { readQaLibraryArticleBySlug, updateQaLibraryArticle } from '../api/_lib/qaLibraryStore.js';
import { readQaLibraryCategories } from '../api/_lib/configStore.js';
import { computeReadingTimeMinutes, validateQaLibraryArticleData } from '../src/lib/qaLibraryValidation.js';
import type { QaLibraryArticle, QaLibraryArticleData } from '../src/types/qaLibrary.js';
import { loadArticles, parseCliArgs } from './lib/courseContent.js';
import { resolveAuthor } from './lib/author.js';

const USAGE = 'Usage: sync-qa-article-meta <content-dir> [--apply] [--author-id <users.id>]';

function toData(a: QaLibraryArticle): QaLibraryArticleData {
  return {
    title: a.title, categoryId: a.categoryId, excerpt: a.excerpt, body: a.body,
    thumbnailUrl: a.thumbnailUrl, docUrl: a.docUrl, docFilename: a.docFilename, docSizeBytes: a.docSizeBytes,
    tags: a.tags, authorName: a.authorName, authorUserId: a.authorUserId, authorAvatarUrl: a.authorAvatarUrl,
    status: a.status, visibility: a.visibility,
    seoMetaTitle: a.seoMetaTitle, seoMetaDescription: a.seoMetaDescription, seoOgImage: a.seoOgImage,
  };
}

async function main() {
  const cli = parseCliArgs(process.argv.slice(2), { '--apply': 'bool', '--author-id': 'value' }, USAGE);
  const apply = cli.bool.has('--apply');
  const dir = path.resolve(cli.dir);
  const articles = loadArticles(dir);
  const author = await resolveAuthor(cli.value.get('--author-id'));
  const validCategoryIds = new Set((await readQaLibraryCategories()).categories.map((c) => c.id));

  console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${articles.length} artikel, author ${author.authorName} (${author.authorUserId})\n`);

  let changed = 0;
  for (const a of articles) {
    const row = await readQaLibraryArticleBySlug(a.slug);
    if (!row) { console.log(`  ! ${a.slug} belum ada di DB, dilewati`); continue; }
    const next: QaLibraryArticleData = {
      ...toData(row),
      ...author,
      seoMetaTitle: a.seoTitle ?? row.seoMetaTitle,
      seoMetaDescription: a.seoDescription ?? row.seoMetaDescription,
      // An explicitly set OG image wins; otherwise pin it to the thumbnail.
      seoOgImage: row.seoOgImage ?? row.thumbnailUrl,
    };
    const diff = (['authorName', 'authorUserId', 'authorAvatarUrl', 'seoMetaTitle', 'seoMetaDescription', 'seoOgImage'] as const)
      .filter((k) => (next[k] ?? null) !== (row[k] ?? null));
    if (diff.length === 0) { console.log(`  = ${a.slug}`); continue; }
    const check = validateQaLibraryArticleData(next, validCategoryIds);
    if (!check.ok) throw new Error(`${a.slug}: ${check.errors.join('; ')}`);
    if (apply) {
      const write = await updateQaLibraryArticle(row.id, row.slug, next, computeReadingTimeMinutes(next.body), row.updatedAt);
      if (!write.ok) throw new Error(`${a.slug}: ${write.reason === 'conflict' ? 'diubah orang lain saat script berjalan, jalankan ulang' : 'tidak ditemukan'}`);
    }
    changed++;
    console.log(`  ✓ ${a.slug}: ${diff.join(', ')}${!next.seoOgImage ? ' (OG image kosong: belum ada thumbnail)' : ''}`);
  }
  console.log(`\n${changed} artikel ${apply ? 'diperbarui' : 'akan diperbarui'}.${apply ? '' : ' Tambahkan --apply untuk menulis.'}`);
}

main().catch((err: unknown) => {
  console.error(`\nGagal: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
