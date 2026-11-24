// Seed Feedback Checkpoint content for a course from <content-dir>/feedback.json:
// questions into the shared bank, flows that order them, and (with --attach)
// one checkpoint at the end of each module listed in `checkpoints.moduleEnd`.
//
// Idempotent: a question whose prompt already exists in the bank is reused, a
// flow whose name already exists is reused (neither is overwritten; edit those
// in /dashboard/feedback), and a module that already has a checkpoint for the
// same flow is left alone.
//
// Usage (dry run by default, prints what would be written):
//   npm run seed:feedback -- content/qa-course/junior-qa-ready
//   npm run seed:feedback -- content/qa-course/junior-qa-ready --apply
//   npm run seed:feedback -- content/qa-course/junior-qa-ready --attach --apply
//
// --attach edits the course row. Only use it once the Feedback Checkpoint code
// is deployed: older builds read any non-article item as a mission.
//
// Reads TURSO_DATABASE_URL / TURSO_AUTH_TOKEN from .env.local.
import fs from 'node:fs';
import path from 'node:path';
import { createFlow, createQuestion, listFlows, listQuestions } from '../api/_lib/feedbackStore.js';
import { readQaCourseBySlug, updateQaCourse } from '../api/_lib/qaCourseStore.js';
import { validateFeedbackFlow, validateFeedbackQuestion } from '../src/lib/feedbackValidation.js';
import { validateQaCourseData } from '../src/lib/qaCourseValidation.js';
import type { FeedbackQuestionConfig, FeedbackQuestionType } from '../src/types/feedback.js';
import type { QaCourseData, QaCourseModule } from '../src/types/qaCourse.js';
import { parseCliArgs } from './lib/courseContent.js';

interface SeedFile {
  questions: { key: string; type: FeedbackQuestionType; prompt: string; helpText?: string; config: FeedbackQuestionConfig }[];
  flows: { key: string; name: string; title: string; intro?: string; askConsent: boolean; items: { question: string; required: boolean }[] }[];
  checkpoints?: { course: string; moduleEnd: (string | null)[] };
}

const USAGE = 'Usage: seed-course-feedback <content-dir> [--apply] [--attach]';
const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12);

async function main() {
  const cli = parseCliArgs(process.argv.slice(2), { '--apply': 'bool', '--attach': 'bool' }, USAGE);
  const apply = cli.bool.has('--apply');
  const attach = cli.bool.has('--attach');
  const file = path.resolve(cli.dir, 'feedback.json');
  if (!fs.existsSync(file)) throw new Error(`${file} tidak ada`);
  const seed = JSON.parse(fs.readFileSync(file, 'utf8')) as SeedFile;
  console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${path.relative(process.cwd(), file)}${attach ? ' (+ attach ke course)' : ''}\n`);

  // ---- questions ----
  const bank = await listQuestions();
  const questionIds = new Map<string, string>();
  console.log('Bank pertanyaan:');
  for (const q of seed.questions) {
    const check = validateFeedbackQuestion({ type: q.type, prompt: q.prompt, helpText: q.helpText, config: q.config, status: 'active' });
    if (!check.ok) throw new Error(`Pertanyaan "${q.key}": ${check.errors.join(' ')}`);
    const existing = bank.find((b) => !b.isSystem && b.prompt.trim() === q.prompt.trim());
    if (existing) {
      questionIds.set(q.key, existing.id);
      const same = existing.type === q.type && JSON.stringify(existing.config) === JSON.stringify(check.question.config);
      console.log(`  = ${q.key}: sudah ada (${existing.id})${same ? '' : ' [beda tipe/config dari feedback.json, tidak diubah]'}`);
    } else if (apply) {
      const created = await createQuestion(check.question);
      questionIds.set(q.key, created.id);
      console.log(`  + ${q.key}: dibuat (${created.id})`);
    } else {
      questionIds.set(q.key, `<baru:${q.key}>`);
      console.log(`  + ${q.key}: akan dibuat [${q.type}] ${q.prompt}`);
    }
  }

  // ---- flows ----
  const flows = await listFlows();
  const flowIds = new Map<string, string>();
  console.log('\nFlow:');
  for (const f of seed.flows) {
    const items = f.items.map((it) => {
      const id = questionIds.get(it.question);
      if (!id) throw new Error(`Flow "${f.key}": pertanyaan "${it.question}" tidak ada di feedback.json`);
      return { questionId: id, required: it.required };
    });
    const existing = flows.find((x) => x.name.trim() === f.name.trim());
    if (existing) {
      flowIds.set(f.key, existing.id);
      console.log(`  = ${f.key}: "${f.name}" sudah ada (${existing.id}, ${existing.status})`);
      continue;
    }
    const data = { name: f.name, title: f.title, intro: f.intro, status: 'active', items, askConsent: f.askConsent };
    if (!apply) {
      flowIds.set(f.key, `<baru:${f.key}>`);
      console.log(`  + ${f.key}: akan dibuat "${f.name}" (${items.length} pertanyaan${f.askConsent ? ' + consent' : ''}, active)`);
      continue;
    }
    const check = validateFeedbackFlow(data);
    if (!check.ok) throw new Error(`Flow "${f.key}": ${check.errors.join(' ')}`);
    const created = await createFlow(check.flow);
    flowIds.set(f.key, created.id);
    console.log(`  + ${f.key}: dibuat "${f.name}" (${created.id})`);
  }

  // ---- checkpoints ----
  if (!seed.checkpoints) return;
  const { course: slug, moduleEnd } = seed.checkpoints;
  const course = await readQaCourseBySlug(slug);
  if (!course) throw new Error(`Course "${slug}" tidak ada`);
  if (moduleEnd.length > course.modules.length) throw new Error(`checkpoints.moduleEnd punya ${moduleEnd.length} entri, course cuma ${course.modules.length} modul`);
  console.log(`\nCheckpoint di "${course.title}"${attach ? '' : ' (preview, jalankan dengan --attach untuk memasang)'}:`);

  let changed = false;
  const modules: QaCourseModule[] = course.modules.map((mod, i) => {
    const key = moduleEnd[i];
    if (!key) return mod;
    const flowId = flowIds.get(key);
    if (!flowId) throw new Error(`checkpoints.moduleEnd[${i}]: flow "${key}" tidak ada di feedback.json`);
    if (mod.items.some((it) => it.kind === 'feedback' && it.flowId === flowId)) {
      console.log(`  = Modul ${i + 1} ${mod.title}: sudah ada checkpoint "${key}"`);
      return mod;
    }
    changed = true;
    console.log(`  + Modul ${i + 1} ${mod.title}: checkpoint "${key}" di akhir modul (setelah ${mod.items.length} item)`);
    return { ...mod, items: [...mod.items, { id: newId(), kind: 'feedback', flowId }] };
  });

  if (!attach || !changed) return;
  if (!apply) { console.log('\nDry run: course tidak diubah.'); return; }
  const { id, slug: s, createdAt: _c, updatedAt, ...rest } = course;
  void _c;
  const data: QaCourseData = { ...rest, modules };
  const check = validateQaCourseData(data);
  if (!check.ok) throw new Error(`Course tidak valid: ${check.errors.join(' ')}`);
  const result = await updateQaCourse(id, s, check.course, updatedAt);
  if (!result.ok) throw new Error(`Gagal menyimpan course: ${result.reason}`);
  console.log('\nCourse tersimpan.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
