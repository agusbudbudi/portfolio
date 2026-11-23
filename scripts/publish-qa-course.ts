// Publish a seeded QA Course: for every article in the content folder, upload
// its thumbnail (<dir>/thumbnails/<NN>-<slug>.png, from `npm run course:thumbs`)
// to Vercel Blob, then set it published with the chosen visibility; finally
// publish the course itself. Run after seed-qa-course.ts --apply.
//
// Only thumbnail (+ OG image when empty) / status / visibility change, plus
// the course's thumbnail and SEO (seoTitle / seoDescription in course.json). Title, body, tags etc. are kept
// as they are in the DB, so edits made in the admin after seeding survive.
// Safe to re-run: an article that already has a thumbnail keeps it, and
// anything already in the target state is skipped.
//
// Usage (dry run by default):
//   npm run publish:course -- content/qa-course/fintech-qa-ready
//   npm run publish:course -- content/qa-course/fintech-qa-ready --apply
// Options:
//   --visibility course-only|library|keep   default course-only (hidden from
//                     the library grid, readable by URL + in course); keep =
//                     leave each article's current visibility untouched
//
// Reads TURSO_DATABASE_URL / TURSO_AUTH_TOKEN / BLOB_READ_WRITE_TOKEN from .env.local.
import fs from 'node:fs';
import path from 'node:path';
import { put } from '@vercel/blob';
import { readQaLibraryCategories } from '../api/_lib/configStore.js';
import { readQaLibraryArticleBySlug, updateQaLibraryArticle } from '../api/_lib/qaLibraryStore.js';
import { readQaCourseBySlug, updateQaCourse } from '../api/_lib/qaCourseStore.js';
import { computeReadingTimeMinutes, validateQaLibraryArticleData } from '../src/lib/qaLibraryValidation.js';
import { validateQaCourseData } from '../src/lib/qaCourseValidation.js';
import type { QaLibraryArticle, QaLibraryArticleData, QaLibraryArticleVisibility } from '../src/types/qaLibrary.js';
import type { QaCourse, QaCourseData } from '../src/types/qaCourse.js';
import { loadCourseContent, parseCliArgs } from './lib/courseContent.js';

const USAGE = 'Usage: publish-qa-course <content-dir> [--apply] [--visibility course-only|library|keep]';

/** Strip the read-only/computed fields to get the writable article shape. */
function toData(a: QaLibraryArticle): QaLibraryArticleData {
  return {
    title: a.title, categoryId: a.categoryId, excerpt: a.excerpt, body: a.body,
    thumbnailUrl: a.thumbnailUrl, docUrl: a.docUrl, docFilename: a.docFilename, docSizeBytes: a.docSizeBytes,
    tags: a.tags, authorName: a.authorName, authorUserId: a.authorUserId, authorAvatarUrl: a.authorAvatarUrl,
    status: a.status, visibility: a.visibility,
    seoMetaTitle: a.seoMetaTitle, seoMetaDescription: a.seoMetaDescription, seoOgImage: a.seoOgImage,
  };
}

function toCourseData(c: QaCourse): QaCourseData {
  return {
    title: c.title, description: c.description, level: c.level, estimatedHours: c.estimatedHours,
    thumbnailUrl: c.thumbnailUrl, status: c.status, modules: c.modules,
    seoMetaTitle: c.seoMetaTitle, seoMetaDescription: c.seoMetaDescription, seoOgImage: c.seoOgImage,
  };
}

async function main() {
  const cli = parseCliArgs(process.argv.slice(2), { '--apply': 'bool', '--visibility': 'value' }, USAGE);
  const apply = cli.bool.has('--apply');
  const visibilityArg = cli.value.get('--visibility') ?? 'course-only';
  if (!['course-only', 'library', 'keep'].includes(visibilityArg)) throw new Error(`--visibility harus course-only, library, atau keep\n${USAGE}`);
  const targetVisibility = (row: QaLibraryArticle): QaLibraryArticleVisibility =>
    (visibilityArg === 'keep' ? (row.visibility ?? 'library') : visibilityArg as QaLibraryArticleVisibility);
  const dir = path.resolve(cli.dir);
  const { course, articles } = loadCourseContent(dir);

  if (apply && !process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN tidak ada di .env.local');

  // Preflight everything before writing anything: rows exist, thumbnails exist.
  const existingCourse = await readQaCourseBySlug(course.slug);
  if (!existingCourse) throw new Error(`Course "${course.slug}" belum ada. Jalankan seed dulu: npm run seed:course -- ${cli.dir} --apply`);
  const rows = new Map<string, QaLibraryArticle>();
  for (const a of articles) {
    const row = await readQaLibraryArticleBySlug(a.slug);
    if (!row) throw new Error(`Artikel "${a.slug}" belum ada di DB. Jalankan seed dulu.`);
    rows.set(a.slug, row);
    const thumb = path.join(dir, 'thumbnails', a.file.replace(/\.md$/, '.png'));
    if (!row.thumbnailUrl && !fs.existsSync(thumb)) {
      throw new Error(`Thumbnail tidak ada: ${path.relative(process.cwd(), thumb)}. Jalankan: npm run course:thumbs -- ${cli.dir}`);
    }
  }
  const validCategoryIds = new Set((await readQaLibraryCategories()).categories.map((c) => c.id));

  console.log(`${apply ? 'APPLY' : 'DRY RUN'}: publish ${course.title} (${articles.length} artikel, visibility ${visibilityArg})\n`);

  // 1. Articles.
  for (const a of articles) {
    const row = rows.get(a.slug)!;
    const visibility = targetVisibility(row);
    const needsThumb = !row.thumbnailUrl;
    if (!needsThumb && row.status === 'published' && row.visibility === visibility) {
      console.log(`  = ${a.slug} (sudah published)`);
      continue;
    }
    let thumbnailUrl = row.thumbnailUrl;
    if (needsThumb) {
      const file = path.join(dir, 'thumbnails', a.file.replace(/\.md$/, '.png'));
      if (apply) {
        // Same key shape as /api/upload's qaLibrary feature (QaLibrary/<owner>/<ts>-<name>).
        const blob = await put(`QaLibrary/${course.slug}/${Date.now()}-${path.basename(file)}`, fs.readFileSync(file), {
          access: 'public', contentType: 'image/png', addRandomSuffix: true,
        });
        thumbnailUrl = blob.url;
      } else {
        thumbnailUrl = `<upload:${path.basename(file)}>`;
      }
    }
    // OG image follows the thumbnail unless one was set explicitly.
    const seoOgImage = row.seoOgImage ?? thumbnailUrl;
    const data: QaLibraryArticleData = { ...toData(row), thumbnailUrl, seoOgImage, status: 'published', visibility };
    const check = validateQaLibraryArticleData(data, validCategoryIds);
    if (!check.ok) throw new Error(`${a.slug}: ${check.errors.join('; ')}`);
    if (apply) {
      const write = await updateQaLibraryArticle(row.id, row.slug, data, computeReadingTimeMinutes(data.body), row.updatedAt);
      if (!write.ok) throw new Error(`${a.slug}: ${write.reason === 'conflict' ? 'diubah orang lain saat script berjalan, jalankan ulang' : 'tidak ditemukan'}`);
    }
    console.log(`  ✓ ${a.slug}${needsThumb ? ' + thumbnail' : ''} → published, ${visibility}`);
  }

  // 2. Course: published + thumbnail (thumbnails/course.png, uploaded only if
  // the course has none) + SEO from course.json (only fills empty fields, so
  // admin edits win). The API refuses to publish a course pointing at a draft
  // article; step 1 just published them all, so the same rule is satisfied.
  const courseThumbFile = path.join(dir, 'thumbnails', 'course.png');
  let courseThumb = existingCourse.thumbnailUrl;
  const needsCourseThumb = !courseThumb && fs.existsSync(courseThumbFile);
  if (needsCourseThumb) {
    courseThumb = apply
      ? (await put(`QaLibrary/${course.slug}/${Date.now()}-course.png`, fs.readFileSync(courseThumbFile), {
        access: 'public', contentType: 'image/png', addRandomSuffix: true,
      })).url
      : '<upload:course.png>';
  }
  const nextCourse: QaCourseData = {
    ...toCourseData(existingCourse),
    status: 'published',
    thumbnailUrl: courseThumb,
    seoMetaTitle: existingCourse.seoMetaTitle ?? course.seoTitle,
    seoMetaDescription: existingCourse.seoMetaDescription ?? course.seoDescription,
    seoOgImage: existingCourse.seoOgImage ?? courseThumb,
  };
  const courseDiff = (['status', 'thumbnailUrl', 'seoMetaTitle', 'seoMetaDescription', 'seoOgImage'] as const)
    .filter((k) => (nextCourse[k] ?? null) !== (existingCourse[k] ?? null));
  if (courseDiff.length === 0) {
    console.log(`\n  = course ${course.slug} (sudah lengkap)`);
  } else {
    const check = validateQaCourseData(nextCourse);
    if (!check.ok) throw new Error(`course: ${check.errors.join('; ')}`);
    if (apply) {
      const write = await updateQaCourse(existingCourse.id, existingCourse.slug, check.course, existingCourse.updatedAt);
      if (!write.ok) throw new Error(`course: ${write.reason === 'conflict' ? 'diubah orang lain saat script berjalan, jalankan ulang' : 'tidak ditemukan'}`);
    }
    console.log(`\n  ✓ course ${course.slug}: ${courseDiff.join(', ')}`);
  }
  if (!courseThumb) console.log('  ! course tanpa thumbnail: jalankan npm run course:thumbs dulu');

  console.log(apply
    ? `\nSelesai. Cek /courses/${course.slug} (cache API publik ±60 detik).`
    : '\nDry run selesai. Tambahkan --apply untuk upload + publish.');
}

main().catch((err: unknown) => {
  console.error(`\nGagal: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
