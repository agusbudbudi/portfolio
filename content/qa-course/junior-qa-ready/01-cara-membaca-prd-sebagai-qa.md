---
title: Cara Membaca PRD sebagai QA
slug: cara-membaca-prd-sebagai-qa
excerpt: QA yang baik mulai bekerja sebelum ada kode. Pelajari cara membaca PRD dua kali, membedah tiap acceptance criteria, dan menemukan bagian yang belum bisa dites.
seo_title: Cara Membaca PRD sebagai QA: Teknik Baca Dua Kali
seo_description: Panduan QA membaca PRD: pahami cerita fitur, bedah tiap acceptance criteria, dan temukan bagian yang belum bisa dites sebelum developer mulai coding.
category: Manual Testing (pilih di admin)
tags: requirement, prd, manual testing, qa fundamental
visibility: library
course: Junior QA Ready · Modul 1 (Requirement) · Lesson 1
---

Banyak orang mengira QA baru mulai bekerja setelah developer selesai coding. Di tim yang sehat, justru sebaliknya: QA sudah terlibat sejak dokumen requirement masih berupa draft. Alasannya sederhana. **Bug termurah adalah bug yang tidak pernah ditulis.**

Satu kalimat ambigu di PRD bisa berubah jadi tiga hal mahal di akhir sprint: bug, rework, atau debat panjang antara developer dan PM soal "maksudnya yang mana". Tugas QA di fase ini adalah menemukan kalimat-kalimat itu lebih dulu.

Artikel ini membahas cara membaca PRD (Product Requirement Document) dengan kacamata QA.

## Apa yang ada di dalam PRD?

Format PRD berbeda di tiap perusahaan, tapi isinya hampir selalu mirip:

| Bagian | Isinya | Yang dicari QA |
|---|---|---|
| Latar belakang | Masalah user dan data pendukung | Masalah apa yang harus benar-benar hilang setelah rilis |
| Tujuan & metrik | Target bisnis, misalnya completion rate | Alur mana yang paling penting dijaga |
| Scope | In scope dan out of scope | Batas pengujian: apa yang tidak perlu dites |
| User story | "Sebagai X, saya ingin Y supaya Z" | Siapa user-nya dan apa tujuannya |
| Acceptance criteria (AC) | Syarat agar story dianggap selesai | Bahan utama test case |
| Desain / flow | Mockup, diagram alur | State layar, pesan error, empty state |

Bagian yang paling sering kamu pegang adalah **user story dan acceptance criteria**. Tapi jangan lewati latar belakang dan scope. Dari situ kamu tahu mana yang kritis dan mana yang bukan urusan rilis ini.

## Baca dua kali, dengan tujuan berbeda

Kesalahan paling umum adalah langsung membedah AC satu per satu sejak paragraf pertama. Hasilnya, kamu paham detail tapi tidak paham gambaran besarnya. Lebih efektif membaca PRD dua kali.

### Bacaan pertama: pahami ceritanya

Baca dari atas sampai bawah tanpa mencatat detail. Setelah selesai, coba jawab tiga pertanyaan ini dengan bahasamu sendiri:

1. **Masalah apa yang diselesaikan?** Bukan "menambah fitur voucher", tapi "user batal checkout karena ongkir mahal".
2. **Siapa user-nya?** User baru, user lama, admin, merchant?
3. **Seperti apa alur utamanya?** Tulis sebagai langkah: buka keranjang, pilih voucher, lihat total, bayar.

Kalau kamu belum bisa menjelaskan fitur ini ke teman dalam satu menit, jangan lanjut ke detail. Baca lagi, atau tanya PM soal konteksnya.

### Bacaan kedua: bedah setiap AC

Sekarang baca per acceptance criteria. Untuk setiap AC, tanyakan satu hal:

> **"Bagaimana saya membuktikan ini pass atau fail?"**

Kalau kamu bisa langsung membayangkan langkah tes dan hasil yang diharapkan, AC itu sudah cukup jelas. Kalau tidak bisa, kamu baru saja menemukan **gap**.

## Contoh: fitur voucher ongkir

Misalkan kamu QA di aplikasi pesan antar makanan fiktif bernama PesanAja. PM menulis user story berikut:

> **US-02: Pakai voucher ongkir**
> Sebagai pembeli, saya ingin memakai voucher gratis ongkir supaya total belanja lebih murah.
>
> - AC1: User bisa memilih voucher ongkir di halaman checkout.
> - AC2: Voucher hanya berlaku untuk minimum belanja tertentu.
> - AC3: Ongkir berkurang sesuai nilai voucher.
> - AC4: Voucher yang sudah dipakai tidak bisa dipakai lagi.

Sekilas terlihat lengkap. Sekarang coba buktikan pass atau fail untuk tiap AC:

| AC | Bisa dibuktikan? | Catatan QA |
|---|---|---|
| AC1 | Sebagian | Voucher mana yang muncul? Semua voucher, atau hanya yang memenuhi syarat? |
| AC2 | Tidak | "Minimum tertentu" itu berapa? Dihitung sebelum atau sesudah diskon menu? |
| AC3 | Tidak | Kalau voucher Rp15.000 dan ongkir Rp9.000, apakah ongkir jadi Rp0 atau sisanya hilang? |
| AC4 | Sebagian | "Sudah dipakai" dihitung sejak pesanan dibuat atau sejak pembayaran sukses? Bagaimana kalau pesanan dibatalkan? |

Dari empat AC yang terlihat rapi, tidak ada satu pun yang benar-benar siap dites. Ini kejadian normal. Bukan berarti PM-nya buruk. PM menulis dari sudut pandang "apa yang ingin dicapai", sedangkan QA membaca dari sudut pandang "bagaimana ini bisa gagal".

## Tanda-tanda kalimat yang perlu dicurigai

Saat membaca, beri tanda pada kata-kata seperti ini:

- **Kata kabur:** "tertentu", "sesuai", "cepat", "mudah", "beberapa", "biasanya".
- **Angka tanpa batas:** ada minimum tapi tidak ada maksimum, atau sebaliknya.
- **Kata "dan/atau":** sering menyembunyikan dua aturan yang berbeda.
- **Alur bahagia saja:** AC menjelaskan apa yang terjadi kalau berhasil, tapi diam soal gagal, batal, atau error.
- **Dua bagian yang saling bertentangan:** misalnya teks AC bilang "maksimal 3 voucher" tapi mockup hanya menampilkan satu slot.

Setiap tanda ini belum tentu bug. Tapi setiap tanda layak jadi pertanyaan.

## Hasil kerja yang diharapkan

Setelah dua kali membaca, kamu sebaiknya punya tiga hal:

1. **Ringkasan pemahaman.** Tiga sampai lima kalimat tentang masalah, user, alur utama, dan area paling berisiko. Kalau ringkasanmu berbeda dengan maksud PM, lebih baik ketahuan sekarang.
2. **Daftar gap.** Catatan per AC: lokasinya di mana, apa yang tidak jelas, dan kenapa itu penting.
3. **Gambaran area berisiko.** Biasanya kalkulasi uang, perubahan status, dan aturan yang punya banyak pengecualian.

Daftar gap ini yang nanti diubah menjadi pertanyaan klarifikasi untuk PM. Cara menulis pertanyaan yang langsung bisa dijawab dibahas di lesson berikutnya.

## Ringkasan

- QA terlibat sejak requirement karena memperbaiki kalimat jauh lebih murah daripada memperbaiki kode.
- Baca PRD dua kali: pertama untuk cerita besarnya, kedua untuk membedah setiap AC.
- Ujian untuk setiap AC: "Bagaimana saya membuktikan ini pass atau fail?" Kalau tidak bisa dijawab, itu gap.
- Curigai kata kabur, angka tanpa batas, dan AC yang hanya membahas alur bahagia.
