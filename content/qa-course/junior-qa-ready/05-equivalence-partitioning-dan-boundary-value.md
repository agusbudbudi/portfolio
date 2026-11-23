---
title: Equivalence Partitioning dan Boundary Value Analysis
slug: equivalence-partitioning-dan-boundary-value-analysis
excerpt: Kamu tidak mungkin menguji semua input. Dua teknik ini membantu memilih sedikit nilai uji yang mewakili banyak kasus, plus decision table untuk aturan dengan banyak kondisi.
seo_title: Equivalence Partitioning & Boundary Value Analysis
seo_description: Belajar teknik test design EP dan BVA dengan contoh, plus decision table untuk aturan bisnis dengan banyak kondisi. Uji lebih sedikit, temukan lebih banyak.
category: Manual Testing (pilih di admin)
tags: test design, boundary value analysis, equivalence partitioning, decision table
visibility: library
course: Junior QA Ready · Modul 2 (Test Design) · Lesson 2
---

Bayangkan field minimum belanja yang menerima angka Rp0 sampai Rp10.000.000. Menguji semua nilainya jelas mustahil. Menguji secara acak juga berisiko: kamu bisa saja melewatkan satu nilai yang justru membuat sistem salah.

Di sinilah teknik test design berguna. Teknik ini membantu kamu memilih **sedikit nilai uji yang mewakili banyak kasus**, dengan alasan yang bisa dijelaskan. Dua teknik paling dasar adalah Equivalence Partitioning dan Boundary Value Analysis. Di akhir artikel ada bonus: decision table untuk aturan yang kondisinya banyak.

## Equivalence Partitioning (EP)

Idenya: kelompokkan input yang **diperlakukan sama oleh sistem** ke dalam satu partisi. Kalau satu nilai di partisi itu benar, nilai lain di partisi yang sama kemungkinan besar juga benar. Jadi cukup ambil satu wakil per partisi.

Contoh: voucher ongkir di aplikasi pesan antar fiktif PesanAja berlaku jika subtotal makanan **minimal Rp50.000**.

| Partisi | Rentang | Perilaku yang diharapkan | Wakil yang diuji |
|---|---|---|---|
| Di bawah minimum | Rp1 sampai Rp49.999 | Voucher nonaktif | Rp30.000 |
| Memenuhi minimum | Rp50.000 ke atas | Voucher bisa dipakai | Rp75.000 |
| Tidak valid | Rp0 atau keranjang kosong | Checkout tidak bisa dilanjutkan | Keranjang kosong |

Tiga test case sudah mewakili seluruh kemungkinan subtotal. Tanpa EP, kamu mungkin menulis sepuluh test case yang sebenarnya menguji hal yang sama.

Partisi tidak selalu berupa angka. Untuk field kode voucher misalnya:

- Kode valid dan aktif.
- Kode valid tapi kedaluwarsa.
- Kode yang tidak pernah ada.
- Input kosong atau hanya spasi.
- Huruf kecil untuk kode yang seharusnya huruf besar.

Setiap butir adalah partisi dengan perilaku yang berbeda, jadi masing-masing butuh satu test case.

## Boundary Value Analysis (BVA)

EP memilih wakil dari tengah partisi. Masalahnya, **bug paling suka bersembunyi di tepi partisi.** Penyebabnya klasik: developer menulis `>` padahal seharusnya `>=`, atau salah satu angka batas di kode berbeda dengan di PRD.

BVA menguji nilai tepat di batas dan tepat di sebelahnya. Untuk minimum belanja Rp50.000:

| Nilai | Posisi | Expected |
|---|---|---|
| Rp49.999 | Tepat di bawah batas | Voucher nonaktif |
| Rp50.000 | Tepat di batas | Voucher bisa dipakai |
| Rp50.001 | Tepat di atas batas | Voucher bisa dipakai |

Kalau developer salah menulis `subtotal > 50000`, test case Rp50.000 akan gagal. Nilai Rp75.000 dari EP tidak akan pernah menangkap bug ini.

Untuk rentang dengan dua batas, misalnya nama penerima **1 sampai 30 karakter**, uji kedua tepinya:

| Nilai | Expected |
|---|---|
| 0 karakter (kosong) | Ditolak |
| 1 karakter | Diterima |
| 30 karakter | Diterima |
| 31 karakter | Ditolak, atau input berhenti di 30 karakter sesuai AC |

Perhatikan baris terakhir: BVA sering memaksa kamu kembali ke PRD. Apakah 31 karakter ditolak dengan pesan error, atau user memang tidak bisa mengetik karakter ke-31? Kalau belum jelas, itu pertanyaan untuk PM.

## Menggabungkan EP dan BVA

Dalam praktik, keduanya dipakai bersamaan:

1. Tentukan partisinya dengan EP.
2. Ambil satu wakil dari tengah setiap partisi.
3. Tambahkan nilai batas di setiap pertemuan antar partisi dengan BVA.

Hasilnya sedikit test case yang tetap mencakup perilaku normal dan titik paling rawan.

## Bonus: decision table untuk aturan dengan banyak kondisi

Beberapa aturan bergantung pada **kombinasi** kondisi. Contoh di PesanAja:

- Ongkir gratis jika pakai voucher ongkir dan subtotal memenuhi minimum.
- Member Plus selalu mendapat potongan ongkir Rp5.000, bisa digabung dengan voucher.
- Ongkir tidak bisa negatif.

Menebak kombinasinya di kepala hampir pasti ada yang terlewat. Decision table menuliskan semuanya:

| # | Pakai voucher | Subtotal ≥ minimum | Member Plus | Ongkir awal | Expected ongkir |
|---|---|---|---|---|---|
| 1 | Tidak | Ya | Tidak | Rp12.000 | Rp12.000 |
| 2 | Tidak | Ya | Ya | Rp12.000 | Rp7.000 |
| 3 | Ya | Tidak | Tidak | Rp12.000 | Rp12.000 (voucher nonaktif) |
| 4 | Ya | Ya | Tidak | Rp12.000 | Rp0 |
| 5 | Ya | Ya | Ya | Rp12.000 | Rp0 (tidak menjadi minus) |
| 6 | Ya | Tidak | Ya | Rp12.000 | Rp7.000 |

Tiga kondisi ya/tidak menghasilkan 8 kombinasi. Tabel di atas memuat 6 kombinasi yang paling berarti. Baris 5 dan 6 adalah jenis kombinasi yang paling sering lupa dites, dan paling sering salah di kode.

Dua aturan penting saat memakai decision table:

1. **Hitung expected result secara manual sebelum eksekusi.** Kalau kamu menghitungnya setelah melihat hasil aplikasi, kamu cenderung menganggap hasil aplikasi benar.
2. **Kalau ada baris yang expected-nya tidak bisa kamu tentukan dari PRD, itu gap.** Tanyakan ke PM sebelum eksekusi.

## Ringkasan

- **EP:** kelompokkan input yang perilakunya sama, uji satu wakil per kelompok.
- **BVA:** uji tepat di batas dan di sebelahnya, karena di situlah bug paling sering muncul.
- Gabungkan keduanya untuk cakupan luas dengan jumlah test case yang hemat.
- **Decision table** untuk aturan dengan kombinasi kondisi. Hitung expected result manual sebelum eksekusi.
