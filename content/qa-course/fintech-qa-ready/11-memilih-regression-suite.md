---
title: Memilih Regression Suite Berdasarkan Perubahan dan Risiko
slug: memilih-regression-suite
excerpt: Menjalankan semua test case di setiap rilis tidak realistis. Pelajari cara memilih regression suite yang cukup, dari smoke test sampai area tersentuh dan area berisiko tinggi.
seo_title: Cara Memilih Regression Suite Berbasis Risiko
seo_description: Cara memilih regression suite yang cukup: smoke test, impact analysis, prioritas berbasis risiko, dan cara melaporkan hasil regression per area.
category: QA Fundamentals
tags: regression testing, test suite, risk based testing, test management
visibility: library
course: Fintech QA Ready · Modul 4 (Regression) · Lesson 2
---

Setelah beberapa sprint, jumlah test case di tim bisa mencapai ratusan. Menjalankan semuanya di setiap build kandidat rilis butuh berhari-hari, sementara waktu yang tersedia sering hanya sehari. Di sisi lain, tidak menjalankan regression sama sekali adalah resep untuk bug regresi di production.

Jalan tengahnya adalah **memilih**: menentukan test case mana yang dijalankan untuk build ini, dengan alasan yang jelas. Artikel ini membahas cara memilihnya.

## Tiga lapisan regression suite

Bayangkan regression suite sebagai tiga lapisan, dari yang paling sempit ke paling luas.

| Lapisan | Isi | Kapan dijalankan | Durasi |
|---|---|---|---|
| Smoke | Alur paling kritis: login, cari jadwal, pesan, bayar, lihat tiket | Setiap build baru, sebelum pengujian lain | Menit |
| Regression terarah | Test case di area yang tersentuh perubahan dan area berisiko tinggi | Setiap build kandidat rilis | Jam |
| Full regression | Semua test case regression | Rilis besar, perubahan arsitektur, atau berkala | Hari |

Untuk sebagian besar rilis sprint, yang dibutuhkan adalah **smoke + regression terarah**. Full regression disimpan untuk saat perubahannya memang luas.

## Smoke test: gerbang pertama

Smoke test menjawab satu pertanyaan: **apakah build ini layak diuji lebih lanjut?** Kalau login gagal atau halaman pembayaran tidak bisa dibuka, tidak ada gunanya menjalankan seratus test case lain.

Ciri smoke test yang baik:

- Sedikit, biasanya 5 sampai 15 test case.
- Mencakup alur yang paling sering dipakai dan paling berdampak.
- Hanya alur positif. Kasus negatif masuk lapisan berikutnya.
- Kalau ada satu yang gagal, build dikembalikan ke developer.

## Impact analysis: dari perubahan ke daftar test

Regression terarah dibangun dari **impact analysis**: memetakan setiap perubahan ke area yang mungkin terdampak, lalu ke test case yang menguji area tersebut.

Langkahnya:

1. **Daftar perubahan.** Ambil dari release notes, ditambah konfirmasi ke developer. Hasil pembacaan di lesson sebelumnya adalah bahan utamanya.
2. **Petakan ke area.** Untuk setiap perubahan, tanya: halaman, endpoint, atau perhitungan apa yang memakai kode ini?
3. **Pilih test case.** Ambil test case yang menguji area tersebut dari kumpulan yang sudah ada. Kalau belum ada, tulis yang baru.
4. **Tambahkan area berisiko tinggi.** Ambil dari tabel risiko di Modul 2. Area seperti perhitungan total dan pembayaran tetap masuk walaupun tidak disentuh, karena impact-nya terlalu besar untuk dilewatkan.

## Memakai skor risiko untuk prioritas

Daftar hasil impact analysis bisa saja masih terlalu panjang. Urutkan dengan skor risiko:

- **Tersentuh perubahan + risiko tinggi:** wajib, jalankan paling awal.
- **Tersentuh perubahan + risiko rendah:** jalankan alur utamanya.
- **Tidak tersentuh + risiko tinggi:** jalankan versi singkat (alur utama dan satu dua kasus negatif penting).
- **Tidak tersentuh + risiko rendah:** lewati di build ini, catat di laporan bahwa area ini tidak diuji.

Kalau waktu habis, yang tertinggal adalah bagian paling bawah daftar, dan kamu bisa menjelaskan kenapa.

## Merawat regression suite

Regression suite bukan daftar yang dibuat sekali lalu dipakai selamanya.

- **Tambahkan test untuk setiap bug penting yang di-fix.** Bug yang pernah muncul punya peluang muncul lagi. Satu test case untuk mencegahnya sangat murah.
- **Hapus atau gabungkan test yang tidak lagi relevan.** Fitur yang sudah dihapus tidak perlu diuji.
- **Tandai kandidat otomasi.** Test yang dijalankan di setiap build, stabil, dan langkahnya jelas adalah kandidat terbaik untuk diotomasi. Smoke test dan test API biasanya yang pertama.

## Melaporkan hasil regression

Hasil regression dilaporkan per area, bukan hanya daftar panjang pass dan fail.

| Area | Dijalankan | Pass | Fail | Blocked | Catatan |
|---|---|---|---|---|---|
| Smoke | 8 | 8 | 0 | 0 | |
| Cari jadwal (pemilih tanggal baru) | 6 | 5 | 1 | 0 | Regresi: tanggal hari ini tidak bisa dipilih (BK-24) |
| Isi data penumpang | 5 | 5 | 0 | 0 | |
| Pembayaran | 7 | 6 | 0 | 1 | Callback bank staging sedang gangguan |
| Riwayat pesanan | 4 | 4 | 0 | 0 | |
| Ubah jadwal | 0 | | | | Tidak diuji: tidak tersentuh, risiko rendah |

Status **blocked** berarti test tidak bisa dijalankan karena hambatan di luar fitur, misalnya environment bermasalah. Bedakan dengan fail, dan selalu tulis penyebabnya. Baris terakhir juga penting: area yang sengaja tidak diuji tetap ditulis supaya tidak ada yang mengira sudah dicek.

## Contoh: regression suite TiketJalan rc2

Dari release notes rc2 di lesson sebelumnya:

| Perubahan | Area terdampak | Risiko | Masuk suite |
|---|---|---|---|
| Pemilih tanggal baru | Cari jadwal, filter riwayat, ubah jadwal | Sedang | Ya, semua halaman pemakai |
| Penumpang favorit | Isi data penumpang, lanjut ke pembayaran | Sedang | Ya, alur isi data sampai bayar |
| Fix biaya layanan (BK-17) | Perhitungan total, struk, riwayat | Tinggi | Ya, semua jumlah tiket |
| Fix pesanan kedaluwarsa (BK-15) | Pembayaran, status pesanan | Tinggi | Ya |
| Tidak tersentuh | Refund, profil | Rendah | Smoke saja |

## Ringkasan

- Regression suite punya tiga lapisan: smoke, regression terarah, dan full regression. Untuk rilis sprint, biasanya cukup dua yang pertama.
- Smoke test adalah gerbang: kalau gagal, build dikembalikan.
- Impact analysis memetakan perubahan ke area, lalu ke test case. Area berisiko tinggi tetap masuk walau tidak tersentuh.
- Urutkan dengan skor risiko supaya yang tertinggal saat waktu habis adalah yang paling aman ditinggalkan.
- Laporkan hasil per area, bedakan fail dan blocked, dan tulis area yang sengaja tidak diuji.
