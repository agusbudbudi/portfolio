---
title: "Go / No-Go Kampanye: Monitoring dan Rollback Hari H"
slug: monitoring-dan-rollback-hari-h
excerpt: Keputusan rilis kampanye tidak berhenti di Go atau No-Go. Cara menulis syarat Go yang terukur, rencana monitoring hari H, dan rollback yang benar-benar bisa dijalankan.
seo_title: Go / No-Go Kampanye, Monitoring, dan Rollback
seo_description: Cara QA menulis rekomendasi rilis kampanye: Go bersyarat, syarat terukur, monitoring dengan ambang alert, rollback lewat feature flag, dan rencana B.
category: Performance & Release
tags: go no go, release management, monitoring, rollback, feature flag
visibility: library
course: E-commerce QA Ready · Modul 4 (Release Readiness) · Lesson 3
---

Jam 00:03 malam Payday Sale. Grafik error di dashboard mulai naik. Developer yang sedang online melihatnya, tapi tidak yakin apakah ini normal untuk traffic setinggi ini. PM sedang tidur. Tidak ada yang tahu siapa yang boleh memutuskan untuk mematikan fitur. Jam 00:25 grup chat mulai ramai, tapi sudah terlambat: ribuan tamu gagal booking di jam paling sibuk.

Masalahnya bukan bug. Masalahnya, keputusan rilis berhenti di kata "Go".

Di Fintech QA Ready kamu sudah belajar menulis release sign-off dengan rekomendasi tegas dan syarat Go yang konkret (**Release Sign-off yang Bisa Dipertanggungjawabkan**). Artikel ini menambah dua hal yang wajib ada untuk rilis kampanye: **monitoring hari H** dan **rollback**.

## Bahan yang sudah kamu kumpulkan

Sepanjang course, kamu sudah mengumpulkan bahan untuk keputusan ini:

| Modul | Bahan |
|---|---|
| Requirement | Peta risiko kampanye |
| Design Review | Temuan tampilan dan aksesibilitas |
| Voucher Testing | Bug logika promo dan konkurensi |
| Release Readiness | Hasil load test dan validasi analytics |

Kembali ke peta risiko dari Modul 1. Untuk setiap area berisiko tinggi, tanyakan: **sudah turun, atau masih terbuka?** Jawabannya adalah inti rekomendasimu.

## Go, No-Go, atau Go bersyarat

Untuk rilis kampanye, pilihannya jarang hitam putih:

| Keputusan | Kapan dipakai |
|---|---|
| Go | Semua risiko tinggi sudah turun, monitoring dan rollback siap |
| No-Go | Ada risiko tinggi tanpa jalan keluar sebelum kampanye |
| Go bersyarat | Ada risiko terbuka, tapi bisa ditutup dengan syarat yang terukur sebelum batas waktu |

"Go bersyarat" hanya berguna kalau syaratnya **terukur** dan punya **batas waktu**. "Go asal performa membaik" bukan syarat. "Go jika load test ulang dengan skenario spike lulus p95 < 1 detik dan error ≤ 0,5% di setiap endpoint, paling lambat H-2" adalah syarat.

## Syarat Go yang terukur

Setiap syarat menyebut **apa**, **ukuran lulusnya**, dan **kapan**:

> **Syarat Go Promo Payday Sale (rc3):**
> 1. Bug kuota promo saat Pesan fixed, retest pass, regression booking lulus. Paling lambat 22 Juni.
> 2. Load test ulang setelah fix, dengan spike 1× ke 5× dalam 3 menit dan mayoritas virtual user memakai INAP2. Lulus: p95 < 1 detik dan error ≤ 0,5% di setiap endpoint. Paling lambat 23 Juni.
> 3. Event booking_created terkirim 1× dan membawa promo_code, dicek ulang di staging. Paling lambat 23 Juni.

Kalau salah satu syarat tidak terpenuhi di batas waktunya, keputusan otomatis menjadi No-Go atau rencana B. Tidak perlu rapat panjang lagi.

## Rencana monitoring hari H

Monitoring menjawab: **bagaimana kita tahu ada masalah, sebelum user yang memberi tahu?**

| Unsur | Isi |
|---|---|
| Metrik | Error rate per endpoint, p95 booking, jumlah promo_rejected, booking per menit dibanding pembayaran |
| Ambang alert | Error POST /booking > 0,5% selama 5 menit, p95 > 1 detik, booking per menit turun 50% dari 10 menit sebelumnya |
| Saluran | Alert masuk ke grup on-call, bukan hanya dashboard yang harus dibuka |
| Penjaga | Nama orang dan jamnya: QA, backend, frontend, PM |
| Jendela waktu | War room dari 30 menit sebelum kampanye sampai 2 jam setelah puncak |

Perhatikan metrik bisnis seperti "booking per menit". Error teknis kadang tidak tertangkap sebagai error, tapi terlihat dari booking yang tiba-tiba turun.

Dashboard tanpa alert hanya berguna kalau ada orang yang menatapnya terus-menerus. Di malam kampanye, jangan bergantung pada itu.

## Rollback yang bisa dijalankan

Rollback adalah rencana untuk kembali ke kondisi aman. Untuk kampanye, cara yang paling cepat biasanya **feature flag**: fitur baru dimatikan, user kembali ke versi lama tanpa deploy ulang.

Rencana rollback yang baik menjawab empat pertanyaan:

1. **Pemicu:** kapan rollback dilakukan? Tulis angkanya. Contoh: error booking > 1% selama 5 menit, atau p95 > 2 detik selama 10 menit.
2. **Cara:** apa langkahnya, dan berapa lama? Contoh: matikan flag `promo_payday_v2` di dashboard config, efektif ± 2 menit.
3. **Pemutus:** siapa yang boleh memutuskan, dan siapa penggantinya kalau ia tidak bisa dihubungi?
4. **Sudah diuji:** apakah flag pernah dimatikan dan dinyalakan di staging? Rollback yang belum pernah dicoba adalah harapan, bukan rencana.

Pertanyaan keempat paling sering dilupakan, dan paling sering membuat rollback gagal di saat dibutuhkan.

## Rencana B

Kalau syarat Go tidak terpenuhi, kampanye tetap berjalan. Siapkan alternatif:

- Rilis dengan flag **mati**, kampanye memakai fitur lama yang sudah stabil.
- Rilis **bertahap**: nyalakan untuk sebagian kecil user, pantau, lalu naikkan.
- Kurangi cakupan: rilis promo nominal saja, tunda promo persen.

Menuliskan rencana B membuat No-Go terasa sebagai keputusan yang bisa diterima, bukan kegagalan tim.

## Contoh rekomendasi singkat

> **Rekomendasi rilis Promo Payday Sale v2 (rc3)**
> **Status:** fungsional siap kecuali bug kuota saat Pesan. Load test gagal target di POST /promo/apply dan POST /booking. Dua event analytics belum benar.
> **Rekomendasi:** No-Go untuk rc3. Go bersyarat untuk rc4 dengan 3 syarat di atas.
> **Monitoring:** alert error dan p95 per endpoint, war room 23:30 sampai 02:00, penjaga sudah ditentukan.
> **Rollback:** matikan `promo_payday_v2` jika error booking > 1% selama 5 menit. Diputuskan PM, dieksekusi lead backend. Dicoba di staging H-3.
> **Rencana B:** kalau syarat belum terpenuhi H-2, rilis dengan flag mati.

## Penutup course

Kamu sudah menjalani satu siklus lengkap rilis kampanye dari sudut pandang QA: membaca PRD promo dengan lima lensa, menemukan kasus ramai sebelum ada kode, memetakan risiko, membandingkan build dengan desain, menguji logika promo dengan decision table dan state transition, mereproduksi race condition, membaca load test dengan kritis, memvalidasi analytics, dan menutupnya dengan keputusan rilis yang bisa dijalankan.

Yang membedakan QA senior bukan jumlah bug yang ditemukan, tapi kemampuan menjawab satu pertanyaan dengan bukti: **apakah kita siap, dan kalau tidak, apa yang harus terjadi supaya siap?**

## Ringkasan

- Keputusan rilis kampanye harus mencakup syarat Go, monitoring, dan rollback, bukan hanya kata Go atau No-Go.
- Go bersyarat hanya berguna kalau syaratnya terukur dan punya batas waktu.
- Monitoring butuh metrik teknis dan bisnis, ambang alert, saluran, dan nama penjaga.
- Rollback harus punya pemicu berupa angka, cara, pemutus, dan sudah pernah diuji.
- Rencana B membuat No-Go menjadi pilihan yang aman untuk diambil.
