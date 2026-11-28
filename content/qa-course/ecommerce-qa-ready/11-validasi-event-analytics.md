---
title: Validasi Event Analytics sebelum Rilis
slug: validasi-event-analytics
excerpt: Success metrics di PRD hanya bisa diukur kalau event analytics-nya benar. Cara QA mencocokkan event dengan tracking plan dan menemukan masalah sebelum datanya terlanjur kotor.
seo_title: Cara QA Memvalidasi Event Analytics
seo_description: Cara memvalidasi event analytics terhadap tracking plan: event hilang, dobel, salah waktu, properti hilang, tipe data salah, dan dampaknya ke metrik.
category: Performance & Release
tags: analytics, tracking plan, event tracking, data quality, success metrics
visibility: library
course: E-commerce QA Ready · Modul 4 (Release Readiness) · Lesson 2
---

Seminggu setelah Payday Sale, PM InapYuk membuka dashboard dan tersenyum: conversion naik dari 18% ke 27%. Fitur promo baru dianggap sukses besar. Dua minggu kemudian, tim finance bertanya kenapa jumlah booking di dashboard 40% lebih banyak dari jumlah pembayaran yang masuk.

Ternyata event `booking_created` terkirim dua kali di Android. Conversion tidak pernah naik setinggi itu. Keputusan untuk memperluas promo ke kampanye berikutnya sudah terlanjur diambil dari angka yang salah.

**Analytics adalah bagian dari fitur.** Success metrics di PRD dihitung dari event. Kalau event-nya salah, tim tidak bisa membuktikan fitur berhasil, atau lebih buruk, membuat keputusan dari data palsu. Dan data analytics yang sudah terkirim hampir tidak mungkin diperbaiki setelahnya.

## Tracking plan sebagai acuan

Tracking plan adalah dokumen yang menjelaskan event apa yang dikirim, kapan, dan dengan properti apa. Untuk Promo Payday Sale InapYuk:

| Event | Kapan dikirim | Properti wajib |
|---|---|---|
| search_performed | Tamu menekan Cari | user_id, city, check_in, nights (number) |
| promo_list_viewed | Daftar promo dibuka | user_id |
| promo_applied | Promo berhasil dipakai | user_id, promo_code, discount (number) |
| promo_rejected | Promo ditolak | user_id, promo_code, reason |
| booking_created | Booking berhasil dibuat, 1× per booking | user_id, booking_id, total (number), promo_code |

Kalau timmu belum punya tracking plan, itu temuan pertama. Tanpa acuan, kamu hanya bisa menebak apa yang benar.

## Lima pemeriksaan untuk setiap event

| Pemeriksaan | Pertanyaan | Contoh masalah |
|---|---|---|
| Terkirim | Apakah event muncul saat aksinya dilakukan? | Daftar promo dibuka, tidak ada event |
| Jumlah | Berapa kali event terkirim untuk satu aksi? | booking_created terkirim 2× |
| Waktu | Apakah terkirim di momen yang benar? | promo_applied terkirim saat promo dipilih, bukan saat berhasil dipakai |
| Properti | Apakah semua properti wajib ada dan terisi? | promo_rejected tanpa reason, user_id null |
| Tipe data | Apakah tipenya sesuai? | nights: "3" (teks), bukan 3 (angka) |

Tambahkan satu pemeriksaan lagi untuk event yang terkirim saat user belum atau sudah tidak login: apakah identitasnya tetap terhubung, sehingga event bisa digabung ke user yang sama?

## Cara melihat event

Ada beberapa cara, tergantung alat yang dipakai tim:

- **Live events atau debug view** di tool analytics (misalnya PostHog, Mixpanel, Amplitude, atau Firebase DebugView). Paling mudah, karena kamu melihat event masuk secara langsung.
- **Tab Network** di DevTools untuk web. Filter dengan nama domain analytics atau kata "capture" / "track", lalu buka payload-nya.
- **Log aplikasi** atau proxy seperti Charles untuk aplikasi mobile.

Lakukan satu **sesi uji** dengan langkah yang kamu catat, lalu cocokkan langkah itu dengan log event. Setiap langkah harus punya event yang sesuai, dan setiap event harus punya langkah yang memicunya.

## Contoh: sesi uji InapYuk

Langkah: cari hotel di Bandung 2 malam → buka daftar promo → ketik kode SALAHKODE → pakai INAP2 → Pesan.

| # | Event | Properti |
|---|---|---|
| 1 | search_performed | user_id: u_501, city: Bandung, check_in: 2025-06-25, nights: "2" |
| 2 | promo_rejected | user_id: u_501, promo_code: SALAHKODE, reason: not_found |
| 3 | promo_applied | user_id: u_501, promo_code: INAP2, discount: 75000 |
| 4 | promo_applied | user_id: u_501, promo_code: INAP2, discount: 75000 |
| 5 | booking_created | user_id: u_501, booking_id: BK-2506-2210, total: 1275000 |

Temuan:

- **promo_list_viewed tidak terkirim.** Langkah 2 membuka daftar promo, tapi tidak ada event. Funnel "buka daftar → pakai promo" tidak bisa dihitung.
- **nights berupa teks.** Baris 1 berisi "2", bukan 2. Rata-rata lama menginap akan gagal dihitung atau salah.
- **promo_applied terkirim 2×.** Baris 3 dan 4 sama persis. Tingkat pemakaian promo terhitung dua kali lipat.
- **booking_created tanpa promo_code.** Baris 5 tidak menyebut promo, padahal INAP2 dipakai. Tim tidak bisa menghitung berapa booking yang memakai promo Payday.

## Hubungkan dengan success metrics

Temuan analytics paling kuat kalau dihubungkan ke metrik yang dijanjikan di PRD. Contoh:

| Temuan | Metrik yang terdampak | Akibatnya |
|---|---|---|
| promo_applied dobel | Tingkat pemakaian promo | Terlihat 2× lebih tinggi, budget promo kampanye berikutnya salah hitung |
| booking_created tanpa promo_code | Booking dengan promo Payday | Tidak bisa diukur sama sekali |
| promo_rejected tanpa reason (kalau terjadi) | Alasan promo gagal | Tidak bisa tahu kenapa tamu gagal, keluhan CS tidak bisa dianalisis |

Kalimat "conversion akan terlihat lebih tinggi dari kenyataan" lebih cepat membuat PM bertindak dibanding "event dobel".

## Severity untuk temuan analytics

| Severity | Ciri |
|---|---|
| High | Membuat success metric utama salah atau tidak bisa diukur |
| Medium | Membuat analisis pendukung salah, misalnya funnel atau segmentasi |
| Low | Penamaan tidak konsisten, properti opsional hilang |

## Checklist validasi analytics

- [ ] Ada tracking plan yang disepakati
- [ ] Setiap langkah sesi uji punya event yang sesuai, dan sebaliknya
- [ ] Event penting terkirim tepat satu kali per aksi
- [ ] Semua properti wajib ada, terisi, dan bertipe benar
- [ ] Setiap temuan dihubungkan ke success metric yang terdampak

## Ringkasan

- Success metrics dihitung dari event, jadi analytics adalah bagian dari fitur dan harus diuji sebelum rilis.
- Cocokkan setiap event dengan tracking plan: terkirim, jumlah, waktu, properti, dan tipe data.
- Lakukan sesi uji dengan langkah tercatat, lalu cocokkan langkah dengan log event.
- Hubungkan setiap temuan ke metrik yang terdampak supaya prioritasnya jelas.
- Sekarang semua bahan sudah terkumpul: fungsional, performa, dan analytics. Artikel terakhir menyatukannya jadi keputusan rilis.
