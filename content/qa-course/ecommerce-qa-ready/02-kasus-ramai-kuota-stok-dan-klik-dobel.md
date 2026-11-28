---
title: "Kasus Ramai: Kuota, Stok, dan Klik Dobel"
slug: kasus-ramai-kuota-stok-dan-klik-dobel
excerpt: Bug yang paling mahal saat kampanye hanya muncul ketika banyak orang bertindak bersamaan. Cara menemukannya sejak di PRD, sebelum ada kode.
seo_title: Kuota, Stok, dan Klik Dobel di PRD Kampanye
seo_description: Cara menemukan kasus konkurensi di PRD e-commerce: kuota promo, stok yang diperebutkan, kondisi yang berubah, klik dobel, dan target performa terukur.
category: QA Fundamentals
tags: race condition, konkurensi, kuota, stok, requirement analysis
visibility: library
course: E-commerce QA Ready · Modul 1 (Requirement) · Lesson 2
---

Di hari biasa, satu tamu memesan satu kamar, membayar, dan selesai. Di malam Payday Sale, sepuluh ribu orang membuka halaman yang sama dalam lima menit pertama. Kamar promo tinggal tiga. Kuota kode promo tinggal dua ratus. Banyak yang menekan tombol Pesan dua kali karena halamannya terasa lambat.

Hampir semua PRD ditulis dengan sudut pandang satu user. Bug yang paling mahal saat kampanye justru muncul ketika **banyak user bertindak bersamaan**, atau ketika **kondisi berubah** di antara dua langkah satu user.

Artikel ini melanjutkan lensa waktu dari artikel sebelumnya.

## Sumber daya yang diperebutkan

Langkah pertama: daftar semua hal di fitur yang **jumlahnya terbatas**. Di Promo Payday Sale InapYuk:

| Sumber daya | Terbatas karena |
|---|---|
| Kamar dengan harga promo | Hotel hanya melepas sedikit kamar untuk Payday |
| Kuota kode promo | Budget promo per hari dibatasi |
| Kuota promo per user | Satu akun hanya boleh memakai promo sekali |
| Slot waktu | Promo hanya berlaku jam tertentu |

Untuk setiap baris, tanyakan: **kapan jumlahnya dikurangi, dan kapan dikembalikan?**

## Kapan dikurangi, kapan dikembalikan

Ini pertanyaan yang paling sering tidak dijawab PRD. Ambil contoh kamar promo:

| Pilihan | Akibat |
|---|---|
| Dikurangi saat booking dibuat | Kamar aman untuk tamu yang sudah booking, tapi bisa "tertahan" oleh booking yang tidak pernah dibayar |
| Dikurangi saat pembayaran berhasil | Kamar tidak tertahan, tapi dua tamu bisa membayar kamar terakhir yang sama (oversell) |

Keduanya punya konsekuensi, dan itu keputusan bisnis, bukan keputusan developer. Kalau dikurangi saat booking dibuat, muncul pertanyaan lanjutan: berapa lama ditahan? Apa yang terjadi kalau batas waktu bayar habis? Kamarnya kembali ke stok?

Hal yang sama berlaku untuk kuota promo. Kalau booking dibatalkan, apakah kuota promonya kembali?

## Kondisi yang berubah di tengah jalan

Satu user butuh beberapa menit dari memilih promo sampai membayar. Selama itu, dunia terus berjalan. Tulis daftar kemungkinan perubahan:

- Kuota promo habis dipakai orang lain.
- Masa berlaku promo lewat (jam 23:59 menjadi 00:00).
- Kamar promo terjual ke orang lain.
- User mengubah jumlah malam sehingga minimal transaksi tidak terpenuhi lagi.
- Harga kamar diperbarui oleh hotel.

Untuk setiap perubahan, pertanyaannya sama: **dicek ulang di titik mana, dan apa yang dilihat user?** Tanpa jawaban, developer biasanya hanya mengecek di awal, saat promo dipilih.

> **Pertanyaan untuk PM:** Kalau kuota PAYDAY25 habis saat tamu sudah di halaman pembayaran, apakah booking tetap dibuat dengan diskon, dibuat tanpa diskon, atau dibatalkan dan tamu diminta memilih ulang? Apa teks yang ditampilkan?

## Klik dobel dan retry

User menekan tombol dua kali karena tidak sabar. Jaringan terputus lalu aplikasi mencoba lagi. Keduanya bisa menghasilkan **dua booking** dan **dua tagihan** untuk satu niat.

Di Fintech QA Ready kamu sudah belajar idempotency dari sisi API. Di level requirement, cukup pastikan PRD menyatakan perilakunya:

- Tombol Pesan nonaktif selama proses?
- Kalau request kedua tetap sampai ke server, apakah ditolak, atau mengembalikan booking yang sama?
- Bagaimana dengan tombol yang ditekan ulang setelah error jaringan?

## Kebutuhan performa yang terukur

Banyak PRD kampanye punya satu kalimat seperti "halaman harus cepat saat traffic tinggi". Kalimat itu tidak bisa dites dan tidak bisa gagal. Ubah menjadi angka dengan empat unsur:

| Unsur | Contoh |
|---|---|
| Apa yang diukur | API pembuatan booking |
| Metrik | Waktu respons p95 |
| Target | < 1 detik |
| Kondisi | Saat traffic 5× hari biasa, di jaringan 4G |

Hasilnya: "API pembuatan booking < 1 detik (p95) saat traffic 5× hari biasa." Sekarang tim bisa mengujinya, dan kamu punya dasar untuk berkata "belum siap" di modul terakhir.

Kalau PM belum tahu angkanya, usulkan angka awal dan minta dikonfirmasi. Angka yang bisa didebat lebih berguna daripada kata "cepat".

## Menulis gap konkurensi

Gap jenis ini sebaiknya diberi label sendiri, supaya PM sadar ini kelompok masalah yang berbeda:

| Lokasi | Jenis | Pertanyaan untuk PM | Risiko jika tidak dijawab |
|---|---|---|---|
| US-05 Pesan | Konkurensi | Kamar promo dikurangi saat booking dibuat atau saat dibayar? | Kamar terakhir terjual ke dua tamu |
| US-03 | Konkurensi | Kuota promo dicek ulang saat pembayaran? | Promo terpakai melebihi budget |
| US-05 | Edge case | Tombol Pesan ditekan dua kali: berapa booking dibuat? | Tagihan ganda, refund manual |
| Non-functional | Non-functional | "Harus cepat": target p95 berapa, di traffic berapa? | Tidak ada dasar untuk menilai hasil load test |

## Latihan singkat

InapYuk menambah fitur "Kamar kedua diskon 50%" untuk Payday. Tulis tiga pertanyaan konkurensi untuk PM tentang fitur itu. Untuk setiap pertanyaan, tulis risiko yang terjadi kalau tidak dijawab.

## Ringkasan

- Bug paling mahal saat kampanye muncul ketika banyak user bertindak bersamaan atau kondisi berubah di tengah alur.
- Daftar semua sumber daya terbatas, lalu tanyakan kapan dikurangi dan kapan dikembalikan.
- Untuk setiap kondisi yang bisa berubah, pastikan PRD menyebut titik pengecekan ulang dan apa yang dilihat user.
- Klik dobel dan retry harus punya perilaku tertulis, dan kalimat "harus cepat" harus diubah jadi angka p95 dengan kondisi.
- Setelah gap terkumpul, kamu perlu memutuskan mana yang paling berbahaya. Itu tugas peta risiko di artikel berikutnya.
