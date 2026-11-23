---
title: Test Scenario vs Test Case
slug: test-scenario-vs-test-case
excerpt: Test scenario menjawab "apa yang diuji", test case menjawab "bagaimana mengujinya". Pelajari bedanya, kapan memakai masing-masing, dan cara menyusun daftar scenario yang seimbang antara positive dan negative.
seo_title: Test Scenario vs Test Case: Beda dan Contohnya
seo_description: Beda test scenario dan test case, kapan memakai masing-masing, dan cara menyusun daftar scenario yang seimbang antara positive dan negative test.
category: Manual Testing (pilih di admin)
tags: test scenario, test case, test design, manual testing
visibility: library
course: Junior QA Ready · Modul 2 (Test Design) · Lesson 1
---

Setelah requirement diklarifikasi, pekerjaan QA berikutnya adalah merancang pengujian. Di tahap ini dua istilah sering tertukar: **test scenario** dan **test case**. Keduanya saling terkait, tapi fungsinya berbeda. Memahami bedanya membuat kamu bisa merancang pengujian yang lengkap tanpa tenggelam dalam detail terlalu cepat.

## Definisi singkat

| | Test scenario | Test case |
|---|---|---|
| Menjawab | **Apa** yang diuji | **Bagaimana** mengujinya |
| Tingkat detail | Satu kalimat | Precondition, langkah, data, expected result |
| Jumlah | Puluhan per fitur | Satu scenario bisa punya beberapa test case |
| Dibaca oleh | PM, developer, QA lain | Orang yang mengeksekusi tes |
| Dibuat saat | Awal test design, untuk melihat cakupan | Setelah scenario disepakati |

Contoh dari fitur voucher ongkir di aplikasi pesan antar fiktif PesanAja:

- **Scenario:** "Verifikasi voucher ongkir tidak bisa dipakai jika subtotal di bawah minimum belanja."
- **Test case:** "Given subtotal Rp49.999 dan voucher GRATISONGKIR dengan minimum Rp50.000, when user membuka daftar voucher, then voucher tampil nonaktif dengan teks 'Tambah Rp1 lagi untuk pakai voucher ini'."

Scenario cukup untuk berdiskusi soal cakupan. Test case diperlukan untuk benar-benar menjalankan tes dan menilai hasilnya.

## Kenapa mulai dari scenario?

Kalau kamu langsung menulis test case detail, dua hal buruk biasanya terjadi:

1. **Cakupan tidak seimbang.** Kamu menghabiskan waktu menulis 15 test case untuk alur bahagia, lalu kehabisan waktu untuk alur gagal.
2. **Sulit direview.** PM tidak akan membaca 40 test case detail. Tapi PM mau membaca 20 baris scenario dan bilang "yang ini belum ada".

Daftar scenario adalah peta. Test case adalah petunjuk jalannya. Buat petanya dulu.

## Cara menyusun daftar scenario

### 1. Satu user story, beberapa scenario

Ambil setiap user story dan acceptance criteria yang sudah diklarifikasi. Untuk setiap AC, tulis minimal satu scenario positif dan pikirkan versi negatifnya.

### 2. Beri label tipe

Tandai setiap scenario dengan tipenya. Ini membuat keseimbangan cakupan langsung terlihat:

| Tipe | Artinya | Contoh scenario voucher ongkir |
|---|---|---|
| **Positive** | Input valid, alur normal | Voucher berhasil dipakai saat subtotal memenuhi minimum |
| **Negative** | Input tidak valid atau aksi yang harus ditolak | Voucher yang sudah kedaluwarsa tidak bisa dipilih |
| **Boundary** | Nilai di tepi batas | Subtotal tepat sama dengan minimum belanja |
| **Edge case** | Kondisi tidak biasa tapi mungkin terjadi | Pesanan dibatalkan merchant setelah voucher dipakai |

Aturan praktisnya: **minimal sepertiga scenario sebaiknya bukan positive.** Bug paling mahal jarang ada di alur bahagia, karena alur itu sudah dicoba developer sendiri.

### 3. Tulis kalimat yang bisa diverifikasi

Scenario yang baik dimulai dengan kata kerja dan menyebut kondisi pentingnya:

> ❌ "Voucher ongkir."
> ❌ "Cek voucher berfungsi dengan baik."
> ✅ "Verifikasi potongan ongkir tidak melebihi nilai ongkir saat nilai voucher lebih besar dari ongkir."

Kalimat terakhir langsung memberi tahu pembaca apa yang dianggap benar.

### 4. Jangan lupa yang bukan fungsional

Tambahkan scenario untuk hal-hal di luar logika utama, terutama jika disebut di PRD:

- Tampilan di layar kecil dan layar desktop.
- Perilaku saat koneksi putus di tengah proses.
- Event analytics yang harus terkirim.
- Teks dan pesan error yang sudah disepakati.

## Dari scenario ke test case

Tidak semua scenario perlu ditulis sebagai test case detail. Pilih berdasarkan risiko:

- **Wajib detail:** kalkulasi uang, perubahan status, dan aturan dengan banyak kondisi. Di sini expected result harus berupa angka atau teks yang pasti.
- **Cukup ringkas:** pengecekan tampilan sederhana, atau alur yang sudah tercakup scenario lain.

Satu scenario bisa melahirkan beberapa test case. Scenario "potongan ongkir tidak melebihi nilai ongkir" misalnya, minimal punya tiga test case: voucher lebih kecil dari ongkir, sama dengan ongkir, dan lebih besar dari ongkir. Cara memilih nilai-nilai tersebut secara sistematis dibahas di lesson berikutnya.

## Jaga traceability

Setiap scenario dan test case sebaiknya menyebut asal requirement-nya, misalnya "US-02 AC3". Manfaatnya:

- Saat PM mengubah AC3, kamu langsung tahu test case mana yang perlu diperbarui.
- Saat ada pertanyaan "fitur ini sudah dites?", kamu bisa menunjukkan buktinya per AC.
- AC yang tidak punya satu pun scenario langsung kelihatan sebagai lubang.

Cara paling sederhana adalah kolom "User story" di tabel scenario. Tidak perlu alat khusus.

## Contoh daftar scenario

| User story | Tipe | Scenario |
|---|---|---|
| US-02 | Positive | Verifikasi voucher ongkir berhasil dipakai saat subtotal di atas minimum |
| US-02 | Boundary | Verifikasi voucher bisa dipakai saat subtotal tepat sama dengan minimum |
| US-02 | Boundary | Verifikasi voucher tidak bisa dipakai saat subtotal Rp1 di bawah minimum |
| US-02 | Positive | Verifikasi ongkir jadi Rp0 saat nilai voucher lebih besar dari ongkir |
| US-02 | Negative | Verifikasi voucher yang sudah dipakai tidak muncul sebagai pilihan aktif |
| US-02 | Edge case | Verifikasi status voucher setelah pesanan dibatalkan merchant |
| Non-functional | Positive | Verifikasi daftar voucher terbaca di layar lebar 360px |

Tujuh baris ini sudah cukup untuk diskusi 10 menit dengan PM sebelum kamu menulis test case detailnya.

## Ringkasan

- Scenario menjawab "apa", test case menjawab "bagaimana".
- Mulai dari daftar scenario supaya cakupan terlihat dan mudah direview.
- Beri label tipe, dan usahakan minimal sepertiga scenario bukan positive.
- Tulis test case detail untuk area berisiko tinggi, terutama kalkulasi uang.
- Hubungkan setiap scenario ke user story atau AC asalnya.
