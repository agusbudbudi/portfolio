---
title: "Dasar HTTP untuk QA: Method, Status Code, Header, Body"
slug: dasar-http-untuk-qa
excerpt: Sebelum menguji API, kamu perlu bisa membaca request dan response. Artikel ini membahas dasar HTTP yang paling sering dipakai QA sehari-hari.
seo_title: Dasar HTTP untuk QA: Method, Status Code, Header
seo_description: Dasar HTTP untuk API testing: anatomi request dan response, method, status code yang wajib dihafal, Bearer token, dan cara membaca kontrak API.
category: API Testing
tags: api testing, http, status code, rest api
visibility: library
course: Fintech QA Ready · Modul 3 (API Testing) · Lesson 1
---

Setiap kali kamu menekan tombol "Bayar" di aplikasi, aplikasi mengirim pesan ke server dan menunggu balasan. Pesan itu disebut **request**, balasannya disebut **response**, dan aturan komunikasinya disebut **HTTP**.

API testing pada dasarnya adalah mengirim request langsung ke server, tanpa lewat tampilan aplikasi, lalu memeriksa apakah response-nya sesuai harapan. Untuk itu, kamu perlu bisa membaca kedua pesan tersebut. Kabar baiknya, strukturnya selalu sama.

## Anatomi request

Sebuah request terdiri dari empat bagian:

```
POST /v1/bookings?lang=id HTTP/1.1
Host: api.tiketjalan.test
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{
  "schedule_id": "SCH-2201",
  "seats": ["3A", "3B"]
}
```

| Bagian | Contoh di atas | Fungsinya |
|---|---|---|
| Method | `POST` | Jenis aksi yang diminta |
| Path dan query | `/v1/bookings?lang=id` | Sumber daya yang dituju, plus parameter tambahan |
| Header | `Authorization`, `Content-Type` | Informasi tambahan: siapa pengirimnya, format datanya |
| Body | JSON berisi jadwal dan kursi | Data yang dikirim ke server |

Tidak semua request punya body. Request `GET` biasanya tidak punya body dan mengirim parameter lewat query.

## Method yang paling sering dipakai

| Method | Arti | Contoh di TiketJalan |
|---|---|---|
| `GET` | Mengambil data | Lihat detail pesanan |
| `POST` | Membuat data baru atau menjalankan aksi | Buat pesanan, bayar |
| `PUT` / `PATCH` | Mengubah data | Ubah nama penumpang |
| `DELETE` | Menghapus data | Batalkan pesanan yang belum dibayar |

Satu sifat penting untuk QA: `GET` seharusnya **tidak mengubah apa pun** di server. Kalau memanggil `GET` ternyata mengubah status pesanan, itu bug, sekecil apa pun kelihatannya.

## Anatomi response

Response terdiri dari tiga bagian:

```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "data": {
    "booking_id": "BK-90812",
    "status": "waiting_payment",
    "total": 254000,
    "expires_at": "2026-11-23T10:30:00+07:00"
  }
}
```

| Bagian | Contoh | Fungsinya |
|---|---|---|
| Status code | `201 Created` | Ringkasan hasil dalam satu angka |
| Header | `Content-Type` | Informasi tentang response |
| Body | JSON berisi data pesanan | Hasil lengkapnya |

Saat request gagal, body biasanya berisi informasi error:

```json
{
  "error": {
    "code": "SEAT_UNAVAILABLE",
    "message": "Kursi 3B sudah dipesan penumpang lain."
  }
}
```

Kode error seperti `SEAT_UNAVAILABLE` penting untuk QA. Kode ini dipakai aplikasi untuk menentukan pesan yang tampil, jadi kode yang salah bisa membuat pesan di layar ikut salah walaupun status code-nya benar.

## Status code yang wajib kamu hafal

Status code dikelompokkan berdasarkan angka pertamanya. **2xx** berarti sukses, **4xx** berarti kesalahan dari sisi pengirim request, dan **5xx** berarti kesalahan di server.

| Kode | Nama | Kapan muncul |
|---|---|---|
| 200 | OK | Request berhasil, misalnya mengambil data |
| 201 | Created | Data baru berhasil dibuat |
| 400 | Bad Request | Format request salah atau data tidak valid |
| 401 | Unauthorized | Tidak ada token atau token tidak valid |
| 403 | Forbidden | Token valid, tapi tidak punya hak akses ke data ini |
| 404 | Not Found | Data yang dicari tidak ada |
| 409 | Conflict | Bentrok dengan kondisi saat ini, misalnya kursi sudah dipesan |
| 422 | Unprocessable Entity | Format benar tapi melanggar aturan bisnis |
| 429 | Too Many Requests | Terlalu banyak request dalam waktu singkat |
| 500 | Internal Server Error | Server error yang tidak tertangani |

Dua pasangan yang sering tertukar:

- **401 vs 403.** 401 artinya "saya tidak tahu kamu siapa". 403 artinya "saya tahu kamu siapa, tapi kamu tidak boleh melakukan ini". Mengakses pesanan milik user lain seharusnya 403 atau 404, bukan 200.
- **400 vs 422.** Tim berbeda memakainya berbeda. Yang penting, ikuti kontrak API yang disepakati dan pastikan konsisten.

Satu aturan yang hampir universal: **input dari user tidak boleh menghasilkan 500.** Kalau mengirim nominal berupa huruf membuat server error 500, itu bug, karena server seharusnya menolak dengan 4xx dan pesan yang jelas.

## Autentikasi dengan Bearer token

Sebagian besar API yang menyangkut data user mewajibkan login. Alurnya biasanya begini:

1. Kirim request login dengan kredensial, server membalas dengan **token**.
2. Untuk request berikutnya, kirim token itu di header: `Authorization: Bearer <token>`.
3. Server memeriksa token sebelum memproses request.

Sebagai QA, kamu akan sering menguji tiga kondisi: request **tanpa token**, dengan **token tidak valid atau kedaluwarsa**, dan dengan **token milik user lain**. Ketiganya harus ditolak.

## Membaca kontrak API

Developer biasanya menyediakan kontrak API: daftar endpoint, request yang diterima, dan response yang diharapkan. Contoh ringkas untuk TiketJalan:

| Endpoint | Body / query | Sukses | Error yang mungkin |
|---|---|---|---|
| `POST /v1/bookings` | `schedule_id`, `seats` | `201` pesanan baru | `409 SEAT_UNAVAILABLE`, `422 MAX_SEATS_EXCEEDED` |
| `GET /v1/bookings/{id}` | - | `200` detail pesanan | `404 BOOKING_NOT_FOUND` |
| `POST /v1/bookings/{id}/pay` | `method` | `200` kode bayar | `409 BOOKING_EXPIRED` |

Saat membaca kontrak, tanyakan hal yang sama seperti saat membaca PRD: apakah setiap batas, error, dan status sudah disebut? Kontrak API adalah requirement juga, dan gap di sini sama mahalnya.

## Ringkasan

- Request terdiri dari method, path dan query, header, serta body. Response terdiri dari status code, header, dan body.
- `GET` tidak boleh mengubah data. `POST` membuat data atau menjalankan aksi.
- Hafalkan status code utama, terutama beda 401 dan 403. Input dari user tidak boleh menghasilkan 500.
- Endpoint yang butuh login diuji dengan tiga kondisi: tanpa token, token tidak valid, dan token milik user lain.
- Kontrak API adalah requirement. Baca dengan teliti sebelum menyusun API test case di lesson berikutnya.
