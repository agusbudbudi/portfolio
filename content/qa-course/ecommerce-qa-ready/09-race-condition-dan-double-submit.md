---
title: Menguji Race Condition dan Double Submit
slug: race-condition-dan-double-submit
excerpt: Bug yang hanya muncul saat dua hal terjadi hampir bersamaan bisa dites manual. Teknik praktis untuk klik dobel, dua tab, kuota yang habis, dan cara melaporkannya.
seo_title: Cara Menguji Race Condition dan Double Submit
seo_description: Teknik menguji race condition secara manual: klik dobel, dua tab, jaringan lambat, data uji staging, dan request paralel. Plus format bug report-nya.
category: QA Fundamentals
tags: race condition, double submit, konkurensi, bug report, exploratory testing
visibility: library
course: E-commerce QA Ready · Modul 3 (Voucher Testing) · Lesson 3
---

"Tidak bisa direproduksi." Itu respons paling umum untuk bug race condition. Bug-nya muncul sekali, saat dua hal terjadi hampir bersamaan, lalu menghilang. Developer mencoba, tidak muncul, dan tiket ditutup.

Padahal bug race condition termasuk yang paling mahal saat kampanye: booking dobel, kamar terakhir terjual dua kali, promo terpakai melebihi kuota. Kabar baiknya, sebagian besar bisa diuji dan direproduksi dengan teknik sederhana, tanpa alat load test.

## Apa itu race condition

Race condition terjadi ketika hasil sebuah proses bergantung pada **urutan atau waktu** kejadian yang tidak dikendalikan. Contoh klasik di InapYuk:

1. Tamu A mengecek: kamar promo tersisa 1. Lolos.
2. Tamu B mengecek: kamar promo tersisa 1. Lolos.
3. Tamu A membuat booking. Stok menjadi 0.
4. Tamu B membuat booking. Stok menjadi −1.

Kedua pengecekan benar pada saatnya. Masalahnya ada di **jarak** antara cek dan aksi. Pola yang sama berlaku untuk kuota promo dan klik dobel.

## Teknik 1: Klik dobel dan tekan cepat

Teknik paling sederhana, dan paling sering menemukan bug.

- Tekan tombol aksi (Pesan, Bayar, Pakai) **dua kali secepat mungkin**. Di desktop, double click. Di ponsel, ketuk dua kali dengan cepat.
- Perhatikan kapan tombol berubah jadi nonaktif atau loading. Kalau perubahan itu terlambat sepersekian detik, ada jendela waktu untuk klik kedua.
- Cek hasilnya di tempat lain: daftar booking, riwayat, email konfirmasi. Halaman sukses bisa saja hanya menampilkan satu, padahal dua booking dibuat.

Ulangi beberapa kali. Race condition tidak selalu muncul di percobaan pertama.

## Teknik 2: Jaringan lambat

Jendela waktu antara cek dan aksi makin lebar saat jaringan lambat. Di Chrome DevTools, tab **Network**, pilih throttling **Slow 3G** (atau buat profil custom). Lalu:

- Tekan tombol aksi, tunggu sebentar, tekan lagi saat request pertama belum selesai.
- Tekan tombol, lalu tekan tombol kembali browser, lalu ulangi aksinya.
- Matikan jaringan saat request sedang berjalan, nyalakan lagi, lalu lihat apakah aplikasi mengirim ulang.

## Teknik 3: Dua tab atau dua perangkat

Untuk konflik antar sesi:

- Buka halaman booking yang sama di **dua tab** dengan akun yang sama. Pakai promo di tab pertama sampai selesai, lalu selesaikan booking di tab kedua yang masih menampilkan kondisi lama.
- Pakai **dua akun** di dua browser untuk merebut kamar terakhir atau kuota terakhir. Hitung mundur dan tekan bersamaan.

Teknik ini menguji apakah pengecekan dilakukan ulang di titik akhir, bukan hanya saat halaman dibuka.

## Teknik 4: Data uji dan pengaturan staging

Beberapa kondisi hampir mustahil dicapai manual, misalnya kuota yang habis tepat saat kamu di halaman pembayaran. Untuk itu:

- Tanyakan apakah staging punya **pengaturan uji**: tombol untuk mengosongkan kuota, mengubah waktu server, atau mengatur stok.
- Kalau belum ada, minta sejak awal sprint. Permintaan ini wajar dan sering dibuat dalam beberapa jam oleh developer.
- Pakai data dengan stok atau kuota sangat kecil, misalnya kuota 1, supaya rebutan mudah dibuat.

Saat memakai pengaturan uji, pikirkan **kapan** mengubahnya. Mengosongkan kuota sebelum promo dipilih menguji hal yang berbeda dengan mengosongkannya setelah promo terpakai.

## Teknik 5: Request paralel di level API

Kalau kamu punya akses API (misalnya lewat Postman atau curl), kirim beberapa request yang sama secara paralel. Di Postman, pakai Collection Runner dengan beberapa iterasi tanpa jeda. Di terminal, jalankan beberapa curl sekaligus di background.

Di level API, kamu bisa mengatur waktu jauh lebih presisi dari jari manusia. Kamu sudah belajar dasar idempotency di Fintech QA Ready, dan teknik ini cara praktis mengujinya.

## Apa yang diamati

Race condition sering tidak terlihat di halaman tempat kamu menekan tombol. Siapkan pengamatan **sebelum** mulai:

| Yang dicek | Di mana |
|---|---|
| Jumlah booking yang dibuat | Daftar booking, riwayat, admin |
| Jumlah tagihan atau kode bayar | Halaman sukses, email, notifikasi |
| Stok kamar | Halaman hotel, admin, API |
| Kuota promo | Admin promo, API |
| Total yang ditagih | Halaman sukses dibanding ringkasan sebelumnya |

## Menulis bug report race condition

Bug race condition butuh informasi tambahan dibanding bug biasa:

> **Judul:** [Booking] Ketuk Pesan dua kali dengan cepat membuat 2 booking dan 2 kode bayar
> **Severity:** Critical · **Priority:** P1
> **Langkah:**
> 1. Pilih Hotel Teras Bambu, kamar Deluxe, 1 malam, pakai INAP2
> 2. Ketuk Pesan dua kali dalam ± 0,5 detik
> **Expected:** 1 booking, tombol nonaktif segera setelah ketukan pertama (PRD v1.1 US-05)
> **Actual:** 2 booking (BK-2506-1182 dan BK-2506-1183), 2 kode bayar, kuota INAP2 berkurang 2
> **Frekuensi:** 4 dari 5 percobaan
> **Catatan waktu:** tombol baru nonaktif setelah layar sukses muncul. Selama request berjalan, tombol masih bisa diketuk
> **Environment:** Staging v3.8.0-rc2, Android 14, jaringan WiFi

Dua baris tambahan, **frekuensi** dan **catatan waktu**, mengubah "tidak bisa direproduksi" menjadi "bisa, kalau ditekan dalam setengah detik". Sertakan juga ID booking atau data lain yang membuktikan efeknya.

## Severity untuk bug uang dan konkurensi

| Severity | Contoh |
|---|---|
| Critical | Booking atau tagihan dobel, kamar terjual dua kali, promo terpakai melebihi kuota, potongan tanpa batas |
| Major | Aturan promo salah dengan selisih terbatas, tamu tidak bisa memakai promo yang seharusnya boleh |
| Minor | Teks alasan kurang tepat, tanpa salah hitung |

## Ringkasan

- Race condition terjadi karena ada jarak antara pengecekan dan aksi. Pola yang sama berlaku untuk stok, kuota, dan klik dobel.
- Uji dengan klik dobel, jaringan lambat, dua tab atau dua akun, pengaturan uji staging, dan request paralel di API.
- Siapkan pengamatan sebelum mulai, karena efeknya sering muncul di halaman lain.
- Bug report race condition wajib menyebut frekuensi dan catatan waktu.
- Logika sudah teruji. Modul terakhir bertanya: apakah semuanya tetap bertahan saat traffic puncak? Kita mulai dari membaca hasil load test.
