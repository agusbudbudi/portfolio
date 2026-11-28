---
title: "Design Review untuk QA: Sistematis dan Terukur"
slug: design-review-untuk-qa
excerpt: Membandingkan build dengan file desain bukan soal mata yang jeli. Urutan prioritas, checklist per frame, cara mengukur, dan cara menulis temuan yang langsung bisa di-fix.
seo_title: "Design Review untuk QA: Sistematis dan Terukur"
seo_description: Cara QA membandingkan build dengan file desain: urutan prioritas, checklist per frame, alat ukur, format temuan, severity, dan ringkasan untuk tim.
category: Design QA
tags: design review, design qa, ui testing, visual testing, figma
visibility: library
course: E-commerce QA Ready · Modul 2 (Design Review) · Lesson 1
---

"Sudah sesuai desain kok." Kalimat ini sering diucapkan dengan jujur. Developer membuka file desain, membangun halamannya, lalu membandingkan sekilas. Terlihat mirip, jadi dianggap sama.

Masalahnya, "mirip" menyembunyikan banyak hal: warna tombol yang sedikit lebih terang sampai gagal kontras, angka yang kehilangan satuan, state error yang tidak pernah dibuat, atau bar bawah yang ikut ter-scroll. Semua itu lolos karena tidak ada yang membandingkan dengan sistematis.

Banyak tim menjalankan **design review** sebelum regression: QA membandingkan build dengan file desain yang sudah berstatus *Ready for dev*. Artikel ini membahas cara melakukannya dengan terukur.

## Kenapa QA, bukan hanya desainer

Desainer tahu persis apa yang ia gambar. QA tahu cara **mencari perbedaan dengan sistematis** dan cara **menilai dampaknya ke user**. Kombinasi keduanya yang membuat design review efektif.

Selain itu, QA melihat hal yang tidak terlihat di file desain: alur, data ekstrem, dan perilaku saat state berubah.

## Urutan prioritas

Jangan mulai dari selisih piksel. Urutkan perhatianmu dari yang paling berdampak:

| Urutan | Apa yang dicek | Contoh di InapYuk |
|---|---|---|
| 1 | Informasi uang dan data | Harga per malam, total, potongan promo, jumlah malam |
| 2 | State dan perilaku | Disabled, error, sticky, truncation, loading |
| 3 | Aksesibilitas | Kontras teks, ukuran area sentuh, pesan error |
| 4 | Konsistensi visual | Spacing, ukuran font, radius, warna dekoratif |

Kalau waktumu hanya satu jam, satu jam itu harus habis di urutan 1 dan 2 dulu.

## Checklist per frame

Untuk setiap frame di file desain, periksa dari atas ke bawah dengan urutan yang sama setiap kali:

1. **Layout & spacing:** jarak antar section, padding, ukuran komponen
2. **Tipografi:** ukuran, weight, line height
3. **Warna:** fill, teks, dan border sesuai token
4. **Copy:** teks dan label sama persis, termasuk huruf besar kecil
5. **Konten:** harga coret, badge, satuan, ikon
6. **State:** default, selected, disabled, error
7. **Perilaku:** sticky, scroll, truncation, dan catatan desainer

Jangan lewatkan **catatan desainer** di samping frame. Perilaku yang ditulis di sana (misalnya "alamat panjang dipotong 2 baris") adalah bagian dari spec, sama wajibnya dengan gambar.

## Ukur, jangan menebak

Mata manusia buruk dalam membedakan 12px dan 16px, atau dua warna oranye yang mirip. Pakai alat:

- **Di file desain:** klik elemen untuk melihat spec (ukuran, warna hex, font). Pilih satu elemen lalu arahkan kursor ke elemen lain untuk melihat jaraknya.
- **Di build:** klik kanan elemen lalu **Inspect**, buka tab **Computed** untuk nilai sebenarnya (bukan nilai di CSS yang mungkin tertimpa).
- **Lebar layar:** pakai **Device toolbar** di DevTools dengan lebar yang sama dengan frame desain, misalnya 375px. Membandingkan frame 375px dengan browser 1440px hanya menghasilkan temuan palsu.

## Menulis temuan

Temuan design review yang baik bisa di-fix tanpa developer membuka file desain lagi. Kuncinya: **nilai di desain** dan **nilai di build**, spesifik.

| Kurang jelas | Jelas |
|---|---|
| Tombol Pesan agak beda | Tombol Pesan: desain tinggi 48, radius 12. Build tinggi 44, radius 8 |
| Warna harga salah | Harga promo: desain #B91C1C. Build #EF4444 |
| Teks kurang | Harga kamar: desain "Rp 850.000 / malam". Build "Rp 850.000" tanpa satuan |

Tambahkan **frame**, **elemen**, **kategori** (spacing, tipografi, warna, copy, konten, state, perilaku, aksesibilitas), dan **severity**.

## Severity berdasarkan dampak, bukan besar selisih

Selisih 20px di margin bisa tidak penting. Selisih satu kata bisa sangat penting. Contoh di InapYuk:

- **High:** harga tanpa satuan "/ malam" membuat tamu mengira itu total menginap. Informasinya menyesatkan.
- **High:** teks tombol utama gagal kontras 4.5:1. User dengan penglihatan rendah kesulitan membacanya.
- **Medium:** bar total tidak menempel di bawah layar, jadi tombol Pesan baru terlihat setelah scroll.
- **Low:** jarak antar kartu kamar 8px, di desain 12px.

Ingat konteks fitur. Kalau masalah utama rilis sebelumnya adalah "harga tidak jelas", setiap deviasi di informasi harga naik severity-nya.

## Ringkasan untuk tim

Setelah semua frame dicek, tulis ringkasan yang bisa dibaca desainer dan lead dalam satu menit:

> **Design review build v3.8.0-rc1 vs desain Booking v2:** 11 temuan (3 High, 3 Medium, 5 Low).
> **Wajib fix sebelum Payday:** satuan harga per malam dan potongan promo (berhubungan langsung dengan keluhan "harga tidak jelas"), serta kontras tombol Pesan.
> **Follow-up:** spacing dan ukuran font, tidak memblokir rilis.
> **Menunggu keputusan desain:** state saat kamar habis di tengah booking (belum ada di desain).

Pisahkan **blocker** dari **follow-up** dengan tegas. Ringkasan yang mendaftar semua temuan dengan bobot sama memaksa pembaca memilah sendiri.

## Checklist sebelum design review dianggap selesai

- [ ] Semua frame dicek, bukan hanya frame pertama
- [ ] Alur yang tidak terlihat di layar pertama ikut dicoba: bottom sheet, error, scroll
- [ ] Setiap temuan punya nilai desain vs build yang spesifik
- [ ] Severity mengikuti dampak ke user
- [ ] Ringkasan memisahkan blocker, follow-up, dan keputusan desain

## Ringkasan

- Design review membandingkan build dengan desain *Ready for dev* secara sistematis, bukan sekilas.
- Prioritaskan informasi uang dan data, lalu state, aksesibilitas, baru konsistensi visual.
- Ukur dengan inspect desain dan DevTools, di lebar layar yang sama dengan frame.
- Tulis temuan dengan nilai desain vs build, dan nilai severity dari dampaknya.
- Sebagian temuan ternyata bukan bug, tapi hal yang tidak pernah didesain. Artikel berikutnya membahas cara mengenalinya.
