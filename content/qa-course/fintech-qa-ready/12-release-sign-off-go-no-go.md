---
title: Release Sign-off yang Bisa Dipertanggungjawabkan
slug: release-sign-off-go-no-go
excerpt: Keputusan Go / No-Go harus tegas dan berbasis risiko, bukan perasaan. Pelajari cara menulis sign-off rilis yang jelas, dari apa yang sudah dites, apa yang tersisa, sampai alasan di balik keputusannya.
seo_title: Release Sign-off QA: Go, No-Go, Conditional Go
seo_description: Cara QA menulis release sign-off berbasis risiko: exit criteria, bug terbuka, known issues, mitigasi, dan kapan memberi rekomendasi Conditional Go.
category: Test Planning
tags: release, go no-go, sign-off, test summary, test management
visibility: library
course: Fintech QA Ready · Modul 4 (Regression) · Lesson 3
---

Ini lesson terakhir course Fintech QA Ready. Semua yang sudah kamu pelajari, dari membaca PRD dengan kacamata risiko sampai menjalankan regression, bermuara di satu momen: tim bertanya, **"Jadi, kita rilis atau tidak?"**

Course Junior QA Ready sudah memperkenalkan rekomendasi Go / No-Go dalam test summary. Di sini kita masuk lebih dalam: bagaimana menyusun sign-off untuk fitur uang, kapan memilih Conditional Go, dan bagaimana menulis keputusan yang tetap masuk akal saat dibaca ulang setelah rilis.

## Peran QA dalam keputusan rilis

Ada dua salah kaprah yang berlawanan:

- **"QA yang memutuskan rilis."** Akibatnya QA merasa harus menahan rilis sampai tidak ada bug sama sekali, yang tidak pernah terjadi.
- **"QA hanya melaporkan, PM yang memutuskan."** Akibatnya QA memberi daftar angka tanpa pendapat, dan keputusan diambil tanpa memahami risikonya.

Peran yang sehat ada di tengah. QA memberikan **informasi yang lengkap** tentang kualitas build dan **rekomendasi yang tegas** berdasarkan risiko. Keputusan akhir biasanya diambil bersama PM dan engineering lead. Kalau mereka memutuskan berbeda dengan rekomendasimu, itu sah, asalkan risikonya sudah dipahami dan tercatat.

## Isi sign-off

Sign-off yang baik bisa dibaca dalam dua menit dan menjawab enam hal:

1. **Build dan scope.** Versi apa yang diuji dan apa saja cakupannya.
2. **Hasil pengujian.** Ringkasan per area: retest, fitur baru, regression.
3. **Exit criteria.** Mana yang terpenuhi, mana yang tidak.
4. **Bug terbuka.** Dikelompokkan per severity, dengan dampaknya.
5. **Risiko tersisa.** Area yang tidak diuji atau diuji terbatas, dan kenapa.
6. **Rekomendasi.** Go, No-Go, atau Conditional Go, dengan alasan.

## Go, No-Go, dan Conditional Go

| Rekomendasi | Kapan | Contoh alasan |
|---|---|---|
| Go | Exit criteria terpenuhi, bug tersisa berdampak kecil | Semua alur pembayaran lulus, sisa 2 bug low di tampilan |
| No-Go | Ada bug yang merugikan user atau melanggar aturan, tanpa mitigasi yang memadai | Total tagihan salah untuk pesanan 4 tiket |
| Conditional Go | Ada risiko, tapi bisa dikendalikan dengan syarat tertentu | Fitur baru bermasalah di satu kondisi, bisa dimatikan dengan feature flag |

Conditional Go sering jadi pilihan paling realistis, tapi juga paling mudah disalahgunakan. Syarat yang baik itu **spesifik, bisa dicek, dan punya penanggung jawab**.

| Syarat kabur | Syarat jelas |
|---|---|
| Bug akan segera diperbaiki | BK-24 di-fix dan diretest QA sebelum rilis Kamis 14.00 |
| Fitur dipantau | Engineering lead memantau dashboard error pembayaran 2 jam pertama setelah rilis |
| Rilis hati-hati | Rilis bertahap 10% user di hari pertama, naik ke 100% kalau tidak ada lonjakan ticket CS |

Kalau syaratnya tidak terpenuhi, rekomendasi otomatis berubah jadi No-Go. Tulis itu secara eksplisit.

## Known issues dan mitigasi

Hampir tidak ada rilis tanpa bug terbuka. Yang penting, setiap bug yang ikut rilis adalah **keputusan sadar**, bukan kelalaian. Untuk setiap known issue, catat:

- Dampaknya ke user, dengan bahasa yang dipahami non-teknis.
- Siapa yang menyetujui bug ini ikut rilis.
- Mitigasi: feature flag, rilis bertahap, pesan khusus untuk CS, atau monitoring.
- Kapan dijadwalkan diperbaiki.

Untuk fitur uang, ada satu garis yang hampir tidak pernah boleh dilewati: **bug yang membuat user kehilangan uang, tertagih salah, atau bisa mengakses data orang lain tidak ikut rilis**, kecuali fiturnya dimatikan sepenuhnya.

## Contoh sign-off TiketJalan rc2

> **Release sign-off: Pembayaran kode bayar, build 2.8.0-rc2**
>
> **Scope:** retest BK-12, BK-15, BK-17. Fitur baru pemilih tanggal dan penumpang favorit. Regression terarah pada cari jadwal, isi data, pembayaran, riwayat. Smoke pada refund dan profil.
>
> **Hasil:** 3 dari 3 bug lulus retest. Regression 34 test: 32 pass, 1 fail, 1 blocked.
>
> **Exit criteria:**
> - Semua test prioritas tinggi dijalankan: terpenuhi, kecuali 1 blocked (callback bank staging gangguan, sudah diuji ulang manual oleh backend engineer dan lulus).
> - 0 bug critical/high terbuka: **tidak terpenuhi**, ada 1 high.
>
> **Bug terbuka:**
> - **High, BK-24 (regresi):** tanggal hari ini tidak bisa dipilih di pemilih tanggal baru. User tidak bisa memesan tiket keberangkatan hari ini, sekitar 18% pesanan harian.
> - **Low, BK-19:** pesan error kursi penuh tidak sesuai PRD. Disetujui PM ikut rilis.
>
> **Risiko tersisa:** fitur ubah jadwal tidak diuji (tidak tersentuh, risiko rendah).
>
> **Rekomendasi: Conditional Go.**
> Fitur pembayaran siap. Rilis dengan syarat: (1) BK-24 di-fix dan diretest QA sebelum Kamis 14.00, atau (2) pemilih tanggal lama dipakai kembali lewat feature flag. Kalau keduanya tidak terpenuhi, rekomendasi menjadi **No-Go**, karena 18% pesanan harian terdampak.

Perhatikan bagaimana rekomendasinya menyebut alasan dengan angka dampak, memberi dua jalan keluar yang jelas, dan menyatakan apa yang terjadi kalau syaratnya gagal. Siapa pun yang membaca ulang sign-off ini sebulan kemudian akan paham kenapa keputusan itu diambil.

## Checklist sebelum menekan tombol rilis

- [ ] Versi build yang di-sign-off sama dengan yang akan dirilis.
- [ ] Semua bug critical dan high sudah di-fix dan diretest, atau ada keputusan tertulis.
- [ ] Setiap known issue punya dampak, penyetuju, dan jadwal perbaikan.
- [ ] Syarat Conditional Go spesifik, bisa dicek, dan punya penanggung jawab.
- [ ] Area yang tidak diuji ditulis beserta alasannya.
- [ ] Rencana pemantauan setelah rilis jelas: siapa melihat apa, dan berapa lama.

## Penutup course

Di course ini kamu sudah menempuh perjalanan lengkap seorang QA di squad payment: membaca PRD dengan kacamata risiko, menyusun test plan berbasis risiko, menguji langsung di level API, menjalankan regression yang terarah, dan memberi rekomendasi rilis yang bisa dipertanggungjawabkan.

Benang merahnya satu: **di fitur uang, setiap keputusan QA berangkat dari pertanyaan "kalau ini salah, siapa yang rugi dan berapa besar?"** Pertanyaan itu yang membuat pengujianmu terarah, dan membuat rekomendasimu didengar.

## Ringkasan

- QA memberi informasi lengkap dan rekomendasi tegas. Keputusan akhir diambil bersama, dan perbedaan pendapat dicatat.
- Sign-off memuat build dan scope, hasil, exit criteria, bug terbuka, risiko tersisa, dan rekomendasi.
- Conditional Go hanya sah kalau syaratnya spesifik, bisa dicek, dan punya penanggung jawab.
- Setiap known issue adalah keputusan sadar dengan mitigasi. Bug yang merugikan uang user tidak ikut rilis.
- Tulis sign-off yang tetap masuk akal saat dibaca ulang setelah rilis.
