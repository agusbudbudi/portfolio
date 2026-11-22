---
title: Menulis Test Case yang Jelas
slug: menulis-test-case-yang-jelas
excerpt: Test case yang baik bisa dijalankan orang lain tanpa bertanya, dan hasilnya tidak bisa diperdebatkan. Pelajari anatomi test case, cara menulis expected result yang spesifik, dan cara memberi prioritas.
category: Manual Testing (pilih di admin)
tags: test case, test design, dokumentasi, manual testing
visibility: library
course: Junior QA Ready · Modul 2 (Test Design) · Lesson 3
---

Test case adalah instruksi. Ukuran kualitasnya sederhana: **bisakah QA lain menjalankannya dan sampai pada kesimpulan yang sama, tanpa bertanya ke kamu?** Kalau jawabannya ya, test case-mu sudah bagus. Kalau tidak, test case itu hanya berguna selama kamu masih ada di tim.

Artikel ini membahas anatomi test case, kesalahan yang paling sering terjadi, dan cara memprioritaskan saat waktunya terbatas.

## Anatomi test case

| Bagian | Isi | Contoh (voucher ongkir di aplikasi fiktif PesanAja) |
|---|---|---|
| **Judul** | Apa yang diverifikasi, dalam satu kalimat | Ongkir menjadi Rp0 saat nilai voucher lebih besar dari ongkir |
| **Prioritas** | P1, P2, atau P3 | P1 |
| **Teknik** | Teknik test design yang dipakai | Boundary Value Analysis |
| **Requirement** | Asal test case | US-02 AC3 |
| **Precondition** | Kondisi yang harus sudah ada sebelum langkah pertama | User login, voucher GRATISONGKIR Rp15.000 aktif, alamat dengan ongkir Rp9.000 |
| **Langkah** | Aksi bernomor | Lihat contoh lengkap di bawah |
| **Data uji** | Nilai yang dipakai | Subtotal Rp60.000, ongkir Rp9.000 |
| **Expected result** | Hasil yang bisa diamati dan pasti | Baris Ongkir Rp0, baris Voucher ongkir -Rp9.000, Total Rp60.000 |

## Contoh lengkap

> **Judul:** Ongkir menjadi Rp0 saat nilai voucher lebih besar dari ongkir
> **Prioritas:** P1 · **Teknik:** Boundary Value Analysis · **Requirement:** US-02 AC3
>
> **Precondition**
> - User sudah login.
> - Voucher GRATISONGKIR (potongan ongkir Rp15.000, minimum belanja Rp50.000) tersedia di akun.
> - Alamat pengiriman "Kantor" dengan ongkir Rp9.000.
>
> **Langkah**
> 1. Tambahkan menu senilai total Rp60.000 ke keranjang.
> 2. Buka halaman checkout dengan alamat "Kantor".
> 3. Ketuk "Pakai voucher", lalu pilih GRATISONGKIR.
> 4. Perhatikan bagian ringkasan pembayaran.
>
> **Expected result**
> - Subtotal: Rp60.000
> - Ongkir: Rp9.000
> - Voucher ongkir: -Rp9.000 (bukan -Rp15.000)
> - Total bayar: Rp60.000

Perhatikan expected result-nya. Tidak ada kata "sesuai", "benar", atau "berhasil". Setiap baris berisi angka yang bisa langsung dicocokkan dengan layar.

## Expected result harus spesifik

Ini bagian yang paling sering lemah di test case pemula:

| ❌ Kabur | ✅ Spesifik |
|---|---|
| Voucher berhasil dipakai | Baris "Voucher ongkir -Rp9.000" muncul di ringkasan |
| Total dihitung dengan benar | Total bayar Rp60.000 |
| Muncul pesan error | Muncul teks "Voucher ini sudah kamu pakai" di bawah kolom voucher |
| Halaman tampil normal | Daftar voucher tampil dalam satu kolom tanpa scroll horizontal di lebar 360px |

Untuk test case kalkulasi, **hitung angka expected secara manual sebelum menjalankan tes.** Tulis perhitungannya di catatan kalau perlu. Kalau kamu menunggu aplikasi menampilkan angka dulu, otakmu cenderung mencari alasan kenapa angka itu benar.

## Langkah yang bisa diulang

- **Satu aksi per langkah.** "Isi form lalu simpan lalu kembali" adalah tiga langkah.
- **Sebut elemen dengan nama yang ada di layar.** Tulis "ketuk tombol Pakai voucher", bukan "klik tombolnya".
- **Data ada di precondition atau data uji, bukan di kepala kamu.** Hindari "pakai voucher yang tadi".
- **Jangan bergantung pada test case lain** kecuali memang disengaja dan ditulis jelas di precondition.

## Prioritas: P1, P2, P3

Waktu testing hampir selalu kurang. Prioritas menentukan apa yang dijalankan lebih dulu:

| Prioritas | Isinya | Contoh |
|---|---|---|
| **P1** | Alur utama dan apa pun yang menyangkut uang | Potongan voucher, total bayar, pembayaran |
| **P2** | Validasi dan penanganan error | Voucher kedaluwarsa, kode tidak valid, koneksi putus |
| **P3** | Kosmetik dan hal minor | Perataan teks, warna badge, typo di halaman jarang dibuka |

Saat waktunya mepet, seluruh P1 harus selesai. P2 dijalankan sebanyak mungkin. P3 boleh ditunda dan dicatat sebagai risiko di laporan.

## Kesalahan yang sering terjadi

- **Test case terlalu besar.** Satu test case menguji lima hal. Kalau gagal, tidak jelas yang mana yang rusak. Pecah per perilaku.
- **Precondition kosong.** Test case berjalan di akun penulisnya, tapi gagal di akun orang lain karena datanya berbeda.
- **Menyalin AC ke expected result.** AC menjelaskan aturan, sedangkan expected result menjelaskan apa yang terlihat di layar untuk data tertentu.
- **Hanya alur bahagia.** Gunakan label tipe dari lesson sebelumnya untuk mengecek keseimbangannya.

## Checklist sebelum test case dianggap siap

- [ ] Judul menjelaskan apa yang diverifikasi.
- [ ] Ada prioritas dan requirement asalnya.
- [ ] Precondition menyebut data dan akun yang dibutuhkan.
- [ ] Setiap langkah berisi satu aksi.
- [ ] Expected result berupa angka, teks, atau kondisi yang bisa diamati.
- [ ] Angka expected untuk kalkulasi sudah dihitung manual.

## Ringkasan

- Test case yang baik bisa dijalankan orang lain tanpa bertanya.
- Expected result harus spesifik: angka, teks, atau kondisi yang terlihat di layar.
- Hitung expected kalkulasi sebelum eksekusi, bukan sesudahnya.
- Gunakan P1 untuk alur utama dan uang, P2 untuk validasi, P3 untuk kosmetik.
