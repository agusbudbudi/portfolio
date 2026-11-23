---
title: Kasus Gagal yang Sering Hilang dari PRD
slug: kasus-gagal-yang-sering-hilang-dari-prd
excerpt: PRD biasanya hanya menulis alur sukses. Pelajari daftar kasus gagal dan aspek non-fungsional yang wajib ditanyakan untuk fitur pembayaran, dari saldo kurang dan timeout sampai transaksi dobel.
seo_title: Kasus Gagal yang Sering Hilang dari PRD Pembayaran
seo_description: Katalog kasus gagal fitur pembayaran: saldo kurang, timeout, kedaluwarsa, transaksi dobel, idempotency, dan keamanan. Wajib ditanyakan QA sebelum coding.
category: QA Fundamentals
tags: requirement, negative testing, idempotency, security, fintech
visibility: library
course: Fintech QA Ready · Modul 1 (Requirement) · Lesson 2
---

Coba buka PRD mana pun di tim kamu dan hitung berapa acceptance criteria yang dimulai dengan "User bisa..." atau "Setelah berhasil...". Biasanya hampir semuanya. Sekarang hitung berapa yang membahas "Kalau gagal...". Sering kali nol.

Ini bukan karena PM ceroboh. PM menulis dari sudut pandang tujuan: apa yang user ingin capai. Alur gagal terasa seperti detail teknis yang "nanti diurus developer". Masalahnya, kalau perilaku gagal tidak ditentukan di PRD, developer akan menentukannya sendiri, dan frontend serta backend bisa memilih perilaku yang berbeda.

Di fitur uang, alur gagal justru tempat bug paling mahal bersembunyi. Artikel ini memberi katalog kasus gagal yang bisa kamu pakai setiap kali mereview PRD pembayaran.

## Mendeteksi PRD "happy path only"

Tanda-tandanya mudah dikenali:

- Semua AC berisi kata kerja positif: "bisa", "berhasil", "muncul", "terbit".
- Tidak ada satu pun pesan error yang ditulis.
- Status transaksi hanya disebut "berhasil", tanpa status lain.
- Mockup hanya berisi layar sukses, tanpa empty state atau layar error.

Kalau kamu menemukan dua atau lebih tanda ini, siapkan waktu ekstra. Hampir pasti ada banyak gap di bagian gagal.

## Katalog kasus gagal

Pakai daftar ini sebagai pemandu. Tidak semua kategori relevan untuk setiap fitur, tapi menelusuri semuanya memastikan tidak ada yang terlewat.

| Kategori | Contoh pertanyaan |
|---|---|
| Input tidak valid | Nominal nol, negatif, desimal, huruf, terlalu panjang? |
| Batas terlampaui | Melebihi batas per transaksi, harian, atau jenis akun? |
| Dana atau kuota kurang | Saldo tidak cukup, kursi habis, kuota promo habis? Dicek sebelum atau sesudah biaya? |
| Identitas gagal | PIN atau OTP salah, sesi habis di tengah transaksi? |
| Pihak ketiga gagal | Bank atau payment gateway menolak, lambat, atau tidak merespons? |
| Waktu habis | Kode bayar kedaluwarsa, user membayar setelah batas waktu? |
| Aksi ganda | Tombol bayar ditekan dua kali, request dikirim ulang karena sinyal jelek? |
| Pembatalan | User batal di tengah proses, atau minta refund setelah sukses? |
| Data berubah | Harga atau ketersediaan berubah antara user melihat dan user membayar? |

Untuk setiap kategori yang relevan, pastikan PRD menjawab tiga hal: **apa yang dicegah, apa yang tampil ke user, dan bagaimana status transaksinya.**

## Status transaksi: siapa mengubah, dan kapan

Transaksi uang hampir tidak pernah langsung "berhasil". Biasanya ada perjalanan status, misalnya:

```
dibuat → menunggu pembayaran → berhasil
                             → gagal
                             → kedaluwarsa
berhasil → refund diproses → refund selesai
```

Saat mereview, gambar diagram sederhana seperti di atas dan tanyakan:

- **Status apa saja yang ada?** Kalau PRD hanya menyebut "berhasil", tanyakan status lainnya.
- **Apa pemicu perpindahan status?** Aksi user, konfirmasi bank, atau batas waktu?
- **Kapan uang atau stok benar-benar berubah?** Misalnya, kursi di TiketJalan dikurangi saat pesanan dibuat atau saat pembayaran berhasil?
- **Apakah status bisa mundur?** Bisakah pesanan kedaluwarsa kembali jadi berhasil kalau bank terlambat mengirim konfirmasi?

Pertanyaan terakhir sering membuka diskusi penting. Di dunia nyata, konfirmasi pembayaran bisa datang terlambat. Sistem harus punya jawaban yang jelas.

## Aspek non-fungsional yang wajib ditanya

Selain alur gagal, ada beberapa aspek non-fungsional yang hampir selalu relevan untuk fitur uang.

### Idempotency

Idempotency artinya: **request yang sama dikirim berkali-kali, efeknya tetap satu kali.** Bayangkan user menekan tombol bayar, sinyal putus, lalu aplikasi mengirim ulang request. Tanpa idempotency, user bisa tertagih dua kali.

Pertanyaan untuk PM atau engineering lead: "Kalau request pembayaran yang sama terkirim dua kali, apakah sistem menjamin hanya satu transaksi yang tercatat?" Cara mengujinya dibahas detail di modul API Testing.

### Keamanan

- Berapa kali percobaan PIN atau OTP yang diizinkan, dan apa yang terjadi setelahnya?
- Data pribadi pihak lain (nama, nomor) ditampilkan utuh atau disamarkan?
- Apakah endpoint penting bisa diakses tanpa login?

### Performa dan ketersediaan

- Berapa lama user menunggu sebelum muncul pesan timeout?
- Kalau pihak ketiga sedang gangguan, apakah user mendapat pesan yang jelas atau hanya loading tanpa akhir?

### Jejak audit

- Apakah setiap transaksi punya ID yang bisa dipakai CS untuk melacak?
- Apakah riwayat transaksi menampilkan status terakhir dengan benar, termasuk yang gagal?

## Dari kasus gagal ke pertanyaan klarifikasi

Course Junior QA Ready sudah membahas cara menulis pertanyaan klarifikasi yang baik: spesifik, menyebut lokasi, dan bisa dijawab singkat. Untuk kasus gagal, tambahkan satu elemen: **skenario konkret**.

Bandingkan dua pertanyaan ini:

> **Kurang kuat:** "Bagaimana kalau pembayaran gagal?"

> **Lebih kuat:** "US-04 AC3: Kalau bank mengirim konfirmasi pembayaran setelah kode bayar kedaluwarsa, apakah pesanan berubah jadi berhasil dan e-tiket terbit, atau uang dikembalikan? Kalau dikembalikan, berapa lama dan apa yang tampil di riwayat user? Tanpa aturan ini, user berisiko sudah membayar tapi tidak mendapat tiket."

Pertanyaan kedua menyebut lokasi, menggambarkan skenario yang bisa dibayangkan semua orang, menawarkan pilihan jawaban, dan menjelaskan dampaknya.

## Latihan singkat

Kembali ke story US-04 TiketJalan dari lesson sebelumnya. Tanpa melihat jawaban, tulis lima kasus gagal dari katalog di atas yang relevan untuk story itu. Untuk masing-masing, tulis satu pertanyaan klarifikasi dengan skenario konkret.

Contoh jawaban untuk satu kasus:

> **Aksi ganda.** US-04 AC1: Kalau user menekan "Bayar" dua kali dengan cepat, apakah terbit dua kode bayar dan dua kursi tertahan? Seharusnya hanya satu. Tanpa aturan ini, kursi bisa tertahan ganda dan user bingung membayar kode yang mana.

## Ringkasan

- PRD cenderung hanya menulis alur sukses. Di fitur uang, alur gagal adalah tempat bug paling mahal.
- Pakai katalog kasus gagal: input tidak valid, batas, dana kurang, identitas, pihak ketiga, waktu habis, aksi ganda, pembatalan, dan data berubah.
- Gambar diagram status transaksi dan tanyakan pemicu serta kapan uang atau stok berubah.
- Jangan lupa aspek non-fungsional: idempotency, keamanan, performa, dan jejak audit.
- Pertanyaan klarifikasi untuk kasus gagal paling kuat kalau memuat skenario konkret dan dampaknya.
