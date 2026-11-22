---
title: Acceptance Criteria yang Bisa Dites
slug: acceptance-criteria-yang-bisa-dites
excerpt: Acceptance criteria adalah kontrak antara PM, developer, dan QA. Pelajari ciri AC yang bisa dites, format Given-When-Then, dan cara menulis ulang AC yang kabur menjadi skenario yang jelas.
category: Manual Testing (pilih di admin)
tags: acceptance criteria, requirement, gherkin, manual testing
visibility: library
course: Junior QA Ready · Modul 1 (Requirement) · Lesson 3
---

Acceptance criteria (AC) adalah daftar syarat yang harus terpenuhi supaya sebuah user story dianggap selesai. Kedengarannya sederhana, tapi AC adalah bagian PRD yang paling sering menimbulkan salah paham. Developer membacanya sebagai spesifikasi, PM sebagai janji ke user, dan QA sebagai bahan test case.

Kalau ketiganya membaca AC yang sama dengan pemahaman berbeda, bug-nya sudah tertanam sejak awal. Artikel ini membahas seperti apa AC yang bisa dites, dan bagaimana QA bisa membantu menulisnya.

## Ciri AC yang bisa dites

AC yang baik memenuhi empat syarat:

| Syarat | Artinya | Contoh kabur | Contoh jelas |
|---|---|---|---|
| **Terlihat** | Hasilnya bisa diamati dari luar sistem | "Sistem memproses voucher" | "Baris Ongkir di ringkasan berubah jadi Rp0" |
| **Spesifik** | Hanya ada satu cara menafsirkannya | "Voucher berlaku untuk belanja tertentu" | "Voucher berlaku jika subtotal makanan ≥ Rp50.000" |
| **Terukur** | Ada angka, batas, atau kondisi yang pasti | "Halaman dimuat dengan cepat" | "Daftar voucher tampil dalam ≤ 2 detik di koneksi 4G" |
| **Satu hal** | Satu AC menguji satu perilaku | "User bisa memilih dan memakai voucher lalu melihat total" | Dipecah jadi tiga AC |

Tes cepatnya sama seperti di lesson pertama: **bisakah dua orang berbeda menulis test case yang sama dari AC ini?** Kalau jawabannya tidak, AC-nya belum cukup jelas.

## Format Given-When-Then

Banyak tim menulis AC dengan format Given-When-Then (sering disebut Gherkin). Formatnya memaksa penulis menjelaskan tiga hal:

- **Given:** kondisi awal sebelum aksi.
- **When:** aksi yang dilakukan user.
- **Then:** hasil yang bisa diamati.

Contoh, dari AC yang kabur "Voucher hanya berlaku untuk minimum belanja tertentu":

```gherkin
Scenario: Voucher ongkir tidak bisa dipakai di bawah minimum belanja
  Given subtotal makanan di keranjang Rp45.000
  And user punya voucher "GRATISONGKIR" dengan minimum belanja Rp50.000
  When user membuka daftar voucher di halaman checkout
  Then voucher "GRATISONGKIR" tampil dalam keadaan nonaktif
  And di bawahnya tertulis "Tambah Rp5.000 lagi untuk pakai voucher ini"
```

Perhatikan bahwa satu AC kabur berubah jadi skenario dengan angka, kondisi, dan hasil yang bisa dicek. Skenario ini juga langsung menunjukkan skenario pasangannya yang perlu ditulis: subtotal tepat Rp50.000 dan subtotal di atas Rp50.000.

Given-When-Then bukan kewajiban. AC dalam bentuk daftar biasa tetap bisa dites asal memenuhi empat syarat di atas. Format ini hanya alat bantu supaya tidak ada bagian yang terlewat.

## Menulis ulang AC yang kabur

Tidak semua tim menerima QA menulis ulang AC. Cara yang paling aman adalah menawarkan versi yang lebih jelas sebagai usulan, lalu PM yang memutuskan. Berikut contoh dari user story voucher ongkir:

**Sebelum:**

> AC3: Ongkir berkurang sesuai nilai voucher.

**Usulan QA:**

> AC3a: Jika nilai voucher ≥ ongkir, ongkir menjadi Rp0 dan sisa nilai voucher tidak dipakai.
> AC3b: Jika nilai voucher < ongkir, ongkir berkurang sebesar nilai voucher.
> AC3c: Ringkasan pembayaran menampilkan baris "Voucher ongkir" berisi potongan yang benar-benar dipakai, bukan nilai nominal voucher.

Satu kalimat berubah jadi tiga aturan yang masing-masing bisa dites. Usulan ini juga memaksa satu keputusan bisnis dibuat sekarang (sisa voucher hangus), bukan ditemukan saat UAT.

## Jangan lupa alur negatif

AC yang ditulis PM biasanya fokus pada alur bahagia. Bagian yang paling sering hilang:

- **Pesan error:** apa yang dilihat user saat gagal, kata per kata kalau perlu.
- **Status setelah gagal:** apakah data yang sudah diisi tetap ada?
- **Pembatalan:** apa yang terjadi kalau user kembali, menutup aplikasi, atau transaksi dibatalkan pihak lain?
- **Pengulangan:** menekan tombol dua kali, membuka di dua perangkat, me-refresh halaman.

Kamu tidak harus memaksa semua ini masuk AC. Tapi setiap kali kamu menemukannya, tanyakan ke PM: apakah ini bagian dari story ini, atau story terpisah?

## Dari AC ke test case

AC yang jelas membuat langkah berikutnya jauh lebih mudah. Setiap AC biasanya menghasilkan beberapa test case:

| AC | Test case turunan |
|---|---|
| Voucher berlaku jika subtotal ≥ Rp50.000 | Subtotal Rp49.999 (tidak bisa), Rp50.000 (bisa), Rp50.001 (bisa) |
| Ongkir jadi Rp0 jika voucher ≥ ongkir | Voucher sama dengan ongkir, voucher lebih besar, voucher lebih kecil |
| Voucher terpakai tidak bisa dipakai lagi | Pakai sekali (berhasil), pakai kedua kali (ditolak), pesanan dibatalkan lalu pakai lagi (sesuai keputusan PM) |

Cara memilih nilai seperti Rp49.999, Rp50.000, dan Rp50.001 punya nama: boundary value analysis. Teknik ini dan teknik test design lainnya dibahas di modul berikutnya.

## Ringkasan

- AC yang bisa dites itu terlihat, spesifik, terukur, dan hanya membahas satu perilaku.
- Given-When-Then membantu memastikan kondisi awal, aksi, dan hasil semuanya tertulis.
- Tawarkan versi AC yang lebih jelas sebagai usulan. Keputusannya tetap di PM.
- Tanyakan alur negatif: error, pembatalan, dan aksi berulang.
- AC yang jelas langsung bisa diturunkan menjadi test case.
