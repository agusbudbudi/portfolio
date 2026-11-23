---
title: Membaca PRD Fitur Uang dengan Kacamata Risiko
slug: membaca-prd-fitur-uang-dengan-kacamata-risiko
excerpt: Fitur yang menyentuh uang tidak cukup dites happy path-nya. Pelajari cara membaca PRD pembayaran sambil mencari angka tanpa batas jelas, aturan yang hilang, dan risiko ke user maupun bisnis.
seo_title: Review PRD Fitur Pembayaran dengan Kacamata Risiko
seo_description: Cara QA mereview PRD fitur uang: lensa uang, keamanan, dan regulasi, aturan tiga jawaban untuk tiap angka, dan format temuan yang mudah diprioritaskan PM.
category: QA Fundamentals
tags: requirement, prd, fintech, risk, qa intermediate
visibility: library
course: Fintech QA Ready · Modul 1 (Requirement) · Lesson 1
---

Di fitur biasa, bug membuat user kesal. Di fitur uang, bug membuat user **kehilangan uang**, dan perusahaan ikut menanggung akibatnya: refund massal, ticket CS menumpuk, bahkan teguran regulator. Satu angka yang salah dibulatkan bisa terlihat kecil di satu transaksi, tapi berubah jadi jutaan rupiah setelah dikali ribuan transaksi per hari.

Karena itu, QA di squad payment tidak cukup bertanya "fitur ini jalan atau tidak?". Pertanyaan yang lebih tepat: **"Kalau fitur ini salah, siapa yang rugi dan berapa besar?"**

Artikel ini melanjutkan cara membaca PRD dari course Junior QA Ready. Kalau belum terbiasa dengan teknik "baca dua kali" dan membedah acceptance criteria, baca dulu artikel *Cara Membaca PRD sebagai QA*. Di sini kita fokus pada lapisan tambahan: membaca dengan kacamata risiko.

## Kenapa fitur uang punya standar lebih tinggi

Ada tiga hal yang membuat fitur pembayaran berbeda dari fitur lain:

| Aspek | Fitur biasa | Fitur uang |
|---|---|---|
| Dampak bug | User kesal, mungkin pindah aplikasi | User rugi uang, perusahaan wajib mengganti |
| Pemulihan | Rilis perbaikan, selesai | Rekonsiliasi data, refund, investigasi transaksi satu per satu |
| Pihak luar | Jarang | Bank, payment gateway, regulator, auditor |

Konsekuensinya, bagian PRD yang di fitur lain boleh "nanti saja ditentukan" justru wajib jelas sebelum coding. Terutama angka, status, dan apa yang terjadi saat sesuatu gagal.

## Tiga lensa membaca PRD fitur uang

Setelah bacaan pertama (memahami cerita), baca ulang PRD dengan tiga lensa berikut. Setiap lensa punya pertanyaan pemandunya sendiri.

### Lensa 1: Uang

Ikuti aliran uangnya. Dari mana uang masuk, ke mana keluar, dan kapan saldo atau tagihan berubah.

- Siapa yang membayar, berapa, dan dengan metode apa?
- Ada biaya admin, diskon, atau pembulatan? Dihitung dari angka yang mana?
- Kapan uang dianggap pindah: saat tombol ditekan, saat bank konfirmasi, atau saat proses settlement?
- Kalau transaksi batal, uang kembali ke mana dan berapa lama?

### Lensa 2: Keamanan

Fitur uang adalah target favorit orang iseng dan penipu. Bayangkan kamu adalah user yang berniat curang.

- Bagaimana sistem tahu yang bertransaksi benar-benar pemilik akun?
- Apa yang terjadi kalau seseorang mencoba menebak PIN atau OTP berkali-kali?
- Data pribadi apa yang tampil di layar, dan apakah orang lain bisa melihatnya?
- Bisakah nominal atau penerima diubah setelah konfirmasi?

### Lensa 3: Regulasi dan aturan bisnis

Banyak batas di fitur uang bukan pilihan produk, melainkan kewajiban. Misalnya batas saldo untuk akun yang belum verifikasi identitas, atau batas nilai transaksi harian.

- Ada batas per transaksi, per hari, atau per bulan?
- Apakah batasnya berbeda untuk jenis akun yang berbeda?
- Ada data yang wajib disimpan untuk keperluan audit?

Kamu tidak harus hafal regulasinya. Cukup sadar bahwa batas-batas ini ada, lalu pastikan PRD menyebutnya.

## Setiap angka butuh tiga jawaban

Ini kebiasaan paling penting di modul ini. Setiap kali melihat angka di PRD fitur uang, pastikan ada tiga jawaban:

1. **Batasnya berapa?** Minimal dan maksimal, bukan salah satunya saja.
2. **Inklusif atau tidak?** "Minimal Rp 50.000" berarti Rp 50.000 boleh atau tidak?
3. **Apa yang terjadi kalau dilanggar?** Tombol dinonaktifkan, muncul pesan error, atau transaksi ditolak di server? Pesan apa yang tampil?

Kalau salah satu jawaban tidak ada, catat sebagai gap. Ingat, angka yang ambigu di PRD hampir pasti jadi bug di aplikasi, karena developer frontend dan backend bisa menafsirkannya berbeda.

## Contoh: booking tiket di TiketJalan

Misalkan kamu QA di TiketJalan, aplikasi fiktif pemesanan tiket bus antarkota. PM menulis story berikut:

> **US-04: Bayar tiket dengan kode bayar**
> Sebagai penumpang, saya ingin membayar tiket lewat kode bayar bank supaya tidak perlu kartu kredit.
>
> - AC1: Setelah memilih kursi, user mendapat kode bayar.
> - AC2: Kursi ditahan selama user belum membayar.
> - AC3: Setelah pembayaran berhasil, e-tiket terbit.
> - AC4: Ada biaya layanan untuk setiap transaksi.

Sekarang baca dengan tiga lensa:

| Lokasi | Temuan | Lensa | Dampak kalau dibiarkan |
|---|---|---|---|
| AC2 | Kursi ditahan berapa lama? Apa yang terjadi kalau user membayar setelah waktu habis? | Uang | User sudah bayar tapi kursi sudah dijual ke orang lain |
| AC4 | Biaya layanan berapa? Per tiket atau per transaksi? Ikut dikembalikan saat refund? | Uang | Total yang ditagih berbeda antara aplikasi dan bank |
| AC1 | Bisakah satu user menahan banyak kursi tanpa membayar? | Keamanan | Orang iseng memborong kursi, penumpang asli tidak kebagian |
| AC3 | Kalau bank terlambat mengirim konfirmasi, status pesanan apa? | Uang | User sudah dipotong, tiket belum terbit, CS kebanjiran |
| Umum | Tidak ada batas jumlah tiket per transaksi | Regulasi / bisnis | Tidak bisa dites karena tidak ada aturan yang bisa dibuktikan |

Perhatikan bahwa setiap temuan punya kolom **dampak**. Kolom ini yang membedakan review QA intermediate dari sekadar daftar pertanyaan. Dampak membantu PM memprioritaskan mana yang harus dijawab sebelum sprint dimulai.

## Format catatan review

Agar mudah ditindaklanjuti, tulis setiap temuan dengan format yang sama:

> **[Lokasi]** AC2 di US-04
> **[Temuan]** Lama penahanan kursi tidak disebut, begitu juga perilaku saat user membayar setelah waktu habis.
> **[Dampak]** Risiko user membayar untuk kursi yang sudah dijual ke orang lain, sehingga perlu refund manual.

Tiga bagian ini cukup. Lokasi membuat PM tidak perlu mencari, temuan menjelaskan apa yang kurang, dan dampak menjelaskan kenapa harus dijawab sekarang.

## Checklist review PRD fitur uang

Sebelum menyerahkan hasil review, cek daftar ini:

- [ ] Setiap angka punya batas minimal dan maksimal.
- [ ] Jelas apakah batasnya inklusif.
- [ ] Ada perilaku dan pesan untuk setiap batas yang dilanggar.
- [ ] Biaya, diskon, dan pembulatan dijelaskan cara hitungnya.
- [ ] Setiap status transaksi disebut, termasuk status gagal dan kedaluwarsa.
- [ ] Ada perlindungan dari percobaan menebak PIN atau OTP.
- [ ] Batas yang berbeda per jenis akun disebut.
- [ ] Setiap temuan punya lokasi, isi, dan dampak.

## Ringkasan

- Di fitur uang, bug berarti kerugian nyata. Pertanyaan pemandunya: siapa yang rugi dan berapa besar?
- Baca PRD dengan tiga lensa: uang, keamanan, serta regulasi dan aturan bisnis.
- Setiap angka butuh tiga jawaban: batasnya, inklusif atau tidak, dan apa yang terjadi kalau dilanggar.
- Tulis temuan dengan format lokasi, temuan, dampak supaya PM bisa langsung memprioritaskan.
- Lesson berikutnya membahas bagian PRD yang paling sering hilang: kasus gagal.
