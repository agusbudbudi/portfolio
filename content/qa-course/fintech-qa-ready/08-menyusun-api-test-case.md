---
title: Menyusun API Test Case
slug: menyusun-api-test-case
excerpt: API test case yang baik menyebut request lengkap dan expected response, bukan sekadar "cek endpoint jalan". Pelajari kategori test API dan cara menulisnya.
seo_title: Cara Menyusun API Test Case + Contoh
seo_description: Format API test case dan empat kategorinya: positif, validasi input, autentikasi, dan aturan bisnis. Termasuk penerapan BVA di level API dan contoh lengkap.
category: API Testing
tags: api testing, test case, validation, authentication, rest api
visibility: library
course: Fintech QA Ready · Modul 3 (API Testing) · Lesson 2
---

"Cek endpoint booking jalan." Ini bukan test case. Siapa pun yang membacanya tidak tahu request apa yang harus dikirim, kapan dianggap pass, atau apa yang sebenarnya sedang dibuktikan.

API test case yang baik bisa dijalankan oleh orang lain tanpa bertanya, dan hasilnya tidak bisa diperdebatkan. Prinsipnya sama dengan test case UI di course Junior QA Ready, hanya saja langkah-langkah klik diganti dengan request yang lengkap.

## Format API test case

| Field | Isinya |
|---|---|
| ID | Kode unik, misalnya `API-BK-01` |
| Judul | Apa yang dibuktikan, dalam satu kalimat |
| Endpoint | Method dan path |
| Precondition | Kondisi data sebelum request: akun, saldo, status pesanan |
| Request | Header dan body yang dikirim |
| Expected status | Status code yang diharapkan |
| Expected body | Field dan nilai penting di response |
| Expected side effect | Perubahan data yang harus terjadi, atau tidak terjadi |

Kolom terakhir sering dilupakan. Response yang benar belum tentu berarti datanya benar. Topik ini dibahas detail di lesson berikutnya.

## Empat kategori test API

Untuk setiap endpoint, susun test case dari empat kategori berikut.

### 1. Positif

Request valid dengan data normal. Buktikan endpoint melakukan tugasnya. Biasanya cukup satu sampai dua test case per endpoint, ditambah variasi penting (misalnya satu kursi dan empat kursi).

### 2. Validasi input

Server harus menolak input yang tidak valid, walaupun UI sudah mencegahnya. Ingat, siapa pun bisa mengirim request langsung tanpa lewat aplikasi.

- **Field wajib kosong atau tidak dikirim.**
- **Tipe data salah:** angka dikirim sebagai teks, array dikirim sebagai string.
- **Nilai di luar batas:** terlalu kecil, terlalu besar, negatif, desimal.
- **Format salah:** tanggal, nomor telepon, ID yang tidak sesuai pola.

### 3. Autentikasi dan otorisasi

- Tanpa header `Authorization`.
- Token tidak valid atau kedaluwarsa.
- Token user A untuk mengakses atau mengubah data milik user B.

Kasus terakhir sangat penting di fitur uang. Kalau user A bisa melihat atau membayar pesanan user B hanya dengan mengganti ID di path, itu celah keamanan serius.

### 4. Aturan bisnis

Ini kategori yang paling bergantung pada PRD dan ringkasan pemahamanmu di Modul 1.

- Batas jumlah, nominal, atau frekuensi.
- Status yang tidak mengizinkan aksi tertentu, misalnya membayar pesanan yang sudah kedaluwarsa.
- Perhitungan: total, biaya, diskon.
- Konflik data: kursi yang sudah dipesan orang lain.

## Menerapkan BVA di level API

Teknik Boundary Value Analysis dari course Junior QA Ready sangat cocok untuk API, karena kamu bisa mengirim nilai apa pun tanpa dibatasi UI.

Misalkan aturan TiketJalan: satu pesanan berisi **1 sampai 4 kursi**. Nilai uji yang dipilih:

| Jumlah kursi | Harapan |
|---|---|
| 0 (array kosong) | Ditolak, `422` |
| 1 | Diterima, `201` |
| 4 | Diterima, `201` |
| 5 | Ditolak, `422 MAX_SEATS_EXCEEDED` |

Tambahkan nilai yang hanya bisa dikirim lewat API: kursi yang sama dua kali dalam satu array (`["3A", "3A"]`), atau ID kursi yang tidak ada di bus tersebut.

## Yang dicek di setiap response

Jangan berhenti di status code. Periksa empat hal:

1. **Status code** sesuai kontrak.
2. **Struktur body:** field yang wajib ada memang ada, dengan tipe data yang benar.
3. **Nilai:** angka, status, dan teks sesuai data yang dikirim dan aturan bisnis.
4. **Error:** untuk request gagal, kode error dan pesannya tepat dan tidak membocorkan detail teknis seperti stack trace atau query database.

## Contoh: test case endpoint booking TiketJalan

Precondition umum: login sebagai penumpang A, jadwal `SCH-2201` dengan kursi 3A dan 3B tersedia, kursi 5C sudah dipesan penumpang lain.

| ID | Kategori | Request | Expected |
|---|---|---|---|
| API-BK-01 | Positif | `POST /v1/bookings` body `{schedule_id: "SCH-2201", seats: ["3A"]}` | `201`, `status: waiting_payment`, total sesuai harga + biaya layanan |
| API-BK-02 | Positif | Body dengan 4 kursi tersedia | `201`, total untuk 4 kursi, biaya layanan dihitung sekali |
| API-BK-03 | Validasi | `seats: []` | `422`, tidak ada pesanan baru |
| API-BK-04 | Validasi | 5 kursi | `422 MAX_SEATS_EXCEEDED` |
| API-BK-05 | Validasi | `schedule_id` tidak dikirim | `400` atau `422` sesuai kontrak, bukan `500` |
| API-BK-06 | Auth | Tanpa header `Authorization` | `401`, tidak ada pesanan baru |
| API-BK-07 | Auth | `GET /v1/bookings/{id}` milik penumpang B dengan token A | `403` atau `404`, data B tidak tampil |
| API-BK-08 | Aturan bisnis | `seats: ["5C"]` | `409 SEAT_UNAVAILABLE`, kursi 5C tetap milik pemesan awal |

Delapan test case ini mencakup empat kategori untuk satu endpoint. Untuk endpoint lain, ulangi pola yang sama.

## Kesalahan umum

- **Hanya menguji positif.** Endpoint yang "jalan" belum tentu aman.
- **Expected yang kabur.** "Response sukses" bukan expected. Tulis status code dan nilai yang dicek.
- **Tidak mencatat request lengkap.** Test case tanpa body yang persis tidak bisa diulang.
- **Mengabaikan 500.** Error server dari input user selalu layak dilaporkan.

## Latihan singkat

Susun lima test case untuk `POST /v1/bookings/{id}/pay` di TiketJalan. Pastikan ada minimal satu dari setiap kategori: positif, validasi, autentikasi, dan aturan bisnis (misalnya membayar pesanan yang sudah kedaluwarsa).

## Ringkasan

- API test case memuat endpoint, precondition, request lengkap, expected status, expected body, dan expected side effect.
- Susun dari empat kategori: positif, validasi input, autentikasi dan otorisasi, serta aturan bisnis.
- BVA sangat efektif di API karena kamu bisa mengirim nilai yang tidak bisa dimasukkan lewat UI.
- Periksa status code, struktur body, nilai, dan kualitas pesan error.
- Lesson berikutnya membahas hal yang sering terlewat: side effect dan idempotency.
