---
title: State yang Sering Hilang dari Desain
slug: state-yang-sering-hilang-dari-desain
excerpt: File desain biasanya menggambar kondisi ideal. Cara menemukan state, data ekstrem, dan perilaku yang tidak pernah didesain, lalu membedakannya dari bug.
seo_title: State yang Sering Hilang dari Desain UI
seo_description: Cara menemukan gap desain: state loading, empty, dan error yang tidak digambar, data ekstrem, dan perilaku yang dikarang engineer. Beda dengan bug.
category: Design QA
tags: design review, ui state, edge case, design gap, ux
visibility: library
course: E-commerce QA Ready · Modul 2 (Design Review) · Lesson 2
---

File desain hampir selalu menggambar hari yang cerah: data lengkap, nama pendek, jaringan lancar, dan semua tombol berhasil. Aplikasi sungguhan tidak hidup di hari yang cerah.

Saat developer bertemu kondisi yang tidak digambar, ia harus memutuskan sendiri. Kadang keputusannya bagus, kadang tidak. Yang pasti, keputusan itu tidak pernah dilihat desainer atau PM.

Di artikel sebelumnya kamu belajar mencari **perbedaan** antara desain dan build. Artikel ini membahas hal yang lebih sulit dilihat: **yang tidak ada** di desain.

## Bug, gap desain, atau perlu konfirmasi?

Sebelum masuk ke daftar state, pahami tiga jenis temuan ini:

| Jenis | Ciri | Ke siapa |
|---|---|---|
| Bug implementasi | Desain sudah jelas, build berbeda | Developer |
| Gap desain | Desain tidak mendefinisikan sesuatu, developer mengarang sendiri | Desainer, untuk diputuskan |
| Perlu konfirmasi | Desain dan PRD bertentangan, atau desainnya sendiri terlihat bermasalah | Desainer dan PM |

Membedakan ketiganya penting. Melaporkan gap desain sebagai bug membuat developer bingung ("saya harus mengikuti desain yang mana?") dan desainer tidak pernah tahu ada keputusan yang dibutuhkan.

Contoh di InapYuk: build menampilkan skeleton abu-abu saat daftar kamar dimuat, padahal desain tidak punya frame loading. Itu **bukan bug**. Developer mengisi kekosongan. Yang benar adalah bertanya ke desainer: "Skeleton ini sudah sesuai yang kamu mau? Kalau belum, tolong desainkan."

## State yang sering hilang

Untuk setiap komponen yang bisa berinteraksi, cek apakah desain punya state berikut:

| State | Pertanyaan |
|---|---|
| Loading | Apa yang terlihat saat data dimuat atau tombol sedang diproses? |
| Empty | Apa yang terlihat kalau datanya kosong? Tidak ada kamar, tidak ada promo |
| Error | Gagal jaringan, server error, data tidak valid. Pesannya apa, di mana? |
| Disabled | Kapan tombol nonaktif, dan bagaimana tampilannya? |
| Partial | Sebagian data gagal dimuat, misalnya foto tidak muncul |
| Success | Apa yang terlihat setelah aksi berhasil? |
| Berubah di tengah | Kondisi berubah saat user masih di halaman, misalnya promo kedaluwarsa |

State "berubah di tengah" sering terlupakan, padahal paling berhubungan dengan gap konkurensi yang kamu temukan di Modul 1. Kalau PRD bilang "kuota dicek ulang saat Pesan", desain harus punya tampilan untuk "kuota sudah habis".

## Data ekstrem

Desain dibuat dengan data contoh yang rapi. Ganti dengan data yang paling tidak rapi:

- **Teks panjang:** nama hotel 80 karakter, nama tipe kamar dua baris, alamat lengkap dengan patokan.
- **Angka besar:** total booking Rp 125.750.000 di layar 360px. Muat di satu baris?
- **Angka kecil atau nol:** hotel tanpa ulasan, rating 0, promo dengan potongan Rp 0.
- **Jumlah banyak:** 15 promo di daftar. Bisa di-scroll? Tombol bawah tetap terlihat?
- **Bahasa dan format:** tanggal lintas bulan dan tahun, nama tamu dengan karakter khusus.

Setiap kondisi yang tidak tergambar di desain dan belum jelas perilakunya adalah gap.

## Perilaku yang dikarang engineer

Jenis ketiga lebih halus: perilaku yang **ada di build** tetapi tidak ada di desain atau PRD. Cara menemukannya: coba semua interaksi di build, lalu tanyakan "apakah ini ada di desain?"

Contoh di InapYuk build v3.8.0-rc1:

- Setelah promo dipakai, muncul toast "Promo dipakai" selama 3 detik. Desain tidak punya toast.
- Tombol Terapkan filter berubah menjadi spinner selama hasil dimuat. Desain hanya punya state default.
- Saat koneksi putus, muncul halaman error generik dari sistem lama.

Ketiganya mungkin perilaku yang baik. Tapi belum disahkan, jadi tulis sebagai pertanyaan.

## Menulis pertanyaan untuk desainer

Format yang membantu desainer memutuskan dengan cepat:

| Area | Jenis gap | Pertanyaan untuk desainer | Kenapa penting |
|---|---|---|---|
| Filter hotel | Perilaku dikarang engineer | Build menampilkan spinner di tombol Terapkan filter. Ini sudah sesuai? Filter lain bisa diubah selama proses? | Tanpa keputusan, tiap halaman bisa punya pola loading berbeda |
| Daftar promo | State tidak ada | Apa tampilan kalau tidak ada promo yang tersedia? | Halaman kosong terlihat seperti error |
| Kartu hotel | Data ekstrem | Nama hotel lebih dari 2 baris dipotong atau dibiarkan? | Harga terdorong ke bawah, tidak terlihat |
| Ringkasan | Berubah di tengah | Kalau promo kedaluwarsa saat tamu masih di halaman ini, apa yang terlihat? | PRD mewajibkan cek ulang, tapi tidak ada tampilan |

Perhatikan kolom "kenapa penting". Desainer punya banyak permintaan. Pertanyaan dengan alasan yang jelas lebih cepat dijawab.

## Latihan singkat

Buka halaman checkout di aplikasi belanja yang kamu pakai sehari-hari. Matikan internet sebentar lalu tekan tombol bayar. Lalu kembali, ubah jumlah barang menjadi angka besar. Catat tiga state yang menurutmu tidak didesain dengan sengaja, dan tulis pertanyaan untuk desainernya.

## Ringkasan

- File desain menggambar kondisi ideal. Kondisi lain diputuskan diam-diam oleh developer kalau tidak ditanyakan.
- Bedakan bug implementasi, gap desain, dan hal yang perlu konfirmasi, karena tujuannya berbeda.
- Cek state loading, empty, error, disabled, partial, success, dan kondisi yang berubah di tengah.
- Uji dengan data ekstrem, dan catat perilaku di build yang tidak ada di desain sebagai pertanyaan, bukan bug.
- Beberapa state yang hilang juga membuat aplikasi sulit dipakai oleh sebagian user. Artikel berikutnya membahas aksesibilitas dasar.
