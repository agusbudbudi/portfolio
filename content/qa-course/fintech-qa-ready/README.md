# Fintech QA Ready: konten course

Source artikel untuk course kedua (level intermediate, lanjutan dari
**Junior QA Ready**). File ini tidak dirender oleh aplikasi; artikel dimasukkan
manual lewat admin.

Status: semua 12 artikel selesai ditulis. Siap dimasukkan ke admin.

## Cara memasukkan ke database (script)

`course.json` berisi metadata course + urutan artikel dan misi. Script membuat
12 artikel dan course-nya sebagai **draft**:

Dry run (tidak menulis apa-apa):

```bash
npm run seed:course -- content/qa-course/fintech-qa-ready
```

Tulis ke Turso:

```bash
npm run seed:course -- content/qa-course/fintech-qa-ready --apply
```

Kategori dicocokkan dari `category` di frontmatter (tanpa "(pilih di admin)")
ke label kategori QA Library. Kategori yang belum ada dibuat otomatis (deskripsi
dari `categories` di `course.json`).

Publish (unggah thumbnail dari `thumbnails/` ke Blob, artikel jadi published +
**course-only**, lalu course jadi published dengan thumbnail `thumbnails/course.png` dan SEO dari
`course.json`):

```bash
npm run publish:course -- content/qa-course/fintech-qa-ready
```

```bash
npm run publish:course -- content/qa-course/fintech-qa-ready --apply
```

Thumbnail dibuat ulang dengan `npm run course:thumbs -- content/qa-course/fintech-qa-ready`.
Pakai `--visibility library` kalau artikel juga mau tampil di grid QA Library.

Author (ditautkan ke user Agus Budiman) dan SEO (`seo_title`, `seo_description` di
frontmatter, OG image = thumbnail) disinkronkan ke artikel yang sudah ada dengan:

```bash
npm run sync:article-meta -- content/qa-course/fintech-qa-ready --apply
```

## Cara memasukkan ke admin (manual)

1. `/dashboard/qa-library` → **Tambah Artikel**.
2. Salin `title`, `slug`, `excerpt`, dan `tags` dari frontmatter. Pilih kategori yang paling dekat (saran ada di `category`).
3. Salin isi markdown di bawah frontmatter ke editor konten.
4. Unggah thumbnail (wajib sebelum publish), pilih **Tampil di: QA Library**, lalu publish.
5. Setelah semua artikel modul ada, buka `/dashboard/qa-courses` dan susun course-nya.

## Positioning

- **Untuk siapa:** sudah paham dasar (PRD, test case, bug report) dari Junior QA
  Ready atau pengalaman 0 sampai 1 tahun. Course ini tidak mengulang materi itu;
  kalau perlu, artikel cukup menautkan ke artikel course pertama.
- **Fokus:** fitur yang menyangkut uang. Berpikir berbasis risiko, test plan,
  API testing, regression, dan sign-off rilis.
- **Praktik:** project QA Simulator **DompetKu** (`ewallet`, intermediate, ±6 jam).
- **Domain contoh di artikel:** aplikasi pemesanan tiket bus fiktif
  **"TiketJalan"** (booking kursi, pembayaran VA, refund, kuota). Sengaja bukan
  e-wallet supaya jawaban misi DompetKu tidak bocor, tapi tetap punya uang,
  batas, status transaksi, dan idempotency.

## Struktur course

| Modul | Artikel | Misi |
|---|---|---|
| 1. Requirement | 01 Membaca PRD Fitur Uang dengan Kacamata Risiko · 02 Kasus Gagal yang Sering Hilang dari PRD · 03 Menulis Ringkasan Pemahaman Fitur | `ewallet` / `requirement-analysis` |
| 2. Test Plan | 04 Test Plan Satu Halaman · 05 Risk-Based Testing: Likelihood × Impact · 06 Entry/Exit Criteria dan Memilih Level Pengujian | `ewallet` / `test-plan` |
| 3. API Testing | 07 Dasar HTTP untuk QA · 08 Menyusun API Test Case · 09 Idempotency, Side Effect, dan Bug Report API | `ewallet` / `api-testing` |
| 4. Regression | 10 Retest vs Regression, dan Membaca Release Notes · 11 Memilih Regression Suite · 12 Release Sign-off yang Bisa Dipertanggungjawabkan | `ewallet` / `regression` |

Pemetaan ke assignment simulator (supaya tiap artikel benar-benar menyiapkan misi):

| Assignment | Disiapkan oleh |
|---|---|
| `rq-gaps` (gap + pertanyaan klarifikasi) | 01, 02 |
| `rq-summary` (ringkasan pemahaman) | 03 |
| `tp-scope` (scope & strategi) | 04, 06 |
| `tp-risks` (analisis risiko) | 05 |
| `api-cases` (API test case) | 07, 08 |
| `api-bugs` (bug report API) | 09 |
| `rg-suite` (regression suite) | 10, 11 |
| `rg-bugs` (bug regresi) | 10 |
| `rg-signoff` (Go / No-Go) | 12 |

## Intro modul (salin ke field "Intro" di editor course)

**Modul 1. Requirement**
Fitur yang menyentuh uang punya standar lebih tinggi. Di modul ini kamu belajar
membaca PRD dengan kacamata risiko: batas angka, kasus gagal, keamanan,
transaksi dobel, dan regulasi. Di akhir modul, kamu mereview PRD Top Up &
Transfer DompetKu.

**Modul 2. Test Plan**
Waktu uji selalu terbatas, jadi kamu harus memilih. Di modul ini kamu belajar
menulis test plan satu halaman, menilai risiko dengan likelihood × impact, dan
menentukan level pengujian untuk tiap area. Di akhir modul, kamu menyusun test
plan DompetKu.

**Modul 3. API Testing**
Banyak bug fitur uang lebih cepat ketahuan di level API. Di modul ini kamu
belajar membaca kontrak API, menyusun API test case, mengecek side effect dan
idempotency, lalu menulis bug report API yang bisa direproduksi. Di akhir modul,
kamu menguji API DompetKu langsung di API Console.

**Modul 4. Regression**
Bug sudah di-fix, fitur baru ikut masuk. Di modul ini kamu belajar membedakan
retest dan regression, memilih regression suite berdasarkan perubahan, lalu
memberi sign-off rilis yang tegas. Di akhir modul, kamu menguji build rc2
DompetKu dan memutuskan Go / No-Go.

## Catatan penulisan

- Bahasa Indonesia santai-profesional, sama dengan course pertama. Tanpa em-dash.
- Panjang target ±5.000 sampai 6.500 karakter per artikel, seperti course pertama.
- Tiap artikel ditutup bagian **"Checklist"** atau **"Latihan singkat"** yang
  memakai TiketJalan, bukan DompetKu.
- Jangan menyebut angka/aturan spesifik dari PRD DompetKu (misal batas Rp 2 juta,
  lock PIN 3x) supaya misi tetap jadi tantangan.
