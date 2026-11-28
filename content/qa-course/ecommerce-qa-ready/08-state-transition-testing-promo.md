---
title: "State Transition Testing: Promo yang Berubah Status"
slug: state-transition-testing-promo
excerpt: Promo yang valid saat dipilih bisa jadi tidak valid lima menit kemudian. State transition testing menguji perpindahan status itu, tempat banyak bug kampanye bersembunyi.
seo_title: "State Transition Testing: Contoh Promo dan Booking"
seo_description: Cara memakai state transition testing untuk promo dan booking: diagram status, tabel transisi, transisi tidak valid, dan test case-nya.
category: QA Fundamentals
tags: state transition testing, test design, promo, booking, black box testing
visibility: library
course: E-commerce QA Ready · Modul 3 (Voucher Testing) · Lesson 2
---

Decision table di artikel sebelumnya menjawab pertanyaan "dengan kondisi ini, apa hasilnya?" Tapi kondisi tidak diam. Tamu InapYuk memilih promo INAP2 untuk booking 3 malam, lalu berubah pikiran dan mengurangi jadi 1 malam. Promo yang tadinya valid sekarang tidak memenuhi syarat. Apa yang terjadi?

Kalau tidak ada yang menguji perpindahan itu, sangat mungkin promo tetap menempel, dan tamu mendapat potongan yang tidak berhak ia dapat.

**State transition testing** adalah teknik untuk menguji sesuatu yang punya **status** dan **berpindah status** karena suatu kejadian. Promo dan booking adalah contoh sempurna.

## Unsur state transition

| Unsur | Arti | Contoh |
|---|---|---|
| State | Status saat ini | Promo terpakai |
| Event | Kejadian yang memicu perpindahan | Jumlah malam dikurangi |
| Transisi | Perpindahan dari satu state ke state lain | Terpakai → Dilepas |
| Aksi | Hal yang terjadi saat transisi | Potongan dihapus dari total, muncul pesan alasan |

## Status promo di halaman booking

Dari aturan Promo Payday Sale InapYuk, status sebuah promo dari sudut pandang satu tamu:

- **Tidak layak:** tampil di daftar, belum memenuhi syarat, tidak bisa dipilih
- **Layak:** memenuhi syarat, bisa dipilih
- **Terpakai:** sudah dipilih, potongan masuk ke total
- **Tidak berlaku:** kedaluwarsa atau kuota habis

Gambar sebagai diagram sederhana (cukup kotak dan panah di kertas):

```
Tidak layak ──(syarat terpenuhi)──▶ Layak ──(dipilih)──▶ Terpakai
     ▲                                ▲                    │
     └──────(syarat tidak terpenuhi)──┴────────────────────┤
                                                           │
            Tidak berlaku ◀──(kedaluwarsa / kuota habis)───┘
```

Panah yang paling sering dilupakan developer adalah panah **keluar dari Terpakai**. Masuk ke Terpakai jelas diuji, karena itu alur utama. Keluar dari Terpakai jarang diuji, karena butuh langkah tambahan.

## Tabel transisi

Diagram membantu melihat, tabel membantu menguji. Tulis setiap kombinasi state dan event:

| State awal | Event | State akhir | Aksi yang diharapkan |
|---|---|---|---|
| Tidak layak | Jumlah malam ditambah sampai memenuhi syarat | Layak | Promo bisa dipilih, teks alasan hilang |
| Layak | Dipilih | Terpakai | Potongan masuk ke total |
| Terpakai | Jumlah malam dikurangi di bawah syarat | Tidak layak | Promo dilepas, potongan hilang, ada pesan alasan |
| Terpakai | Jumlah malam ditambah | Terpakai | Potongan dihitung ulang (diskon persen ikut berubah) |
| Terpakai | Kuota habis, lalu Pesan | Tidak berlaku | Booking tidak dibuat, tamu diminta memilih ulang |
| Terpakai | Masa berlaku lewat, lalu Pesan | Tidak berlaku | Booking tidak dibuat, pesan kedaluwarsa |
| Tidak layak | Dipilih lewat kode | Tidak layak | Ditolak, alasan sama dengan di daftar |

Baris terakhir adalah **transisi tidak valid**: event yang seharusnya tidak mengubah state. Menguji transisi tidak valid sama pentingnya dengan menguji yang valid. Bug sering muncul ketika sistem mengizinkan perpindahan yang seharusnya ditolak.

Perhatikan juga baris "Terpakai, jumlah malam ditambah". State tetap sama, tapi **nilainya** harus dihitung ulang. Diskon persen yang tidak ikut berubah saat harga berubah adalah bug yang sering lolos.

## Status booking

Booking juga punya status, dan transisinya menyentuh stok dan kuota:

| State awal | Event | State akhir | Aksi yang diharapkan |
|---|---|---|---|
| Belum ada | Tombol Pesan ditekan | Menunggu bayar | Kamar ditahan, kuota promo terpakai |
| Menunggu bayar | Pembayaran berhasil | Dibayar | Voucher menginap terkirim |
| Menunggu bayar | Batas waktu bayar habis | Kedaluwarsa | Kamar dan kuota promo **dikembalikan** |
| Dibayar | Dibatalkan sesuai kebijakan | Dibatalkan | Refund, kamar dikembalikan |
| Menunggu bayar | Tombol Pesan ditekan lagi | Menunggu bayar | Tidak ada booking kedua |

Baris "kamar dan kuota promo dikembalikan" adalah contoh aksi yang tidak terlihat di layar. Untuk mengujinya, kamu perlu melihat stok atau kuota sebelum dan sesudah, lewat halaman lain, API, atau bantuan developer.

## Dari tabel ke test case

Setiap baris tabel transisi menjadi satu test case dengan tiga bagian: **siapkan state awal**, **picu event**, **cek state akhir dan aksinya**.

> **Test:** Promo terpakai dilepas saat syarat tidak terpenuhi
> **Siapkan:** Booking 3 malam, pakai INAP2 (potongan Rp 75.000 terlihat)
> **Event:** Kurangi jadi 1 malam
> **Expected:** INAP2 dilepas, baris potongan hilang, total dihitung ulang tanpa potongan, ada pesan bahwa INAP2 butuh minimal 2 malam

Langkah "siapkan" sering jadi bagian tersulit. Kalau status awal sulit dicapai (misalnya kuota habis), tanyakan apakah staging punya **data uji** atau **pengaturan** untuk mensimulasikannya. Banyak tim menyediakannya kalau QA meminta sejak awal.

## Checklist state transition

- [ ] Semua state dan event sudah didaftar dari PRD
- [ ] Setiap panah keluar dari state "terpakai" atau "aktif" diuji
- [ ] Ada test untuk transisi tidak valid
- [ ] Nilai dihitung ulang saat state tetap tapi datanya berubah
- [ ] Aksi yang tidak terlihat (stok, kuota) dicek sebelum dan sesudah

## Ringkasan

- State transition testing menguji sesuatu yang berpindah status karena suatu event.
- Gambar diagram, lalu ubah menjadi tabel transisi yang berisi state awal, event, state akhir, dan aksi.
- Panah keluar dari state terpakai dan transisi tidak valid adalah tempat bug paling sering bersembunyi.
- Status booking menyentuh stok dan kuota, jadi cek juga aksi yang tidak terlihat di layar.
- Beberapa transisi dipicu oleh orang lain atau oleh waktu yang sangat singkat. Artikel berikutnya membahas cara menguji race condition.
