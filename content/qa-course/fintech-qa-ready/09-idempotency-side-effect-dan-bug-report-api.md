---
title: Idempotency, Side Effect, dan Bug Report API
slug: idempotency-side-effect-dan-bug-report-api
excerpt: Response 201 belum tentu berarti benar. Pelajari cara mengecek side effect, menguji idempotency agar tidak terjadi transaksi dobel, dan menulis bug report API yang bisa langsung direproduksi.
seo_title: Idempotency, Side Effect, dan Bug Report API
seo_description: Cara QA menguji idempotency agar tidak ada transaksi dobel, mengecek side effect di balik response, dan menulis bug report API yang bisa direproduksi.
category: API Testing
tags: api testing, idempotency, bug report, side effect, fintech
visibility: library
course: Fintech QA Ready · Modul 3 (API Testing) · Lesson 3
---

Bayangkan kamu mengirim request booking dan server membalas `201 Created` dengan body yang rapi. Test case pass? Belum tentu. Bisa saja kursinya tidak benar-benar ditahan, total di database berbeda dengan yang tampil di response, atau pesanan tercatat dua kali.

Response adalah **apa yang server katakan**. Side effect adalah **apa yang benar-benar terjadi**. Di fitur uang, keduanya harus dicek.

## Side effect: cek apa yang berubah

Setiap request yang mengubah data seharusnya punya efek yang bisa diverifikasi. Biasanya dengan memanggil endpoint lain setelahnya.

| Request | Side effect yang dicek | Cara mengecek |
|---|---|---|
| Buat pesanan | Kursi berstatus ditahan | `GET` ketersediaan kursi jadwal tersebut |
| Bayar pesanan | Status pesanan berubah, e-tiket terbit | `GET /v1/bookings/{id}` |
| Batalkan pesanan | Kursi kembali tersedia | `GET` ketersediaan kursi |
| Request yang ditolak | **Tidak ada** yang berubah | `GET` data terkait, bandingkan dengan sebelum request |

Baris terakhir paling sering dilupakan. Request yang ditolak dengan `422` bisa saja tetap menahan kursi atau membuat pesanan setengah jadi. Response-nya benar, tapi datanya kotor. Ini jenis bug yang sulit ditemukan lewat UI karena user hanya melihat pesan error.

Kebiasaan yang membantu: **catat kondisi sebelum request, kirim request, lalu bandingkan kondisi sesudahnya.** Selisihnya harus persis sesuai harapan, tidak lebih dan tidak kurang.

## Idempotency: satu aksi, satu efek

Jaringan seluler tidak selalu stabil. User menekan tombol bayar, request terkirim, server memproses, tapi response-nya hilang di jalan. Aplikasi tidak tahu apakah pembayaran berhasil, jadi ia mengirim ulang request yang sama.

Tanpa perlindungan, server akan memproses request kedua sebagai pembayaran baru. User tertagih dua kali.

**Idempotency** adalah jaminan bahwa request yang sama, dikirim berapa kali pun, hanya menghasilkan satu efek. Cara yang paling umum: aplikasi mengirim header unik untuk setiap aksi, misalnya:

```
POST /v1/bookings/BK-90812/pay
Idempotency-Key: 7f3c9a2e-1b4d-4c8e-9f21-0a6b5d3e8c11
```

Server menyimpan key itu. Kalau request dengan key yang sama datang lagi, server tidak memproses ulang, tapi mengembalikan hasil yang sama seperti request pertama.

## Cara menguji idempotency

Ada beberapa skenario yang wajib dicoba:

| Skenario | Harapan |
|---|---|
| Kirim request yang sama dua kali dengan key yang sama | Response kedua sama dengan yang pertama. Hanya **satu** transaksi tercatat |
| Kirim request dengan key berbeda | Diproses sebagai aksi baru (sesuai aturan bisnis) |
| Key sama, tapi body berbeda | Ditolak, biasanya `409` atau `422`. Key tidak boleh dipakai ulang untuk aksi lain |
| Tanpa header key (kalau wajib) | Ditolak dengan pesan jelas |
| Dua request dengan key sama dikirim hampir bersamaan | Tetap hanya satu transaksi |

Untuk setiap skenario, jangan hanya membaca response. **Cek side effect-nya.** Hitung jumlah transaksi di riwayat dan pastikan total tagihan tidak bertambah dua kali.

Kalau API yang kamu uji tidak memakai header key, idempotency tetap bisa diuji dengan cara yang sama: kirim request identik dua kali dan hitung efeknya. Hasilnya menjadi masukan penting untuk tim, karena tidak adanya perlindungan ini sendiri sudah merupakan risiko.

## Bug report API

Bug report API punya satu keunggulan dibanding bug report UI: bisa direproduksi dengan **sangat presisi**. Manfaatkan itu. Developer seharusnya bisa menyalin request dari laporanmu dan langsung melihat bug yang sama.

Isi bug report API:

| Bagian | Isinya |
|---|---|
| Judul | Endpoint + kondisi + akibat |
| Environment | Staging, versi build atau API |
| Precondition | Akun, data, status sebelum request |
| Request | Method, path, header penting, body lengkap. Format cURL sangat membantu |
| Expected | Status code, body, dan side effect sesuai kontrak atau PRD |
| Actual | Status code, body, dan side effect yang terjadi |
| Dampak | Kenapa ini penting bagi user atau bisnis |
| Severity | Lihat panduan di bawah |

Jangan lupa **sensor token** di laporan. Ganti dengan `<token>`.

## Contoh bug report: pembayaran dobel

> **Judul:** `POST /v1/bookings/{id}/pay` memproses pembayaran dua kali untuk Idempotency-Key yang sama
>
> **Environment:** staging, API v1 build 2.8.0-rc1
>
> **Precondition:** login sebagai penumpang A, pesanan `BK-90812` berstatus `waiting_payment`, total Rp 254.000.
>
> **Request (dikirim dua kali berturut-turut):**
> ```
> curl -X POST https://api.tiketjalan.test/v1/bookings/BK-90812/pay \
>   -H "Authorization: Bearer <token>" \
>   -H "Idempotency-Key: 7f3c9a2e-1b4d-4c8e-9f21-0a6b5d3e8c11" \
>   -H "Content-Type: application/json" \
>   -d '{"method": "virtual_account"}'
> ```
>
> **Expected:** request kedua mengembalikan response yang sama dengan request pertama. Hanya satu transaksi tercatat di riwayat.
>
> **Actual:** kedua request mengembalikan `200` dengan `payment_id` berbeda (`PY-551`, `PY-552`). Riwayat pesanan menampilkan dua tagihan Rp 254.000.
>
> **Dampak:** user yang koneksinya putus saat membayar bisa tertagih dua kali. Butuh refund manual.
>
> **Severity:** Critical

Perhatikan bahwa laporan ini tidak berisi tebakan penyebab. Tugas QA adalah menjelaskan apa yang terjadi dengan bukti lengkap. Mencari penyebabnya adalah tugas developer.

## Severity untuk bug API fitur uang

Panduan dari course Junior QA Ready tetap berlaku. Untuk fitur uang, beberapa pola hampir selalu masuk severity tinggi:

- **Critical:** tagihan ganda, saldo atau total salah, akses ke data atau transaksi milik user lain, endpoint penting bisa diakses tanpa login.
- **High:** validasi batas tidak berjalan di server, side effect tertinggal saat request ditolak, status transaksi tidak berubah.
- **Medium:** kode error tidak sesuai kontrak sehingga pesan di UI salah, field response hilang tapi tidak dipakai di alur utama.
- **Low:** format pesan, typo di pesan error.

## Ringkasan

- Response menunjukkan apa yang server katakan. Side effect menunjukkan apa yang benar-benar terjadi. Cek keduanya, termasuk untuk request yang ditolak.
- Idempotency menjamin satu aksi menghasilkan satu efek walaupun request dikirim ulang.
- Uji idempotency dengan key sama, key beda, key sama dengan body beda, tanpa key, dan request bersamaan.
- Bug report API harus bisa direproduksi persis: request lengkap (idealnya cURL), expected dan actual termasuk side effect, serta dampak.
- Bug yang membuat user rugi uang atau mengakses data orang lain hampir selalu Critical.
