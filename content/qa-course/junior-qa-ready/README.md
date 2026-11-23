# Junior QA Ready: konten course

Source artikel untuk course pertama. File ini bukan dirender oleh aplikasi;
artikel dimasukkan manual lewat admin.

## Cara memasukkan ke admin

1. `/dashboard/qa-library` → **Tambah Artikel**.
2. Salin `title`, `slug`, `excerpt`, dan `tags` dari frontmatter. Pilih kategori yang paling dekat (saran ada di `category`).
3. Salin isi markdown di bawah frontmatter ke editor konten.
4. Unggah thumbnail (wajib sebelum publish), pilih **Tampil di: QA Library**, lalu publish.
5. Setelah semua artikel modul ada, buka `/dashboard/qa-courses` dan susun course-nya.

## Struktur course

Praktik memakai project QA Simulator **SplitBill** (beginner). Contoh di artikel
sengaja memakai domain lain (voucher ongkir di aplikasi pesan antar fiktif
"PesanAja") supaya jawaban misi tidak bocor.

| Modul | Artikel | Misi |
|---|---|---|
| 1. Requirement | 01 Cara Membaca PRD sebagai QA · 02 Menulis Pertanyaan Klarifikasi · 03 Acceptance Criteria yang Bisa Dites | `splitbill` / `requirement-analysis` |
| 2. Test Design | 04 Test Scenario vs Test Case · 05 Equivalence Partitioning dan Boundary Value Analysis · 06 Menulis Test Case yang Jelas | `splitbill` / `test-design` |
| 3. Bug Hunting | 07 Exploratory Testing dengan Charter · 08 Anatomi Bug Report yang Baik · 09 Severity vs Priority, dan Rekomendasi Go / No-Go | `splitbill` / `bug-hunting` |

## Intro modul (salin ke field "Intro" di editor course)

**Modul 1. Requirement**
Sebelum ada kode, QA sudah bisa mencegah bug. Di modul ini kamu belajar membaca
PRD, menemukan bagian yang belum jelas, dan menulis pertanyaan yang langsung
bisa dijawab PM. Di akhir modul, kamu praktik mereview PRD fitur baru SplitBill.

**Modul 2. Test Design**
Requirement yang sudah jelas siap diubah jadi rencana pengujian. Di modul ini
kamu belajar membedakan scenario dan test case, memilih data uji dengan teknik
EP, BVA, dan decision table, lalu menulis test case yang bisa dijalankan siapa
saja. Di akhir modul, kamu menyusun scenario dan test case untuk SplitBill.

**Modul 3. Bug Hunting**
Saatnya mengeksekusi. Di modul ini kamu belajar exploratory testing yang
terarah, menulis bug report yang bisa langsung direproduksi, menentukan
severity dan priority, lalu memberi rekomendasi Go / No-Go. Di akhir modul,
kamu berburu bug di SplitBill staging dan menulis test summary untuk PM.

## Thumbnail & SEO course (script)

`course.json` mencerminkan course yang sudah ada di DB (dipakai untuk gambar dan
SEO, bukan untuk seed ulang). Thumbnail course ada di `thumbnails/course.png`
(dibuat dengan `npm run course:thumbs -- content/qa-course/junior-qa-ready --course`).

Pasang thumbnail + SEO course tanpa mengubah visibility artikel (tetap tampil di library):

```bash
npm run publish:course -- content/qa-course/junior-qa-ready --visibility keep --apply
```
