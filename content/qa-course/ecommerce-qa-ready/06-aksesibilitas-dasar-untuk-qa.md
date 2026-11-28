---
title: Aksesibilitas Dasar untuk QA
slug: aksesibilitas-dasar-untuk-qa
excerpt: Kontras warna, ukuran area sentuh, dan pesan error bisa dicek QA dalam hitungan menit. Pemeriksaan aksesibilitas yang paling sering menemukan masalah di halaman checkout.
seo_title: Aksesibilitas Dasar untuk QA Web dan Mobile
seo_description: Cek aksesibilitas tanpa alat khusus: kontras warna, ukuran area sentuh, pesan error, label tombol ikon, zoom teks, dan urutan fokus.
category: Design QA
tags: aksesibilitas, accessibility, wcag, kontras warna, ui testing
visibility: library
course: E-commerce QA Ready · Modul 2 (Design Review) · Lesson 3
---

Bayangkan tamu InapYuk yang berusia 60 tahun membuka aplikasi di bawah terik matahari, dengan ukuran font ponsel diperbesar. Tombol Pesan berwarna oranye terang dengan teks putih. Bagi desainer di depan monitor yang bagus, tombol itu terlihat cerah. Bagi tamu ini, teksnya hampir tidak terbaca.

Aksesibilitas sering dianggap pekerjaan khusus yang butuh ahli. Sebagian memang begitu. Tapi beberapa pemeriksaan paling berdampak bisa dilakukan QA dalam hitungan menit, dan sebaiknya masuk ke setiap design review.

Acuannya adalah **WCAG** (Web Content Accessibility Guidelines), standar yang dipakai luas untuk aksesibilitas web dan aplikasi. Kamu tidak perlu hafal semuanya. Mulai dari enam pemeriksaan di bawah.

## 1. Kontras warna

Teks harus cukup kontras dengan latar belakangnya. Target WCAG level AA:

| Jenis | Rasio kontras minimal |
|---|---|
| Teks normal | 4.5:1 |
| Teks besar (± 24px, atau ± 18.5px tebal) | 3:1 |
| Komponen UI dan ikon penting (border input, ikon) | 3:1 |

Cara mengecek: ambil warna hex teks dan latar dari inspect, lalu masukkan ke contrast checker seperti WebAIM Contrast Checker. Chrome DevTools juga menampilkan rasio kontras saat kamu memilih warna di panel Styles.

Warna brand sering jadi masalah. Oranye, kuning, dan hijau muda yang terlihat segar biasanya gagal kontras dengan teks putih. Solusinya bukan mengganti brand, tapi memakai versi yang lebih gelap untuk tombol yang berisi teks. Banyak design system punya token terpisah untuk itu, misalnya "brand" untuk dekorasi dan "action" untuk tombol.

Kalau build memakai warna yang berbeda dari desain dan warna build gagal kontras, itu temuan dengan severity tinggi, bukan sekadar "warna kurang pas".

## 2. Ukuran area sentuh

Jari manusia jauh lebih besar dari kursor. Tombol kecil membuat user salah tekan, terutama tombol yang berdekatan seperti stepper + dan −.

| Acuan | Ukuran minimal |
|---|---|
| WCAG 2.2 (AA) | 24 × 24 px |
| Panduan iOS | 44 × 44 pt |
| Panduan Android (Material) | 48 × 48 dp |

Ikuti angka di design system timmu. Yang penting, cek ukuran **area sentuh**, bukan hanya ikon di dalamnya. Ikon 16px di dalam tombol 44px tidak masalah. Ikon 16px yang menjadi tombol itu sendiri adalah masalah.

## 3. Pesan error

Pesan error yang baik memenuhi tiga syarat:

- **Terlihat di dekat sumbernya.** Error kode promo muncul di bawah field kode, bukan toast di bawah layar yang hilang dalam dua detik.
- **Tidak hanya warna.** Border merah saja tidak cukup untuk user buta warna. Harus ada teks.
- **Menjelaskan cara memperbaikinya.** "Terjadi kesalahan" tidak membantu. "Kode promo tidak ditemukan. Cek lagi penulisannya." membantu.

Untuk pengecekan teknis, inspect field-nya: apakah ada `aria-invalid` dan apakah teks error terhubung lewat `aria-describedby`? Kalau tidak, pembaca layar tidak akan membacakan error-nya.

## 4. Label pada tombol ikon

Tombol yang hanya berisi ikon (tutup, kembali, tambah, kurang) harus punya label untuk pembaca layar. Cek dengan inspect: ada `aria-label` atau teks tersembunyi? Tombol × tanpa label akan dibacakan sebagai "button", tanpa keterangan apa pun.

## 5. Teks diperbesar dan zoom

Banyak user memperbesar ukuran font di pengaturan ponsel. Coba:

- Zoom browser ke 200%. Konten masih terbaca tanpa harus scroll ke samping?
- Di ponsel, perbesar ukuran font sistem. Teks terpotong, bertumpuk, atau keluar dari tombol?

Halaman ringkasan harga paling sering rusak di sini, karena angka panjang dan label berdampingan dalam satu baris.

## 6. Urutan fokus dan keyboard

Di web, tekan Tab dari awal halaman. Fokus harus bergerak dengan urutan yang masuk akal, terlihat jelas (ada outline), dan tidak terjebak. Bottom sheet atau modal yang terbuka harus menahan fokus di dalamnya, dan mengembalikan fokus ke tombol asal saat ditutup.

## Menulis temuan aksesibilitas

Pakai format yang sama dengan temuan design review, ditambah angka acuan:

> **Frame:** Ringkasan booking
> **Elemen:** Tombol Pesan
> **Kategori:** Aksesibilitas
> **Di desain:** fill #B45309, kontras teks putih 5.0:1 (lolos AA)
> **Di build:** fill #F59E0B, kontras teks putih 2.1:1 (gagal AA 4.5:1)
> **Severity:** High

Menyebut angka rasio dan standarnya membuat temuan sulit dibantah dan mudah diverifikasi ulang.

## Checklist aksesibilitas cepat

- [ ] Teks utama dan teks tombol lolos kontras 4.5:1
- [ ] Area sentuh tombol memenuhi ukuran minimal design system
- [ ] Error tampil inline, berupa teks, dan menjelaskan cara memperbaiki
- [ ] Tombol ikon punya label
- [ ] Halaman masih terbaca di zoom 200% dan font sistem besar
- [ ] Urutan fokus masuk akal dan terlihat

## Ringkasan

- Beberapa pemeriksaan aksesibilitas paling berdampak bisa dilakukan QA dalam hitungan menit.
- Kontras 4.5:1 untuk teks normal, 3:1 untuk teks besar dan komponen UI. Warna brand terang sering gagal.
- Cek area sentuh, bukan ukuran ikon. Error harus inline, berupa teks, dan membantu.
- Tombol ikon butuh label, dan halaman harus tetap terbaca saat teks diperbesar.
- Tampilan sudah dicek. Modul berikutnya masuk ke logika di baliknya: menguji aturan promo dengan decision table.
