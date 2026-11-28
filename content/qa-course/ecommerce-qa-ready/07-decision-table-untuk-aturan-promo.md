---
title: Decision Table untuk Aturan Promo
slug: decision-table-untuk-aturan-promo
excerpt: Aturan promo adalah kumpulan kondisi yang saling memengaruhi. Decision table mengubahnya jadi daftar kombinasi yang bisa dites satu per satu, tanpa ada yang terlewat.
seo_title: Decision Table untuk Menguji Aturan Promo
seo_description: Cara menyusun decision table untuk aturan promo, menggabungkannya dengan boundary value, dan memverifikasi rumus harga dengan menghitung expected sendiri.
category: QA Fundamentals
tags: decision table, test design, promo, boundary value, black box testing
visibility: library
course: E-commerce QA Ready · Modul 3 (Voucher Testing) · Lesson 1
---

Tester A memakai promo PAYDAY25 di booking 3 malam, totalnya terlihat benar, lalu menulis Pass. Tester B memakai promo yang sama di booking 1 malam, juga Pass. Keduanya tidak pernah mencoba booking 3 malam yang dikurangi jadi 1 malam setelah promo dipakai, atau kode promo yang diketik padahal belum memenuhi syarat.

Aturan promo bukan satu aturan. Ia adalah **kumpulan kondisi** yang saling memengaruhi, dan bug hampir selalu bersembunyi di kombinasi yang tidak dicoba siapa pun.

**Decision table** adalah cara menyusun kombinasi itu dengan sistematis. Kamu sudah mengenal equivalence partitioning dan boundary value di **Equivalence Partitioning dan Boundary Value Analysis** (Junior QA Ready). Decision table melengkapinya: EP dan BVA memilih nilai untuk satu kondisi, decision table memilih **kombinasi** antar kondisi.

## Aturan promo InapYuk setelah klarifikasi

Setelah gap di Modul 1 dijawab PM, aturan Promo Payday Sale InapYuk menjadi:

| Promo | Jenis | Syarat | Potongan |
|---|---|---|---|
| INAP2 | Nominal | Minimal 2 malam | Rp 75.000 |
| PAYDAY25 | Persen | Harga kamar minimal Rp 1.000.000 | 25%, maksimal Rp 200.000, dibulatkan ke bawah |

Aturan tambahan: satu promo per booking, syarat berlaku sama untuk promo dari daftar dan dari kode, kuota dicek ulang saat Pesan.

## Langkah 1: Daftar kondisi dan aksi

Kondisi adalah hal yang memengaruhi hasil. Aksi adalah hasil yang bisa diamati.

**Kondisi:**
- C1: Syarat promo terpenuhi?
- C2: Masih dalam masa berlaku?
- C3: Kuota masih ada?
- C4: Jalan masuk: daftar atau kode?

**Aksi:**
- A1: Promo bisa dipakai, potongan masuk ke total
- A2: Promo ditolak dengan alasan yang sesuai
- A3: Total tidak berubah

## Langkah 2: Susun kombinasi

Dengan 4 kondisi ya/tidak, ada 2⁴ = 16 kombinasi. Tulis semuanya dulu, lalu ringkas yang hasilnya sama.

| Rule | C1 Syarat | C2 Berlaku | C3 Kuota | C4 Jalan masuk | Aksi |
|---|---|---|---|---|---|
| R1 | Ya | Ya | Ya | Daftar | A1 |
| R2 | Ya | Ya | Ya | Kode | A1 |
| R3 | Tidak | Ya | Ya | Daftar | A2: alasan kekurangan syarat, A3 |
| R4 | Tidak | Ya | Ya | Kode | A2: alasan kekurangan syarat, A3 |
| R5 | Ya | Tidak | - | - | A2: alasan kedaluwarsa, A3 |
| R6 | Ya | Ya | Tidak | - | A2: alasan kuota habis, A3 |

Tanda "-" berarti nilai kondisi itu tidak mengubah hasil. Begitulah 16 kombinasi diringkas jadi 6 rule.

Perhatikan R3 dan R4. Hasilnya sama, tapi jalan masuknya berbeda. Jangan ringkas keduanya jadi satu test. Developer sering menulis pengecekan syarat di satu jalan masuk saja, dan decision table membuat kedua jalan terlihat.

## Langkah 3: Tambahkan boundary

Decision table menjawab "kombinasi apa". Boundary value menjawab "nilai berapa". Untuk setiap kondisi yang berupa angka, uji di sekitar batasnya:

| Kondisi | Di bawah | Tepat | Di atas |
|---|---|---|---|
| INAP2: jumlah malam | 1 malam | 2 malam | 3 malam |
| PAYDAY25: harga kamar | Rp 999.000 | Rp 1.000.000 | Rp 1.100.000 |
| PAYDAY25: batas potongan | 25% = Rp 175.000 | 25% = Rp 200.000 | 25% = Rp 300.000, dibatasi |

Baris terakhir sering terlewat. Diskon persen punya **dua** batas: batas syarat (minimal harga) dan batas potongan (maksimal Rp 200.000). Uji keduanya.

## Langkah 4: Hitung expected sendiri

Untuk setiap test, tulis expected **sebelum** melihat layar. Contoh R1 dengan PAYDAY25, kamar Rp 1.200.000 per malam, 1 malam, pajak dan biaya layanan 15% dari harga kamar:

| Baris | Hitungan | Expected |
|---|---|---|
| Harga kamar | 1.200.000 × 1 | Rp 1.200.000 |
| Pajak & biaya layanan | 15% × 1.200.000 | Rp 180.000 |
| Potongan PAYDAY25 | 25% × 1.200.000 = 300.000, dibatasi | −Rp 200.000 |
| **Total** | 1.200.000 + 180.000 − 200.000 | **Rp 1.180.000** |

Lalu bandingkan **setiap baris**, bukan hanya total. Dua bug bisa saling menutupi: potongan terlalu besar dan pajak terlalu besar bisa menghasilkan total yang kebetulan terlihat wajar.

Kenapa harus menghitung dulu? Karena tester yang melihat angka di layar lebih dulu cenderung mencari alasan kenapa angka itu benar.

## Dari decision table ke test case

Setiap rule menjadi minimal satu test case, dan setiap boundary menambah test case. Tulis dengan data uji yang lengkap:

| Area | Teknik | Data uji | Expected | Hasil |
|---|---|---|---|---|
| Diskon persen | Boundary | Kamar Rp 1.200.000 × 1 malam, PAYDAY25 dari daftar | Potongan Rp 200.000, total Rp 1.180.000 | |
| Minimal syarat | Boundary | Kamar Rp 1.000.000 × 1 malam, PAYDAY25 | Bisa dipakai (batas inklusif) | |
| Kode promo | Decision table R4 | Kamar Rp 800.000, ketik PAYDAY25 | Ditolak, alasan kekurangan Rp 200.000 | |
| Kuota | Decision table R6 | INAP2, kuota habis saat Pesan | Booking tidak dibuat, diminta pilih ulang | |

Kolom **Teknik** membantu reviewer melihat apakah cakupanmu seimbang, bukan hanya satu jenis test yang diulang.

## Latihan singkat

InapYuk menambah promo ketiga: **GRATISSARAPAN**, gratis sarapan untuk booking minimal 3 malam, tidak bisa dipakai di kamar tipe Standard. Tambahkan kondisi baru ke decision table, tulis rule-nya, lalu tentukan nilai boundary untuk jumlah malam.

## Ringkasan

- Aturan promo adalah kombinasi kondisi. Decision table membuat semua kombinasi terlihat, lalu meringkas yang hasilnya sama.
- Jangan ringkas jalan masuk yang berbeda (daftar dan kode) jadi satu test.
- Gabungkan dengan boundary value, termasuk batas potongan maksimal diskon persen.
- Hitung expected sendiri sebelum melihat layar, dan bandingkan setiap baris ringkasan.
- Decision table melihat satu momen. Padahal promo bisa berubah status setelah dipakai. Itu topik artikel berikutnya.
