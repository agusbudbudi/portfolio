---
title: Menulis Pertanyaan Klarifikasi yang Langsung Dijawab PM
slug: menulis-pertanyaan-klarifikasi-untuk-pm
excerpt: Menemukan gap di PRD baru setengah pekerjaan. Pelajari checklist mencari gap dan cara menulis pertanyaan klarifikasi yang spesifik, punya skenario, dan bisa dijawab dalam satu kali baca.
category: Manual Testing (pilih di admin)
tags: requirement, prd, komunikasi, manual testing
visibility: library
course: Junior QA Ready · Modul 1 (Requirement) · Lesson 2
---

Di lesson sebelumnya kamu belajar membaca PRD dan menemukan bagian yang belum bisa dites. Sekarang bagian yang sering diremehkan: **mengubah temuan itu menjadi pertanyaan yang benar-benar dijawab.**

PM biasanya memegang banyak hal sekaligus. Pertanyaan yang kabur akan dibalas dengan jawaban yang kabur juga, atau tidak dibalas sama sekali. Pertanyaan yang spesifik bisa dijawab dalam dua menit, dan jawabannya bisa langsung masuk ke PRD.

## Checklist mencari gap

Sebelum menulis pertanyaan, pastikan kamu sudah menyisir PRD dengan checklist ini. Setiap kategori adalah sumber bug yang sangat umum.

| Kategori | Pertanyaan yang kamu ajukan ke diri sendiri |
|---|---|
| **Batas (boundary)** | Berapa minimum dan maksimumnya? Bagaimana dengan 0, angka negatif, desimal, teks sangat panjang? |
| **Data tidak valid** | Apa yang terjadi kalau input kosong, hanya spasi, duplikat, atau berisi karakter aneh? |
| **State dan urutan** | Apa yang terjadi kalau data diubah, dihapus, atau dibatalkan di tengah alur? Bagaimana kalau user menekan tombol dua kali? |
| **Kalkulasi** | Urutan operasinya apa? Dibulatkan ke mana? Ke mana perginya sisa pembagian? |
| **Kontradiksi** | Apakah teks AC, mockup, dan bagian lain PRD saling cocok? |
| **Non-functional dan UX** | Bagaimana di layar kecil, koneksi lambat, mode offline, atau browser desktop? Apa pesan error-nya? |

Kamu tidak harus menemukan gap di semua kategori. Tapi kalau kamu hanya menemukan gap di satu kategori, kemungkinan besar kamu belum menyisir cukup dalam.

## Anatomi pertanyaan yang baik

Pertanyaan klarifikasi yang baik punya tiga komponen:

1. **Lokasi.** Sebutkan user story dan AC-nya, misalnya "US-02 AC3". PM tidak perlu mencari kamu sedang membahas bagian mana.
2. **Skenario konkret.** Pakai angka dan contoh nyata, bukan konsep abstrak.
3. **Opsi jawaban.** Tawarkan kemungkinan jawaban supaya PM tinggal memilih atau mengoreksi.

Lihat perbedaannya:

> ❌ **Kurang baik:** "Tolong jelaskan lagi soal voucher ongkir."

> ✅ **Baik:** "US-02 AC3: kalau nilai voucher Rp15.000 tapi ongkirnya Rp9.000, apakah ongkir jadi Rp0 dan sisa Rp6.000 hangus, atau sisanya boleh memotong harga makanan?"

Pertanyaan pertama memaksa PM menebak apa yang membingungkanmu. Pertanyaan kedua bisa dijawab dengan satu kalimat: "Ongkir jadi Rp0, sisanya hangus."

Contoh lain dari kategori state:

> ❌ "Bagaimana kalau pesanannya batal?"

> ✅ "US-02 AC4: kalau user memakai voucher lalu pesanannya dibatalkan merchant sebelum diproses, apakah voucher (a) kembali dan bisa dipakai lagi, (b) hangus, atau (c) kembali dengan masa berlaku baru?"

## Catat dalam gap log, bukan di chat

Pertanyaan yang tersebar di chat akan hilang. Kumpulkan dalam satu tabel yang bisa dilihat semua orang, misalnya di dokumen PRD itu sendiri atau di halaman Confluence:

| Lokasi | Jenis | Pertanyaan untuk PM | Risiko kalau tidak dijawab |
|---|---|---|---|
| US-02 AC2 | Batas | Minimum belanja Rp50.000 dihitung dari harga sebelum atau sesudah diskon menu? | Voucher bisa dipakai di keranjang yang seharusnya tidak memenuhi syarat |
| US-02 AC3 | Kalkulasi | Voucher Rp15.000, ongkir Rp9.000: sisa Rp6.000 hangus atau memotong harga makanan? | Developer dan QA memakai asumsi berbeda, hasil hitung tidak konsisten |
| US-02 AC4 | State | Pesanan dibatalkan merchant: voucher kembali atau hangus? | Komplain user, beban CS naik |
| US-02 (umum) | UX | Kalau voucher tidak memenuhi syarat, apakah tetap tampil dalam keadaan abu-abu dengan alasannya, atau disembunyikan? | User bingung kenapa vouchernya "hilang" |

Kolom **Risiko** penting. Kolom ini membantu PM memprioritaskan mana yang harus dijawab sebelum sprint dimulai, dan mana yang bisa menyusul.

## Tips menyampaikan pertanyaan

- **Kirim sekaligus, bukan satu per satu.** Satu daftar berisi delapan pertanyaan lebih mudah dijawab daripada delapan notifikasi.
- **Urutkan dari risiko tertinggi.** Kalkulasi uang dan perubahan status biasanya di atas, typo copy di bawah.
- **Pisahkan pertanyaan dan saran.** Kalau kamu punya usulan solusi, tulis "Saran QA:" setelah pertanyaannya. Keputusan tetap di tangan PM.
- **Netral, bukan menyalahkan.** Tulis "Belum ada aturan untuk kasus X", bukan "PRD-nya kurang lengkap".
- **Tutup lingkarannya.** Setelah dijawab, pastikan jawabannya masuk ke PRD atau AC. Jawaban yang hanya ada di chat akan terlupa saat sprint berjalan.

## Kesalahan yang sering terjadi

- **Menanyakan hal yang sudah ada di PRD.** Baca ulang dulu. Ini cepat merusak kepercayaan.
- **Terlalu umum.** "Bagaimana dengan edge case-nya?" bukan pertanyaan, itu pekerjaan rumah untuk PM.
- **Hanya menanyakan alur bahagia.** Gap paling mahal biasanya ada di alur gagal, batal, dan ulang.
- **Langsung menganggap jawaban sendiri benar.** Kalau ragu, tanyakan. Asumsi yang tidak dikonfirmasi adalah bug yang menunggu waktu.

## Ringkasan

- Sisir PRD dengan checklist: batas, data tidak valid, state, kalkulasi, kontradiksi, dan non-functional.
- Pertanyaan yang baik punya lokasi, skenario konkret dengan angka, dan opsi jawaban.
- Kumpulkan dalam gap log lengkap dengan risikonya, lalu kirim sekaligus.
- Pastikan setiap jawaban masuk kembali ke PRD.
