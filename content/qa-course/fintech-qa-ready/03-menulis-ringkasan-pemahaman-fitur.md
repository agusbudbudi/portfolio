---
title: Menulis Ringkasan Pemahaman Fitur
slug: menulis-ringkasan-pemahaman-fitur
excerpt: Sebelum menulis satu test case pun, pastikan pemahamanmu sama dengan PM dan developer. Ringkasan fitur satu halaman adalah cara tercepat menyamakan persepsi.
seo_title: Menulis Ringkasan Pemahaman Fitur untuk QA
seo_description: Cara QA menulis ringkasan fitur satu halaman: tujuan, alur, aturan bisnis yang bisa dites, asumsi, dan pertanyaan terbuka untuk menyamakan persepsi dengan PM.
category: QA Fundamentals
tags: requirement, komunikasi, dokumentasi, qa intermediate
visibility: library
course: Fintech QA Ready · Modul 1 (Requirement) · Lesson 3
---

Pernah mengalami ini? Di akhir sprint kamu melaporkan bug, lalu developer menjawab, "Itu bukan bug, memang begitu maksudnya." PM ikut masuk diskusi dan ternyata punya tafsiran ketiga. Tiga orang membaca PRD yang sama, tapi punya gambaran fitur yang berbeda.

Masalah seperti ini tidak bisa dicegah dengan pertanyaan klarifikasi saja. Pertanyaan menutup gap yang kamu **sadari**. Ringkasan pemahaman menangkap gap yang **tidak kamu sadari**, yaitu bagian yang kamu kira sudah paham padahal tafsiranmu berbeda.

Caranya sederhana: tulis ulang fitur dengan bahasamu sendiri, lalu minta PM membacanya. Kalau PM bilang "betul", kamu siap menyusun test. Kalau PM bilang "bukan begitu", kamu baru saja mencegah satu sprint penuh bug palsu.

## Kenapa ringkasan, bukan langsung test case?

| | Ringkasan pemahaman | Test case |
|---|---|---|
| Panjang | Satu halaman | Puluhan sampai ratusan baris |
| Waktu baca PM | 3 sampai 5 menit | Hampir tidak pernah dibaca PM |
| Menangkap salah paham | Sebelum ada pekerjaan turunan | Setelah semua test case ditulis |
| Biaya kalau salah | Edit beberapa kalimat | Tulis ulang banyak test case |

Ringkasan adalah titik pemeriksaan murah sebelum kamu menginvestasikan waktu besar ke test design.

## Isi ringkasan

Ringkasan yang baik cukup memuat tujuh bagian. Semuanya pendek.

1. **Tujuan.** Satu atau dua kalimat: masalah user apa yang diselesaikan dan bagaimana keberhasilannya diukur.
2. **Aktor.** Siapa saja yang terlibat: jenis user, admin, sistem pihak ketiga.
3. **Alur utama.** Langkah bernomor dari awal sampai akhir, termasuk perpindahan status.
4. **Aturan bisnis.** Semua angka, batas, dan aturan, ditulis sebagai kalimat yang bisa dites.
5. **Di luar scope.** Apa yang sengaja tidak termasuk rilis ini.
6. **Asumsi.** Hal yang kamu anggap benar tapi tidak tertulis di PRD.
7. **Pertanyaan terbuka.** Gap yang belum dijawab, dengan tautan ke daftar pertanyaan klarifikasi.

## Menulis aturan bisnis yang bisa dites

Bagian aturan bisnis adalah inti ringkasan. Ujiannya sama seperti saat membedah AC: **bisakah kalimat ini dibuktikan pass atau fail?**

| Kurang bisa dites | Bisa dites |
|---|---|
| Kursi ditahan sementara. | Kursi ditahan 30 menit sejak kode bayar terbit. Setelah itu pesanan berstatus kedaluwarsa dan kursi kembali tersedia. |
| Ada biaya layanan. | Biaya layanan Rp 4.000 per transaksi, bukan per tiket, dan tidak dikembalikan saat refund. |
| Jumlah tiket dibatasi. | Maksimal 4 tiket per transaksi. Pilihan kursi kelima dinonaktifkan dengan pesan "Maksimal 4 kursi per pesanan". |

Perhatikan bahwa versi "bisa dites" selalu punya angka, satuan, dan konsekuensi. Kalau kamu tidak bisa menulis versi ini karena PRD tidak menyebutnya, itu tanda bagian tersebut harus masuk ke pertanyaan terbuka.

## Pisahkan fakta dan asumsi

Kesalahan paling berbahaya di ringkasan adalah mencampur hal yang tertulis di PRD dengan hal yang kamu tebak. PM membaca cepat, dan tebakanmu bisa terlihat seperti fakta yang sudah disepakati.

Aturannya:

- **Aturan bisnis** hanya berisi hal yang tertulis di PRD atau sudah dijawab PM. Sebutkan sumbernya kalau perlu, misalnya "(jawaban PM, 12 Nov)".
- **Asumsi** berisi tebakanmu yang masuk akal. Tulis dengan jelas sebagai asumsi agar PM bisa mengoreksi.

> **Asumsi:** Harga tiket yang tampil di halaman pilih kursi sudah termasuk pajak. Biaya layanan ditambahkan terpisah di halaman pembayaran.

Kalimat seperti ini mengundang PM untuk bilang "betul" atau "salah". Keduanya berguna.

## Contoh ringkasan: pembayaran kode bayar TiketJalan

Berikut contoh ringkasan untuk story US-04 dari lesson sebelumnya, setelah beberapa pertanyaan dijawab PM.

> **Tujuan**
> Penumpang tanpa kartu kredit bisa membayar tiket lewat kode bayar bank. Target: 30% pesanan baru memakai kode bayar dalam 2 bulan.
>
> **Aktor**
> Penumpang (login), sistem bank (mengirim konfirmasi pembayaran).
>
> **Alur utama**
> 1. Penumpang memilih jadwal dan kursi, lalu memilih metode kode bayar.
> 2. Sistem membuat pesanan berstatus *menunggu pembayaran*, menerbitkan kode bayar, dan menahan kursi.
> 3. Penumpang membayar lewat aplikasi bank.
> 4. Bank mengirim konfirmasi. Pesanan berubah *berhasil* dan e-tiket terbit.
> 5. Kalau tidak dibayar dalam batas waktu, pesanan berubah *kedaluwarsa* dan kursi dilepas.
>
> **Aturan bisnis**
> - Kursi ditahan 30 menit sejak kode bayar terbit.
> - Maksimal 4 tiket per transaksi.
> - Biaya layanan Rp 4.000 per transaksi, tidak dikembalikan saat refund.
> - Satu pesanan hanya punya satu kode bayar aktif.
>
> **Di luar scope**
> Pembayaran kartu kredit, refund otomatis, perubahan jadwal.
>
> **Asumsi**
> Harga tiket sudah termasuk pajak. Penumpang hanya bisa punya satu pesanan menunggu pembayaran untuk jadwal yang sama.
>
> **Pertanyaan terbuka**
> - Konfirmasi bank yang datang setelah kedaluwarsa diperlakukan bagaimana? (Q-03)
> - Apa yang tampil kalau kursi terakhir diambil orang lain saat penumpang sedang di halaman pembayaran? (Q-05)

Seluruh ringkasan bisa dibaca kurang dari lima menit, tapi memuat semua yang perlu disepakati sebelum test design dimulai.

## Kesalahan umum

- **Menyalin PRD.** Ringkasan yang isinya potongan kalimat PRD tidak menguji pemahamanmu. Tulis dengan bahasamu sendiri.
- **Terlalu panjang.** Kalau lebih dari satu halaman, kemungkinan kamu sudah menulis test case. Pangkas.
- **Tanpa alur status.** Untuk fitur uang, perpindahan status adalah bagian paling penting. Jangan dilewatkan.
- **Tidak dikirim.** Ringkasan yang hanya disimpan sendiri kehilangan setengah manfaatnya. Kirim ke PM dan engineering lead, minta konfirmasi.

## Checklist sebelum dikirim ke PM

- [ ] Tujuan menyebut masalah user dan cara mengukur keberhasilan.
- [ ] Alur utama bernomor dan memuat perpindahan status, termasuk status gagal.
- [ ] Setiap aturan bisnis punya angka, satuan, dan konsekuensi.
- [ ] Fakta dan asumsi dipisahkan dengan jelas.
- [ ] Di luar scope ditulis eksplisit.
- [ ] Pertanyaan terbuka merujuk ke daftar pertanyaan klarifikasi.
- [ ] Panjangnya tidak lebih dari satu halaman.

## Ringkasan

- Ringkasan pemahaman menangkap salah paham yang tidak kamu sadari, sebelum ada test case yang harus ditulis ulang.
- Isinya tujuh bagian pendek: tujuan, aktor, alur utama, aturan bisnis, di luar scope, asumsi, dan pertanyaan terbuka.
- Aturan bisnis harus bisa dites: punya angka, satuan, dan konsekuensi.
- Pisahkan fakta dari asumsi supaya PM bisa mengoreksi dengan cepat.
- Dengan ringkasan yang disetujui, kamu siap masuk ke Modul 2: menyusun test plan.
