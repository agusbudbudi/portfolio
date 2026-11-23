---
title: Exploratory Testing dengan Charter
slug: exploratory-testing-dengan-charter
excerpt: Test case menemukan bug yang sudah kamu bayangkan. Exploratory testing menemukan yang belum. Pelajari cara melakukannya secara terarah dengan charter, timebox, dan heuristik yang terbukti efektif.
seo_title: Exploratory Testing dengan Charter dan Timebox
seo_description: Cara melakukan exploratory testing yang terarah memakai charter, timebox, dan heuristik, untuk menemukan bug yang tidak terpikir di test case.
category: Manual Testing (pilih di admin)
tags: exploratory testing, bug hunting, heuristik, manual testing
visibility: library
course: Junior QA Ready · Modul 3 (Bug Hunting) · Lesson 1
---

Test case yang kamu tulis di modul sebelumnya hanya bisa menemukan bug yang sudah kamu bayangkan. Padahal banyak bug muncul dari kombinasi aksi yang tidak terpikirkan saat menulis test case: kembali ke langkah sebelumnya, menghapus data di tengah alur, atau menekan tombol dua kali dengan cepat.

**Exploratory testing** adalah cara menemukan bug jenis ini. Kamu belajar tentang aplikasi, merancang tes, dan menjalankannya pada saat yang sama. Bukan klik acak tanpa tujuan. Exploratory testing yang baik itu terarah, dibatasi waktu, dan dicatat.

## Scripted vs exploratory

| | Scripted (test case) | Exploratory |
|---|---|---|
| Dirancang | Sebelum eksekusi | Sambil eksekusi |
| Kekuatan | Konsisten, bisa diulang, bukti cakupan requirement | Menemukan bug tak terduga, cepat beradaptasi |
| Kelemahan | Hanya menemukan yang sudah dibayangkan | Sulit diulang kalau tidak dicatat |
| Cocok untuk | Alur utama, kalkulasi, regression | Area baru, area berisiko, setelah test case selesai |

Keduanya saling melengkapi. Urutan yang umum dipakai: jalankan test case P1 dulu, lalu luangkan waktu untuk eksplorasi.

## Charter: eksplorasi dengan tujuan

Charter adalah misi singkat untuk satu sesi eksplorasi. Format yang populer:

> **Jelajahi** [area] **dengan** [alat, data, atau teknik] **untuk menemukan** [jenis masalah].

Contoh untuk fitur voucher ongkir di aplikasi pesan antar fiktif PesanAja:

- Jelajahi **pemilihan voucher di checkout** dengan **mengganti alamat dan isi keranjang setelah voucher dipilih** untuk menemukan **potongan yang tidak ikut diperbarui**.
- Jelajahi **riwayat voucher** dengan **membatalkan pesanan di berbagai tahap** untuk menemukan **voucher yang hilang atau bisa dipakai dua kali**.
- Jelajahi **ringkasan pembayaran** dengan **nilai ekstrem** untuk menemukan **angka minus, pembulatan aneh, atau tampilan yang rusak**.

Charter membuat sesi tetap fokus. Kalau di tengah jalan kamu menemukan area lain yang menarik, catat sebagai charter baru. Jangan langsung pindah.

## Timebox dan catatan sesi

- **Timebox:** 30 sampai 60 menit per charter. Cukup untuk masuk dalam, tidak terlalu lama sampai kehilangan fokus.
- **Catatan sesi:** tulis apa yang kamu coba, apa yang kamu lihat, dan pertanyaan yang muncul. Satu baris per aksi sudah cukup.
- **Rekam bukti:** screen recording atau screenshot saat menemukan perilaku aneh. Bug yang muncul sekali dan tidak terekam sering tidak bisa direproduksi.

Di akhir sesi, kamu punya tiga hasil: bug yang ditemukan, pertanyaan untuk PM, dan ide charter berikutnya.

## Heuristik: cara "nakal" yang terarah

Heuristik adalah pola pikir yang sering menemukan bug. Gunakan sebagai daftar ide saat kamu buntu:

| Heuristik | Yang kamu coba | Contoh di voucher ongkir |
|---|---|---|
| **Kembali dan ubah** | Balik ke langkah sebelumnya, ubah data, maju lagi | Pilih voucher, kembali ke keranjang, hapus menu sampai subtotal di bawah minimum, lalu buka checkout lagi |
| **Hapus di tengah** | Hapus sesuatu yang sedang dipakai | Hapus alamat yang sedang dipilih di checkout |
| **Lakukan dua kali** | Tombol ditekan cepat dua kali, dua tab terbuka | Ketuk "Bayar" dua kali, atau pakai voucher yang sama di dua perangkat |
| **Nilai ekstrem** | 0, sangat besar, sangat panjang, desimal | Keranjang Rp9.999.999, nama alamat 200 karakter |
| **Gangguan** | Koneksi putus, aplikasi ditutup, sesi habis | Matikan internet tepat setelah memilih voucher |
| **Urutan berbeda** | Lakukan langkah dalam urutan yang tidak biasa | Pilih voucher dulu sebelum memilih alamat |
| **Bandingkan** | Bandingkan dua layar yang seharusnya konsisten | Total di ringkasan vs total di halaman pembayaran vs di riwayat pesanan |

Heuristik terakhir, **bandingkan**, sering sangat efektif untuk fitur yang melibatkan uang. Angka yang sama ditampilkan di beberapa tempat, dan sering dihitung oleh kode yang berbeda.

## Fokuskan pada area berisiko

Waktu eksplorasi terbatas, jadi arahkan ke area dengan peluang bug terbesar:

- **Kalkulasi uang:** urutan potongan, pembulatan, sisa pembagian.
- **Perubahan state:** data yang diubah setelah keputusan dibuat.
- **Aturan baru:** bagian PRD yang baru saja diubah setelah klarifikasi. Developer sering hanya memperbarui sebagian.
- **Integrasi:** titik di mana dua fitur bertemu, misalnya voucher dan metode pembayaran.

Gap log dari modul Requirement adalah sumber ide yang bagus. Setiap pertanyaan yang kamu ajukan ke PM menandai area yang tadinya ambigu, dan area ambigu adalah tempat favorit bug.

## Setelah menemukan bug

Begitu menemukan perilaku aneh:

1. **Ulangi sekali lagi** untuk memastikan bisa direproduksi.
2. **Cari langkah terpendek** yang tetap memunculkan bug.
3. **Rekam buktinya.**
4. **Cek PRD:** apakah ini benar-benar melanggar requirement, atau requirement-nya yang belum mengatur?

Setelah itu baru tulis bug report. Cara menulisnya dibahas di lesson berikutnya.

## Ringkasan

- Exploratory testing menemukan bug yang tidak terbayangkan saat menulis test case.
- Gunakan charter: jelajahi area apa, dengan cara apa, untuk menemukan masalah apa.
- Batasi waktu 30 sampai 60 menit per sesi, catat aksi dan rekam bukti.
- Pakai heuristik: kembali dan ubah, hapus di tengah, lakukan dua kali, nilai ekstrem, gangguan, urutan berbeda, dan bandingkan.
- Fokuskan eksplorasi ke kalkulasi, perubahan state, dan aturan yang baru diubah.
