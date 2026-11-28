---
title: Membaca PRD Promo dan Kampanye
slug: membaca-prd-promo-dan-kampanye
excerpt: Fitur promo terlihat sederhana di PRD, tapi penuh aturan yang belum diputuskan. Lima lensa untuk menemukan gap sebelum jadi bug saat kampanye.
seo_title: Membaca PRD Promo dan Kampanye sebagai QA
seo_description: Lima lensa membaca PRD promo dan voucher: basis perhitungan, kombinasi, batas dan pembulatan, waktu, serta kelayakan. Dengan contoh pertanyaan untuk PM.
category: QA Fundamentals
tags: prd review, promo, voucher, e-commerce, requirement analysis
visibility: library
course: E-commerce QA Ready · Modul 1 (Requirement) · Lesson 1
---

Kalimat "user bisa memakai kode promo" terdengar selesai. Developer membacanya, mengangguk, lalu mulai coding. Dua minggu kemudian, di malam kampanye, ternyata promo bisa digabung dengan promo lain, diskon persen tidak punya batas, dan user di Makassar tidak bisa memakai promo yang "mulai jam 00:00".

Tidak ada yang salah coding. Semua orang hanya mengisi bagian kosong di PRD dengan asumsinya masing-masing.

Di course ini kamu sudah paham dasar membaca PRD (kalau belum, baca dulu **Cara Membaca PRD sebagai QA** di Junior QA Ready). Artikel ini fokus ke satu jenis fitur yang paling rawan di e-commerce: **promo dan kampanye**.

## Kenapa fitur promo rawan

Fitur promo punya empat sifat yang jarang muncul bersamaan di fitur lain:

| Sifat | Akibatnya |
|---|---|
| Banyak aturan kecil | Minimal transaksi, batas diskon, masa berlaku, kuota, siapa yang boleh pakai |
| Menyentuh uang | Setiap salah hitung langsung jadi kerugian user atau perusahaan |
| Dipakai bersamaan oleh banyak orang | Kuota dan stok diperebutkan dalam hitungan detik |
| Punya tanggal mati | Rilis harus siap sebelum kampanye, tidak ada waktu untuk "fix minggu depan" |

Karena itu, review PRD promo tidak cukup dengan membaca alur utama. Kamu perlu lensa khusus.

## Contoh yang akan kita pakai sepanjang course

**InapYuk** adalah aplikasi booking hotel fiktif. Setiap tanggal 25, mereka mengadakan **Payday Sale**. Tim Booking sedang menyiapkan fitur **Promo Payday Sale v2**. Cuplikan PRD v1.0:

> **US-03 Pakai promo.** Sebagai tamu, saya ingin memakai promo agar harga menginap lebih murah.
> - AC1: Jenis promo: potongan nominal dan diskon persen.
> - AC2: Setiap promo punya minimal transaksi dan masa berlaku.
> - AC3: Promo yang tidak bisa dipakai harus jelas alasannya.
>
> **US-04 Kode promo.** Tamu bisa memasukkan kode promo dari media sosial.
>
> **Harga.** Total = harga kamar × jumlah malam + pajak dan biaya layanan − promo.

Kita akan memakai InapYuk dari modul requirement sampai keputusan rilis di modul terakhir.

## Lensa 1: Basis perhitungan

Setiap angka di PRD dihitung **dari apa**? Ini pertanyaan pertama untuk setiap aturan promo.

Di contoh InapYuk:

- "Minimal transaksi" dihitung dari harga kamar saja, atau sudah termasuk pajak?
- Diskon persen dihitung dari harga kamar, atau dari total setelah pajak?
- Kalau ada harga coret (harga kamar sudah didiskon hotel), minimal transaksi memakai harga normal atau harga setelah diskon?

Dua developer bisa menjawab berbeda, dan keduanya masuk akal. Itulah tanda gap.

## Lensa 2: Kombinasi

PRD promo hampir selalu menjelaskan satu promo. Jarang yang menjelaskan **apa yang terjadi kalau ada dua**.

- Boleh memakai lebih dari satu promo dalam satu booking?
- Kalau tidak boleh, promo mana yang menang ketika user memasukkan kode baru padahal sudah memilih promo dari daftar?
- Apakah promo Payday bisa digabung dengan harga khusus member?

Buat tabel kecil kombinasi di catatanmu. Setiap sel yang tidak bisa kamu isi dari PRD adalah pertanyaan untuk PM.

## Lensa 3: Batas dan pembulatan

Setiap angka punya batas, dan setiap batas punya dua pertanyaan: **inklusif atau eksklusif**, dan **apa yang terjadi di luar batas**.

- "Minimal transaksi Rp 1.000.000": apakah tepat Rp 1.000.000 sudah boleh?
- Diskon persen punya batas maksimal? Kalau PRD tidak menyebutnya, booking suite presidensial bisa mendapat diskon jutaan rupiah.
- Diskon 25% dari Rp 1.234.567 menghasilkan pecahan. Dibulatkan ke atas, ke bawah, atau ke terdekat?
- Bisakah diskon membuat total menjadi nol atau negatif?

Pertanyaan pembulatan terlihat sepele. Tapi dikali ribuan transaksi, selisih satu rupiah per booking jadi angka yang ditanyakan tim finance.

## Lensa 4: Waktu

Promo kampanye selalu terikat waktu, dan waktu penuh jebakan:

- "Berlaku 25 Juni" itu menurut zona waktu apa? User di Jayapura sudah tanggal 25 dua jam lebih awal dari user di Jakarta.
- Kalau user memilih promo jam 23:59 lalu membayar jam 00:01, promonya masih berlaku?
- Masa berlaku dicek saat promo dipilih, saat booking dibuat, atau saat pembayaran?

Lensa waktu sering membuka pertanyaan berikutnya: apa yang terjadi kalau kondisi berubah di tengah jalan. Ini kita bahas lebih dalam di artikel berikutnya.

## Lensa 5: Kelayakan dan alasan

AC3 berbunyi "harus jelas alasannya". Kalimat ini belum bisa dites, karena "jelas" tidak punya ukuran. Ubah menjadi pertanyaan yang memaksa keputusan:

- Promo yang belum memenuhi syarat ditampilkan atau disembunyikan?
- Kalau ditampilkan, bisa dipilih atau tidak? Apa teks alasannya untuk setiap jenis syarat?
- Kode yang salah ketik, kode kedaluwarsa, dan kode yang kuotanya habis, apakah pesannya berbeda?

Kamu sudah belajar mengubah kalimat kabur menjadi AC yang bisa dites di **Acceptance Criteria yang Bisa Dites**. Di fitur promo, latihan itu hampir selalu dibutuhkan.

## Dari temuan ke pertanyaan untuk PM

Temuan yang baik ditulis dengan lokasi, jenis, pertanyaan, dan risikonya:

| Lokasi | Jenis | Pertanyaan untuk PM | Risiko jika tidak dijawab |
|---|---|---|---|
| US-03 AC1 | Missing requirement | Diskon persen punya batas maksimal? Berapa? | Diskon tidak terbatas di kamar mahal, biaya promo bocor |
| US-03 AC2 | Ambiguitas | Minimal transaksi dihitung sebelum atau sesudah pajak? | Developer dan QA memakai rumus berbeda, bug "tidak bisa pakai promo" |
| US-03 | Edge case | Tepat di minimal transaksi, promo boleh dipakai? | User yang pas di batas ditolak dan komplain |
| US-04 | Ambiguitas | Promo dari kode dan dari daftar boleh digabung? | Dua diskon terpakai sekaligus |
| Harga | Edge case | Diskon persen dibulatkan ke mana? | Selisih rupiah, rekonsiliasi finance gagal |

Perhatikan kolom risiko. PM lebih cepat menjawab pertanyaan yang jelas dampaknya.

## Checklist review PRD promo

- [ ] Setiap angka sudah jelas dihitung dari apa
- [ ] Aturan kombinasi promo sudah tertulis
- [ ] Setiap batas sudah jelas inklusif atau eksklusif, dan ada batas atas untuk diskon persen
- [ ] Aturan pembulatan dan total minimum sudah tertulis
- [ ] Zona waktu dan titik pengecekan masa berlaku sudah jelas
- [ ] Setiap jenis "tidak bisa dipakai" punya perilaku dan teks alasan

## Ringkasan

- Fitur promo rawan karena banyak aturan kecil, menyentuh uang, diperebutkan, dan punya tanggal mati.
- Baca PRD promo dengan lima lensa: basis perhitungan, kombinasi, batas dan pembulatan, waktu, serta kelayakan.
- Setiap sel kosong di tabel kombinasi dan setiap batas yang tidak jelas adalah pertanyaan untuk PM.
- Tulis temuan lengkap dengan lokasi, jenis, pertanyaan, dan risiko.
- Lensa waktu membuka satu kelompok masalah lagi: apa yang terjadi saat banyak orang memakai promo yang sama. Itu topik artikel berikutnya.
