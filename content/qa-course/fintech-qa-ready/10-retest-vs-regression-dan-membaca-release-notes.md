---
title: Retest vs Regression, dan Membaca Release Notes
slug: retest-vs-regression-dan-membaca-release-notes
excerpt: Bug sudah di-fix bukan berarti selesai. Pelajari beda retest dan regression, serta cara membaca release notes dengan curiga untuk menemukan area yang ikut tersentuh perubahan.
seo_title: Retest vs Regression Testing dan Release Notes
seo_description: Beda retest dan regression testing, cara membaca release notes untuk menemukan area yang tersentuh, dan cara membedakan bug regresi dari bug baru.
category: QA Fundamentals
tags: regression testing, retest, release notes, qa intermediate
visibility: library
course: Fintech QA Ready · Modul 4 (Regression) · Lesson 1
---

Developer mengirim pesan: "Semua bug sudah di-fix di build baru, tolong dicek ya." Godaan terbesarnya adalah membuka daftar bug, mencoba langkah reproduksi satu per satu, menandai semuanya *closed*, lalu bilang siap rilis.

Itu baru setengah pekerjaan. Kamu sudah memastikan bug lama hilang, tapi belum memastikan perbaikan itu tidak merusak hal lain. Dua aktivitas ini punya nama berbeda: **retest** dan **regression**.

## Retest: memastikan bug benar-benar beres

Retest (kadang disebut confirmation testing) adalah menjalankan ulang langkah reproduksi bug yang sudah di-fix untuk memastikan bug tersebut tidak muncul lagi.

Retest yang baik tidak berhenti di langkah reproduksi asli. Perbaikan sering hanya menutup satu jalan, sementara jalan lain menuju bug yang sama masih terbuka. Tambahkan variasi:

| Bug asli | Langkah asli | Variasi untuk retest |
|---|---|---|
| Jumlah 5 kursi diterima padahal maksimal 4 | Kirim 5 kursi | Kirim 6 kursi, 4 kursi (harus tetap diterima), kursi duplikat dalam satu pesanan |
| Pesanan kedaluwarsa masih bisa dibayar | Bayar setelah batas waktu | Bayar tepat di batas waktu, bayar lewat endpoint lain, cek tampilan UI |
| Total salah untuk 3 tiket | Pesan 3 tiket | Pesan 1, 2, dan 4 tiket |

Perhatikan kolom variasi selalu menyertakan **nilai yang seharusnya tetap berhasil**. Perbaikan yang terlalu ketat juga bug: setelah fix, bisa saja pesanan 4 kursi ikut ditolak.

Hasil retest dicatat di bug report masing-masing: build yang dipakai, apa yang dicoba, dan hasilnya. Kalau bug masih muncul, buka kembali (*reopen*) dengan bukti baru, jangan membuat laporan duplikat.

## Regression: memastikan yang dulu jalan tidak rusak

Regression testing adalah menguji fitur yang sebelumnya sudah berjalan, untuk memastikan perubahan baru tidak merusaknya. Bug yang muncul di fitur lama karena perubahan baru disebut **bug regresi**.

Bug regresi sering muncul di tempat yang tidak disangka, karena kode di aplikasi saling terhubung. Perubahan pada satu komponen bersama bisa merambat ke banyak layar.

| | Retest | Regression |
|---|---|---|
| Pertanyaan | Apakah bug ini sudah hilang? | Apakah ada yang rusak karena perubahan ini? |
| Yang diuji | Bug yang di-fix | Fitur lama di sekitar perubahan |
| Sumber test | Bug report | Regression suite dan analisis perubahan |
| Kalau gagal | Reopen bug lama | Laporkan bug baru, tandai sebagai regresi |

## Membaca release notes dengan curiga

Release notes (atau catatan rilis, changelog) adalah peta untuk menentukan apa yang harus diretest dan di mana regression perlu difokuskan. Bacalah dengan sikap curiga yang sehat. Release notes ditulis oleh orang yang sibuk, dan yang tidak ditulis sering lebih penting daripada yang ditulis.

Pisahkan isinya ke empat kelompok:

1. **Perbaikan bug.** Masuk daftar retest.
2. **Fitur baru.** Perlu diuji sebagai fitur baru, dan dicek dampaknya ke fitur lama di sekitarnya.
3. **Belum termasuk.** Bug yang belum di-fix di build ini. Jangan diretest, tapi pastikan statusnya jelas di laporan.
4. **Area yang tersentuh.** Kalau ada, ini panduan utama untuk regression. Kalau tidak ada, tanyakan ke developer.

Lalu cari tanda bahaya:

- **Perubahan komponen bersama.** Misalnya "pemilih tanggal diperbarui". Pemilih tanggal di TiketJalan dipakai di halaman cari jadwal, ubah jadwal, dan filter riwayat. Ketiganya perlu dicek walau release notes hanya menyebut satu.
- **Perubahan validasi atau format.** Aturan validasi baru di satu tempat bisa membuat data lama yang sebelumnya valid jadi ditolak.
- **Kalimat kabur.** "Perbaikan minor", "peningkatan performa", "refactor". Tanyakan apa persisnya yang berubah.
- **Fitur baru di halaman yang sama dengan alur utama.** Menambah tombol atau field di halaman pembayaran bisa mengganggu alur pembayaran itu sendiri.

## Bug regresi, bug baru, atau bug lama?

Saat menemukan masalah di build baru, tentukan jenisnya sebelum melapor:

| Jenis | Ciri | Cara menandai |
|---|---|---|
| Bug lama belum beres | Bug yang sama dengan laporan sebelumnya | Reopen laporan lama |
| Bug regresi | Fitur ini jalan di build sebelumnya, rusak di build ini | Laporan baru, label *regression*, sebut build terakhir yang masih benar |
| Bug baru | Ada di fitur baru, atau belum pernah dites sebelumnya | Laporan baru seperti biasa |
| Bug lama yang baru ketahuan | Sudah ada di build sebelumnya, hanya belum ditemukan | Laporan baru, jelaskan bahwa bukan regresi |

Pembedaan ini penting. Bug regresi menandakan perubahan baru berisiko, dan biasanya memengaruhi keputusan rilis lebih besar daripada bug lama yang baru ketahuan.

## Contoh: release notes TiketJalan rc2

> **Build 2.8.0-rc2**
> Perbaikan: BK-12 maksimal kursi tidak divalidasi, BK-15 pesanan kedaluwarsa masih bisa dibayar, BK-17 biaya layanan dihitung per tiket.
> Fitur baru: pemilih tanggal baru dengan tampilan kalender penuh. Pilihan "Penumpang favorit" saat mengisi data.
> Belum termasuk: BK-19 (pesan error tidak sesuai PRD).

Hasil pembacaan:

- **Retest:** BK-12, BK-15, BK-17, masing-masing dengan variasi.
- **Tidak diretest:** BK-19, catat sebagai known issue.
- **Fitur baru:** pemilih tanggal dan penumpang favorit diuji sebagai fitur baru.
- **Regression:** semua halaman yang memakai pemilih tanggal. Halaman isi data penumpang dan alur pembayaran setelahnya, karena ada elemen baru di sana. Perhitungan total di semua jumlah tiket, karena BK-17 mengubah rumus.
- **Pertanyaan ke developer:** apakah pemilih tanggal baru juga dipakai di aplikasi admin operator?

## Ringkasan

- Retest memastikan bug yang di-fix benar-benar hilang. Tambahkan variasi, termasuk nilai yang harus tetap berhasil.
- Regression memastikan fitur lama tidak rusak karena perubahan.
- Baca release notes dalam empat kelompok: perbaikan, fitur baru, belum termasuk, dan area tersentuh.
- Curigai perubahan komponen bersama, validasi, format, dan kalimat kabur.
- Bedakan bug lama, bug regresi, bug baru, dan bug lama yang baru ketahuan sebelum melapor.
