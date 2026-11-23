---
name: create-qa-course
description: End-to-end workflow for creating a new QA Course (articles + simulator missions) in this repo, from choosing the simulator project and writing the Indonesian articles to thumbnails, seeding Turso, publishing, author/SEO sync, and linking the simulator's reading list. Use when asked to make, prepare, or continue a new QA Course ("buat course baru", "materi QA Course berikutnya").
---

# Create a QA Course

A QA Course = ordered modules; each module = 2 to 4 QA Library articles (Belajar)
+ 1 QA Simulator phase (Praktik). Content is written as markdown in
`content/qa-course/<course-slug>/`, then pushed to Turso by scripts.
Reference implementations: `content/qa-course/junior-qa-ready/` (beginner,
SplitBill) and `content/qa-course/fintech-qa-ready/` (intermediate, DompetKu).
Read one of them before writing anything new.

The workflow has 7 phases. Do them in order, and stop for the user's go-ahead
where marked **[confirm]**.

## Ground rules

- **Claude cannot write to the production DB or Blob.** Reading Turso from a
  script is blocked by the permission classifier. Never try to work around it.
  Every `npm run seed:course` / `publish:course` / `sync:article-meta` call is run
  **by the user**. Give them the exact commands, dry run first, then `--apply`.
- **Never put `# comments` after a command you hand to the user.** zsh passes
  them through as arguments (it happened: "Turso" became the folder). Put each
  command in its own code block with the explanation outside it.
- **No em-dash (—) anywhere** in article text, labels, SEO, or UI copy. Use a
  period, comma, or colon. Check with `grep -n "—"` before finishing.
- Content language: Indonesian, relaxed-professional, second person ("kamu").
- Don't touch uncommitted files that aren't yours (the user often has parallel
  work in `src/` and `api/`). Commit only the course files, and only when asked.

## Phase 1. Choose the scope **[confirm]**

1. List simulator projects and phases:
   `public/qa-simulator/config/index.json` and each `<id>.json` (`phases[].id`,
   `learn.objectives`, `learn.keyPoints`, `assignments`).
2. Pick the project whose difficulty fits the course level. Usually one module
   per phase, 3 articles per module.
3. Check what existing courses already teach (`content/qa-course/*/`). Don't
   repeat it; link to the earlier article by name instead.
4. Pick a **fictional example domain that is NOT the simulator's domain**, so the
   articles never leak mission answers (junior: "PesanAja" food delivery vs
   SplitBill; fintech: "TiketJalan" bus tickets vs DompetKu e-wallet). Never
   quote the mission PRD's numbers, rules, endpoints, or error codes, and don't
   use an example that points straight at a planted mission bug.
5. Propose: course name + slug (`<something>-ready` pattern so far), level,
   project, example domain, module/article list, and the assignment→article
   mapping. Get the user's OK, or pick sensible defaults and say so.

## Phase 2. Scaffold

Create `content/qa-course/<slug>/`:

- `README.md`: positioning, the module/article/mission table, the
  assignment→article mapping, module intros (2 to 4 sentences, ending with what
  the learner practises in the mission), writing rules, and the script commands
  (copy the structure of `fintech-qa-ready/README.md`).
- One file per article, `NN-<slug>.md`, numbered in course order.

Article frontmatter (exact keys, the scripts parse them):

```yaml
---
title: Judul Artikel
slug: judul-artikel
excerpt: 1 to 2 sentences shown on cards.
seo_title: Max 60 chars, keyword first
seo_description: Max 160 chars, no em-dash
category: QA Fundamentals
tags: tag satu, tag dua, tag tiga
visibility: library
course: <Course Title> · Modul N (<Module Name>) · Lesson N
---
```

- Quote `title` with `"..."` only if it contains a colon.
- `category` must be a QA Library category **label**. Existing so far:
  QA Fundamentals, Test Planning, Automation Test, AI in QA, API Testing.
  A new label is fine: the seed script creates missing categories (add a
  description for it under `categories` in course.json).
- The `course:` line format is required by the thumbnail generator.
- While outlining, `status: outline` + `<!-- TODO -->` markers are allowed; the
  seed script refuses files that still contain either.

`course.json` (seed, thumbnails, and publish all read it):

```json
{
  "slug": "course-slug",
  "title": "Course Title",
  "description": "Shown on the course card (line-clamped to 3 lines).",
  "level": "beginner | intermediate | advanced",
  "estimatedHours": 12,
  "seoTitle": "≤ 60 chars",
  "seoDescription": "≤ 160 chars",
  "categories": [{ "label": "New Category", "description": "..." }],
  "modules": [
    {
      "title": "Requirement",
      "intro": "Module intro text.",
      "articles": ["article-slug-1", "article-slug-2", "article-slug-3"],
      "mission": { "projectId": "ewallet", "phaseId": "requirement-analysis" }
    }
  ]
}
```

## Phase 3. Write the articles

Match the existing articles' shape (read 1 or 2 first):

- Hook paragraph (a familiar problem), then why it matters at this level.
- `##` sections with tables, `>` quoted examples (story/AC/bug report/plan),
  and one running example in the chosen fictional domain that continues across
  modules (same story ID, same build, same tables).
- End with a `## Checklist ...` or `## Latihan singkat` section, then
  `## Ringkasan` (4 to 5 bullets; the last one bridges to the next lesson).
- The last article closes the course (`## Penutup course`).
- Length about 5,500 to 7,000 characters (`wc -m`).
- Each article must prepare its assignment(s) from the mapping table.

Write module by module, then verify:

```bash
grep -n "—\|–\|TODO" content/qa-course/<slug>/*.md
wc -m content/qa-course/<slug>/[0-9]*.md
```

Then write SEO for every article: `seo_title` ≤ 60, `seo_description` ≤ 160.
Validate all lengths in a script **before** writing any file.

## Phase 4. Thumbnails

```bash
npm run course:thumbs -- content/qa-course/<slug>
```

Renders `thumbnails/NN-<slug>.png` per article + `thumbnails/course.png`
(1280×720, 16:9, brand style) with `scripts/og/course-thumbs.tsx` via local
Chrome + Playwright. Claude can run this one itself.

- The right-hand visual is picked per **module number** (`VISUALS` map: 1 PRD
  review, 2 risk matrix, 3 API request/response, 4 regression + Go/No-Go).
  For a course whose modules are about other topics, add or swap visuals there
  first.
- Look at several PNGs (Read the image), including the longest titles. Long
  single words are auto-shrunk, but check nothing touches the right card.
- `--course` renders only `course.png` (for a course whose articles already
  have thumbnails).
- For a course that already exists in the DB, take `level`, `estimatedHours`,
  and module titles from the live public API (`curl -sL
  https://www.mentorqa.com/api/qa-courses`), never from fallbacks in the code.
  The image bakes those numbers in (a wrong "±8 jam" shipped once).
- The course card shows the image full width; the courses drawer crops to the
  top-left (about 108px wide), so brand + title must stay top-left.

## Phase 5. Seed, publish, author + SEO (user runs these)

Hand the user these in order, dry run first each time:

```bash
npm run seed:course -- content/qa-course/<slug>
```

```bash
npm run seed:course -- content/qa-course/<slug> --apply
```

Seed creates missing categories, then the articles as **draft** (author linked to
the default user, SEO from frontmatter), then the course as **draft**. Re-runnable
(existing article slugs are reused); it refuses an existing course slug.

```bash
npm run publish:course -- content/qa-course/<slug> --apply
```

Publish uploads each article thumbnail + `course.png` to Vercel Blob, sets the
articles to **published + course-only** (hidden from the library grid,
readable by URL and inside the course; `--visibility library` or `keep` to
change that), fills the OG image with the thumbnail, then publishes the course
with its thumbnail and SEO from course.json. Fields already filled in the admin
are never overwritten. The API refuses to publish a course that still has
draft articles; publish does the articles first for that reason.

```bash
npm run sync:article-meta -- content/qa-course/<slug> --apply
```

Sync is only needed when articles already existed (seeded before author/SEO
support, or created manually). It sets the author (default
`DEFAULT_AUTHOR_ID` in `scripts/lib/author.ts`, Agus Budiman; `--author-id`
to override) and the SEO fields, without touching status, visibility, or body.
Works on any content folder, `course.json` not required.

If a dry run fails, read the message and fix the content (usually a category
label or a slug mismatch between course.json and the files), then rerun.

## Phase 6. Link the simulator's reading list

Each simulator phase lists reading material in `learn.resources` of
`public/qa-simulator/config/<projectId>.json`, shown in the simulator's
"Materi" tab as article cards (via `GET /api/qa-library?slugs=`, which also
returns course-only articles). Replace generic `/qa-library` links with the
new articles for every phase the course uses:

```json
{ "label": "<article title>", "url": "/qa-library/<article-slug>" }
```

Edit with a script that keeps the file's indentation and check
`git diff --stat` stays small. Run `npm test`. This is a static file, so it
goes live only after a deploy.

## Phase 7. Wrap up

- Update the course `README.md` status and the QA Course "Content source" line
  in `CLAUDE.md` if anything about the workflow changed.
- After the user has applied everything: they check `/courses/<slug>`, a lesson
  page, and the simulator's Materi tab (the public API is edge-cached about 60s).
- Offer to commit the course folder (+ any script/config changes) on the
  current branch. Leave unrelated uncommitted files out.

## Files involved

| File | Role |
|---|---|
| `scripts/lib/courseContent.ts` | Shared parser: frontmatter, course.json, CLI args |
| `scripts/lib/author.ts` | `DEFAULT_AUTHOR_ID`, author lookup in `users` |
| `scripts/seed-qa-course.ts` | `npm run seed:course` |
| `scripts/publish-qa-course.ts` | `npm run publish:course` |
| `scripts/sync-qa-article-meta.ts` | `npm run sync:article-meta` |
| `scripts/og/course-thumbs.tsx` | `npm run course:thumbs` |
| `src/lib/qaCourseValidation.ts`, `src/lib/qaLibraryValidation.ts` | Same validators the admin and API use |
| `public/qa-simulator/config/*.json` | Missions (`phases`) and reading links (`learn.resources`) |
