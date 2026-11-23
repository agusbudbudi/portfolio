---
title: Entry/Exit Criteria dan Memilih Level Pengujian
slug: entry-exit-criteria-dan-level-pengujian
excerpt: Kapan QA boleh mulai menguji dan kapan dianggap selesai? Pelajari cara menulis entry dan exit criteria yang terukur, serta memilih level pengujian yang tepat untuk tiap area.
seo_title: Entry & Exit Criteria dan Memilih Level Pengujian
seo_description: Cara menulis entry dan exit criteria yang terukur, memahami test pyramid, dan memilih kapan menguji di level API, UI, atau end-to-end.
category: Test Planning
tags: entry criteria, exit criteria, test pyramid, api testing, test management
visibility: library
course: Fintech QA Ready · Modul 2 (Test Plan) · Lesson 3
---

Dua situasi ini sering terjadi di sprint:

1. QA mulai menguji, lalu setengah hari habis karena build belum ter-deploy dengan benar, API belum siap, atau data uji belum ada.
2. Menjelang rilis, PM bertanya "QA sudah selesai?" dan jawabannya "ya... kurang lebih", karena tidak ada definisi selesai yang disepakati.

Entry dan exit criteria mencegah keduanya. Artikel ini juga membahas satu keputusan penting di test plan: di level mana setiap area sebaiknya diuji.

## Entry criteria: syarat untuk mulai

Entry criteria adalah daftar kondisi yang harus terpenuhi sebelum pengujian dimulai. Tujuannya bukan menolak bekerja, tapi memastikan waktu QA tidak terbuang menunggu atau menguji sesuatu yang belum siap.

Contoh entry criteria yang umum:

- Build dengan versi yang disepakati sudah ter-deploy di staging.
- Smoke test lulus: aplikasi bisa dibuka, login berhasil, halaman utama fitur bisa diakses.
- Dokumentasi API (kontrak endpoint) tersedia dan sesuai build.
- Data uji sudah disiapkan sesuai test plan.
- Semua pertanyaan klarifikasi berprioritas tinggi sudah dijawab.

Kalau salah satu tidak terpenuhi, kamu punya dasar untuk bilang "Pengujian belum bisa dimulai karena X", bukan sekadar "belum siap".

## Exit criteria: definisi selesai

Exit criteria adalah kondisi yang harus terpenuhi agar pengujian dianggap cukup. Kata kuncinya **terukur**. Bandingkan:

| Tidak terukur | Terukur |
|---|---|
| Fitur sudah dites dengan baik | 100% test case prioritas tinggi sudah dijalankan |
| Tidak ada bug besar | 0 bug critical dan high berstatus open |
| Kualitas cukup | Semua bug medium yang tersisa punya keputusan tertulis dari PM (fix atau rilis dengan known issue) |
| Sudah regression | Regression suite area pembayaran lulus di build kandidat rilis |

Exit criteria yang terukur membuat percakapan menjelang rilis jauh lebih mudah. Kamu tidak perlu berdebat soal perasaan. Cukup tunjukkan kriteria mana yang sudah dan belum terpenuhi.

Satu hal penting: exit criteria adalah **dasar** rekomendasi rilis, bukan pengganti keputusan. Kadang tim memutuskan rilis walau satu kriteria belum terpenuhi, dengan mitigasi tertentu. Itu sah selama keputusannya sadar dan tercatat. Topik ini dibahas di lesson terakhir course.

## Level pengujian

Satu fitur bisa diuji di beberapa level. Masing-masing punya kekuatan berbeda.

| Level | Yang diuji | Biasanya dikerjakan | Kekuatan |
|---|---|---|---|
| Unit | Fungsi atau komponen kecil | Developer | Cepat, sangat presisi |
| API | Endpoint: request dan response | QA dan developer | Cepat, bisa menguji aturan bisnis tanpa UI |
| UI | Layar, interaksi, pesan | QA | Melihat yang benar-benar dilihat user |
| End-to-end | Alur lengkap lintas sistem | QA | Membuktikan semua bagian bekerja bersama |
| Regression | Fitur lama setelah perubahan | QA (sering diotomasi) | Mencegah yang dulu jalan jadi rusak |

### Test pyramid

Test pyramid menggambarkan proporsi yang sehat: banyak test di level bawah (unit), lebih sedikit di tengah (API), dan paling sedikit di atas (UI dan end-to-end). Alasannya, test di level bawah lebih cepat, lebih murah dirawat, dan lebih mudah menunjuk sumber masalah.

Untuk QA, pelajaran praktisnya: **jangan menguji semua aturan bisnis lewat UI.** Kalau aturan "maksimal 4 tiket per transaksi" bisa dibuktikan dengan satu request API, mengujinya lewat UI dengan mengklik lima kursi berulang kali hanya membuang waktu. Cukup satu atau dua cek UI untuk memastikan pesan dan tampilannya benar.

### Kapan API lebih efisien?

API testing lebih efisien untuk:

- **Validasi input:** nilai batas, tipe data salah, field kosong. UI sering mencegah input aneh, padahal server tetap harus menolaknya.
- **Aturan bisnis dan perhitungan:** total, biaya, batas harian.
- **Keamanan:** request tanpa token, token milik user lain.
- **Aksi ganda dan bersamaan:** mengirim request yang sama dua kali dengan presisi.

UI testing tetap wajib untuk:

- Alur utama dari sudut pandang user.
- Pesan error, empty state, dan loading.
- Hal yang hanya ada di UI: format angka, tombol nonaktif, navigasi.

## Contoh pemetaan level uji TiketJalan

Gabungkan tabel risiko dari lesson sebelumnya dengan level pengujian:

| Area | Risiko | API | UI | E2E | Catatan |
|---|---|---|---|---|---|
| Tagihan ganda (aksi ganda) | Tinggi | Ya | Ya | | API untuk request ganda, UI untuk cek tombol nonaktif setelah ditekan |
| Kursi terjual dua kali | Tinggi | Ya | | | Dua request bersamaan, hanya bisa presisi di API |
| Konfirmasi bank terlambat | Tinggi | Ya | | Ya | Simulasi callback bank di staging |
| Total dan biaya layanan | Tinggi | Ya | Ya | | Kombinasi jumlah tiket di API, tampilan total di UI |
| Pesan error | Rendah | | Ya | | Cek cepat sesuai PRD |
| Riwayat pesanan | Sedang | Ya | Ya | | Status kedaluwarsa tampil dengan benar |

Tabel ini masuk ke bagian **pendekatan** di test plan. Dengan begitu, siapa pun yang membaca test plan tahu bukan hanya apa yang dites, tapi juga di level mana dan kenapa.

## Checklist melengkapi test plan

- [ ] Entry criteria ditulis dan bisa dicek ya atau tidak.
- [ ] Exit criteria terukur: memakai angka, status bug, atau hasil suite.
- [ ] Setiap area berisiko tinggi diuji di lebih dari satu level.
- [ ] Aturan bisnis dan validasi diuji di level API, bukan hanya lewat UI.
- [ ] UI tetap dicek untuk alur utama dan pesan yang dilihat user.
- [ ] Pemetaan level uji punya catatan alasan.

## Ringkasan

- Entry criteria mencegah waktu QA terbuang karena build, API, atau data belum siap.
- Exit criteria yang terukur membuat jawaban "QA sudah selesai?" jelas dan bisa dibuktikan.
- Pilih level pengujian sesuai kekuatannya: API untuk aturan bisnis, validasi, keamanan, dan aksi ganda. UI untuk pengalaman user.
- Area berisiko tinggi layak diuji di beberapa level.
- Modul berikutnya masuk ke praktik API testing, dimulai dari dasar HTTP.
