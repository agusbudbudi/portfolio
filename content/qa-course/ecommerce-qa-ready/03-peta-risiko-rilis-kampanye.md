---
title: Peta Risiko Rilis Kampanye
slug: peta-risiko-rilis-kampanye
excerpt: Rilis menjelang kampanye punya risiko yang tidak ada di rilis biasa. Cara menyusun peta risiko yang memilih ide pengujian paling efektif untuk setiap area.
seo_title: Peta Risiko Rilis Kampanye untuk QA E-commerce
seo_description: Cara menyusun peta risiko rilis kampanye e-commerce: menilai kemungkinan dan dampak di kondisi puncak, lalu memilih ide pengujian yang paling efektif per area.
category: Test Planning
tags: risk analysis, kampanye, release planning, test strategy, e-commerce
visibility: library
course: E-commerce QA Ready · Modul 1 (Requirement) · Lesson 3
---

Ada satu perbedaan besar antara rilis biasa dan rilis kampanye: **di rilis kampanye, kamu tidak punya hari kedua.**

Bug di rilis biasa bisa ditemukan user, dilaporkan, lalu di-fix minggu depan. Bug di malam Payday Sale ditemukan oleh puluhan ribu user dalam lima menit, viral di media sosial dalam satu jam, dan kampanyenya selesai sebelum hotfix sempat dirilis.

Karena itu, setelah mengumpulkan gap dari PRD, kamu perlu satu alat lagi: **peta risiko** yang menjawab "di mana kita paling mungkin gagal saat kampanye, dan pengujian apa yang paling efektif untuk mencegahnya?"

## Mengingat dasar: kemungkinan × dampak

Kalau kamu sudah membaca **Risk-Based Testing: Likelihood × Impact** di Fintech QA Ready, konsepnya sama. Setiap area dinilai dari dua sisi:

- **Kemungkinan:** seberapa mungkin area ini bermasalah?
- **Dampak:** kalau bermasalah, seberapa parah akibatnya?

Yang berbeda di rilis kampanye adalah **cara menilai keduanya**.

## Kemungkinan naik saat kampanye

Beberapa sinyal kemungkinan hanya muncul di kondisi kampanye:

| Sinyal | Kenapa naik saat kampanye |
|---|---|
| Diperebutkan | Kuota dan stok yang aman di hari biasa jadi rebutan di detik pertama |
| Bergantung pada traffic | Area yang lambat sedikit di hari biasa bisa timeout di traffic puncak |
| Aturan baru | Promo kampanye sering membawa aturan yang belum pernah ada |
| Banyak gap PRD | Area dengan banyak pertanyaan klarifikasi biasanya baru diputuskan menjelang coding |
| Ditulis ulang | Bagian yang ditulis ulang total belum punya riwayat dipakai di produksi |

Gap yang kamu temukan di dua artikel sebelumnya adalah sinyal kemungkinan. Area dengan lima pertanyaan klarifikasi jelas lebih berisiko dari area dengan nol pertanyaan.

## Dampak berlipat saat kampanye

Dampak juga dinilai dengan kacamata kampanye:

- **Jangkauan.** Bug yang mengenai 1% user di hari biasa mengenai ribuan orang di malam kampanye.
- **Waktu.** Tidak ada waktu untuk perbaikan sebelum kampanye selesai.
- **Uang.** Promo yang bocor dikali traffic kampanye bisa menghabiskan budget dalam hitungan jam.
- **Kepercayaan.** User yang gagal memakai promo di malam kampanye jarang mencoba lagi.

## Dari risiko ke ide pengujian

Peta risiko yang berguna tidak berhenti di skor. Setiap area perlu **ide pengujian** yang paling efektif untuk menurunkan risikonya. Kuncinya: jenis risiko menentukan jenis pengujian.

| Jenis risiko | Pengujian yang paling efektif |
|---|---|
| Salah hitung harga dan diskon | Boundary value, decision table, verifikasi rumus manual |
| Kuota dan stok diperebutkan | Uji konkurensi di level API, load test dengan skenario rebutan |
| Performa saat puncak | Load test dan spike test dengan target p95 |
| Tampilan dan informasi harga | Design review terhadap file desain |
| Pesanan dobel | Uji klik dobel dan retry, cek idempotency |
| Tidak bisa mengukur keberhasilan | Validasi event analytics terhadap tracking plan |

Kesalahan yang umum adalah menulis "lakukan testing menyeluruh" untuk semua area. Itu bukan ide pengujian, itu harapan. Ide pengujian menyebut **teknik** dan **apa yang dicek**.

## Contoh: peta risiko Promo Payday Sale

| Area | Apa yang bisa salah | Kemungkinan | Dampak | Ide pengujian |
|---|---|---|---|---|
| Perhitungan total & promo | Diskon persen tanpa batas, pembulatan salah | Tinggi: rumus ditulis ulang, 3 gap PRD | Tinggi: uang | Boundary di minimal transaksi dan batas diskon, hitung manual setiap baris ringkasan |
| Kuota promo | Promo terpakai melebihi kuota | Tinggi: diperebutkan di menit pertama | Tinggi: budget bocor | Uji paralel di API, load test dengan banyak user memakai kode yang sama |
| Stok kamar promo | Kamar terakhir terjual ke dua tamu | Sedang: ada locking, tapi baru | Tinggi: tamu datang tanpa kamar | Uji dua booking bersamaan untuk kamar terakhir |
| Performa pembuatan booking | Timeout saat puncak | Sedang: belum pernah diuji di 5× | Tinggi: booking gagal massal | Load test dan spike test dengan target p95 |
| Tampilan harga | Diskon tidak terlihat sebagai pengurang | Sedang: komponen baru | Sedang: user bingung, ticket CS | Design review halaman ringkasan |
| Booking dobel | Klik dobel membuat dua tagihan | Sedang | Tinggi: refund manual | Uji klik dobel, retry setelah error jaringan |

Perhatikan kolom kemungkinan dan dampak: setiap nilai punya alasan singkat. Tanpa alasan, PM tidak bisa setuju atau membantah.

## Memakai peta risiko

Peta risiko bukan dokumen untuk disimpan. Pakai untuk tiga keputusan:

1. **Urutan.** Area tinggi-tinggi diuji paling awal, supaya bug-nya ditemukan saat masih ada waktu fix.
2. **Permintaan ke tim lain.** Load test butuh tim platform. Data uji kuota butuh backend. Minta sekarang, bukan seminggu sebelum kampanye.
3. **Bahan Go / No-Go.** Di akhir course, kamu akan kembali ke peta ini dan bertanya: risiko mana yang sudah turun, mana yang masih terbuka?

## Checklist peta risiko kampanye

- [ ] Minimal 5 area berbeda, bukan 5 variasi dari area yang sama
- [ ] Kemungkinan dan dampak dinilai dengan alasan untuk kondisi kampanye
- [ ] Setiap area punya ide pengujian yang menyebut teknik dan apa yang dicek
- [ ] Jenis pengujian cocok dengan jenis risikonya
- [ ] Ada area non-fungsional: performa, kuota, atau analytics

## Ringkasan

- Rilis kampanye tidak punya hari kedua, jadi risiko harus dipetakan sebelum pengujian dimulai.
- Kemungkinan naik untuk area yang diperebutkan, bergantung traffic, atau baru ditulis ulang.
- Dampak berlipat karena jangkauan, waktu, uang, dan kepercayaan.
- Jenis risiko menentukan jenis pengujian: boundary untuk hitungan, konkurensi untuk kuota, load test untuk performa, design review untuk tampilan.
- Salah satu area di peta ini adalah tampilan. Modul berikutnya membahas cara menguji tampilan dengan sistematis: design review.
