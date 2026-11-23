---
title: "Risk-Based Testing: Likelihood × Impact"
slug: risk-based-testing-likelihood-impact
excerpt: Waktu uji selalu kurang. Risk-based testing membantu memutuskan area mana yang diuji paling dalam, dengan alasan yang bisa dijelaskan ke tim.
seo_title: Risk-Based Testing: Likelihood × Impact
seo_description: Cara menilai risiko dengan likelihood × impact, membuat matriks risiko, dan memakai skornya untuk menentukan kedalaman, level, dan urutan pengujian.
category: Test Planning
tags: risk based testing, risk analysis, prioritas, test management
visibility: library
course: Fintech QA Ready · Modul 2 (Test Plan) · Lesson 2
---

Tidak ada tim yang punya waktu untuk menguji semuanya secara mendalam. Pertanyaannya bukan "apakah kita akan melewatkan sesuatu", tapi **"apa yang boleh kita uji lebih sedikit, dan kenapa?"**

Tanpa metode, jawaban pertanyaan itu bergantung pada perasaan: area yang paling sering dilihat, area yang paling mudah dites, atau area yang paling diingat. Risk-based testing mengganti perasaan itu dengan penilaian yang bisa dijelaskan dan didiskusikan.

## Risiko = likelihood × impact

Risiko punya dua komponen:

- **Likelihood:** seberapa mungkin area ini punya bug?
- **Impact:** kalau ada bug di sini, seberapa parah akibatnya?

Area dengan likelihood tinggi tapi impact rendah (misalnya teks tombol di halaman bantuan) tidak perlu diuji sedalam area dengan likelihood sedang tapi impact sangat tinggi (misalnya perhitungan total pembayaran).

## Menilai likelihood

Likelihood bukan tebakan. Ada sinyal yang bisa kamu kumpulkan dari PRD, developer, dan riwayat bug:

| Sinyal | Likelihood naik kalau... |
|---|---|
| Kode baru | Area ini ditulis dari nol di sprint ini |
| Kompleksitas | Banyak aturan, kondisi, atau perhitungan |
| Integrasi | Bergantung pada pihak ketiga (bank, payment gateway) |
| Riwayat bug | Area ini sering bermasalah di rilis sebelumnya |
| Kejelasan requirement | Banyak pertanyaan klarifikasi yang baru dijawab menjelang coding |
| Tekanan waktu | Dikerjakan terburu-buru atau oleh orang yang baru mengenal kodenya |

Tanyakan langsung ke developer: "Bagian mana yang paling bikin kamu tidak yakin?" Jawabannya sering sangat jujur dan sangat berguna.

## Menilai impact

Impact dilihat dari sisi user dan bisnis:

| Sinyal | Impact naik kalau bug bisa... |
|---|---|
| Uang | Membuat user atau perusahaan kehilangan uang |
| Data | Merusak, menghilangkan, atau membocorkan data |
| Jangkauan | Mengenai semua user, bukan segelintir |
| Alur inti | Menghalangi user menyelesaikan tujuan utamanya |
| Reputasi | Viral di media sosial atau menurunkan rating aplikasi |
| Regulasi | Melanggar aturan yang berlaku |

Di fitur uang, hampir semua area yang menyentuh perhitungan atau perpindahan dana otomatis punya impact tinggi.

## Skala dan matriks

Pakai skala sederhana 1 sampai 3 untuk masing-masing komponen:

| Skor | Likelihood | Impact |
|---|---|---|
| 1 | Kecil kemungkinan ada bug | Mengganggu, ada jalan lain |
| 2 | Mungkin ada bug | Alur terhambat atau data tidak tepat |
| 3 | Sangat mungkin ada bug | Kerugian uang, data, atau keamanan |

Kalikan keduanya untuk mendapat skor risiko 1 sampai 9. Lalu kelompokkan:

| Skor | Prioritas | Perlakuan |
|---|---|---|
| 6 sampai 9 | Tinggi | Diuji paling awal dan paling dalam, di beberapa level, termasuk kasus negatif dan batas |
| 3 sampai 4 | Sedang | Alur utama dan kasus negatif penting |
| 1 sampai 2 | Rendah | Smoke test atau cek cepat saja |

Kamu boleh memakai skala 1 sampai 5 kalau butuh detail lebih. Yang penting konsisten dan semua orang di tim memahami artinya.

## Contoh: tabel risiko TiketJalan

Berikut analisis risiko untuk fitur pembayaran kode bayar TiketJalan:

| ID | Area / risiko | L | I | Skor | Prioritas | Alasan singkat |
|---|---|---|---|---|---|---|
| R1 | Tagihan ganda saat tombol bayar ditekan dua kali | 2 | 3 | 6 | Tinggi | Kode baru, user langsung rugi uang |
| R2 | Kursi terjual dua kali saat dua user membayar bersamaan | 2 | 3 | 6 | Tinggi | Race condition, penumpang tidak dapat kursi |
| R3 | Konfirmasi bank terlambat setelah pesanan kedaluwarsa | 3 | 3 | 9 | Tinggi | Integrasi bank, aturan baru dijawab PM kemarin |
| R4 | Total tagihan salah karena biaya layanan | 2 | 3 | 6 | Tinggi | Perhitungan, banyak kombinasi jumlah tiket |
| R5 | Pesan error tidak sesuai PRD | 2 | 1 | 2 | Rendah | Mengganggu, tidak merugikan |
| R6 | Riwayat pesanan tidak menampilkan status kedaluwarsa | 2 | 2 | 4 | Sedang | User bingung, ticket CS naik |

Perhatikan kolom **alasan**. Tanpa alasan, angka di tabel hanya tebakan yang dibungkus rapi. Dengan alasan, PM dan developer bisa membantah atau setuju, dan diskusi itu sendiri berharga.

## Dari skor ke keputusan

Skor risiko baru berguna kalau mengubah cara kamu bekerja. Untuk setiap prioritas, tentukan:

- **Kedalaman.** Risiko tinggi mendapat kasus negatif, batas, dan kombinasi. Risiko rendah cukup satu atau dua cek.
- **Level pengujian.** R1 dan R2 lebih efektif diuji di level API, karena kamu bisa mengirim request ganda atau bersamaan dengan presisi. R5 cukup di UI.
- **Urutan.** Uji risiko tinggi lebih dulu. Kalau waktu habis, yang tertinggal adalah risiko rendah.
- **Regression.** Area berisiko tinggi masuk regression suite. Ini akan dipakai lagi di Modul 4.

## Risk-based testing bukan alasan untuk malas

Ada salah kaprah bahwa risk-based testing berarti "area risiko rendah tidak dites". Bukan begitu. Area risiko rendah tetap dites, hanya dengan usaha yang lebih kecil. Yang berubah adalah **proporsi**, bukan cakupan.

Satu lagi: tabel risiko harus diperbarui. Kalau di tengah sprint kamu menemukan banyak bug di area yang tadinya dinilai sedang, naikkan likelihood-nya dan sesuaikan rencana.

## Latihan singkat

Tambahkan dua risiko baru ke tabel TiketJalan di atas untuk fitur "maksimal 4 tiket per transaksi". Beri skor L dan I, hitung prioritasnya, tulis alasannya, lalu tentukan level pengujian yang paling tepat untuk masing-masing.

## Ringkasan

- Risiko adalah likelihood × impact. Likelihood dari sinyal teknis, impact dari dampak ke user dan bisnis.
- Pakai skala sederhana dan konsisten, lalu kelompokkan ke prioritas tinggi, sedang, dan rendah.
- Setiap skor wajib punya alasan supaya bisa didiskusikan.
- Skor menentukan kedalaman, level pengujian, urutan, dan isi regression suite.
- Risk-based testing mengubah proporsi usaha, bukan menghapus area dari pengujian.
