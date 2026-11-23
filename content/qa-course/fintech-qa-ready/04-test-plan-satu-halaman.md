---
title: Test Plan Satu Halaman
slug: test-plan-satu-halaman
excerpt: Test plan bukan dokumen tebal yang tidak dibaca siapa pun. Pelajari cara menulis test plan ringkas yang menjawab apa yang dites, bagaimana, di mana, dengan data apa, dan kapan dianggap selesai.
seo_title: Test Plan Satu Halaman: Template dan Contoh
seo_description: Cara menulis test plan ringkas yang benar-benar dibaca tim: scope, pendekatan, environment, data uji, jadwal, dan kriteria selesai. Lengkap dengan contoh.
category: Test Planning
tags: test plan, test strategy, scope, test management
visibility: library
course: Fintech QA Ready · Modul 2 (Test Plan) · Lesson 1
---

Kata "test plan" sering membuat orang membayangkan dokumen 30 halaman dengan daftar isi, riwayat revisi, dan bab yang disalin dari template standar. Dokumen seperti itu biasanya dibuat sekali, disimpan di folder, lalu tidak pernah dibuka lagi.

Padahal tujuan test plan sederhana: **membuat tim sepakat soal apa yang akan dites, bagaimana caranya, dan kapan pengujian dianggap selesai.** Untuk satu fitur di satu sprint, semua itu muat dalam satu halaman.

Artikel ini membahas cara menulis test plan yang ringkas tapi benar-benar dipakai.

## Test plan, test strategy, test case: apa bedanya?

Tiga istilah ini sering tertukar.

| Dokumen | Cakupan | Pertanyaan yang dijawab | Umur |
|---|---|---|---|
| Test strategy | Seluruh produk atau tim | Bagaimana tim kita biasanya menguji? Tools, level uji, otomasi | Lama, jarang berubah |
| Test plan | Satu fitur atau satu rilis | Apa yang dites di rilis ini, bagaimana, kapan selesai | Satu sprint atau satu rilis |
| Test case | Satu skenario | Langkah apa, data apa, hasil apa yang diharapkan | Dipakai berulang |

Test plan ada di tengah. Ia mengambil pendekatan umum dari test strategy, lalu menerapkannya ke satu fitur dengan risiko dan batasan yang spesifik.

## Template satu halaman

Test plan yang baik cukup memuat delapan bagian berikut. Setiap bagian ditulis dalam beberapa baris saja.

1. **Tujuan.** Fitur apa yang diuji dan apa yang ingin dipastikan.
2. **Scope.** Apa yang dites (in scope) dan apa yang tidak (out of scope), dengan alasannya.
3. **Pendekatan.** Level pengujian dan teknik yang dipakai per area.
4. **Environment.** Di mana pengujian dilakukan: staging, versi build, perangkat, browser.
5. **Data uji.** Akun dan kondisi data yang dibutuhkan.
6. **Risiko.** Area paling berisiko dan prioritasnya. Dibahas detail di lesson berikutnya.
7. **Jadwal.** Kapan tiap aktivitas dilakukan, disesuaikan dengan sprint.
8. **Kriteria masuk dan keluar.** Kapan boleh mulai dan kapan selesai. Dibahas di lesson 3 modul ini.

## Menulis scope yang tegas

Scope adalah bagian yang paling sering kabur. "Menguji fitur pembayaran" bukan scope. Scope yang baik bisa dipakai untuk menjawab pertanyaan "Apakah ini harus dites?" dengan ya atau tidak.

| Kurang tegas | Tegas |
|---|---|
| Menguji pembayaran | Pembayaran kode bayar: pembuatan pesanan, penerbitan kode, konfirmasi bank, kedaluwarsa |
| Mobile dan web | Android 12 ke atas, iOS 16 ke atas, web Chrome dan Safari versi terbaru |
| Tidak termasuk fitur lain | Out of scope: kartu kredit (tidak berubah di rilis ini), refund (rilis berikutnya) |

Bagian **out of scope** sama pentingnya. Menuliskannya melindungi kamu dari pertanyaan "kenapa ini tidak dites?" setelah rilis, dan memaksa tim sadar bahwa ada area yang memang tidak disentuh.

Selalu tulis alasannya. "Refund tidak dites" terdengar seperti kelalaian. "Refund tidak dites karena tidak ada perubahan kode di modul refund pada rilis ini" terdengar seperti keputusan.

## Menyiapkan data uji untuk fitur uang

Di fitur uang, data uji sering jadi hambatan terbesar. Kamu butuh akun dengan kondisi yang sangat spesifik, dan menyiapkannya bisa makan waktu berjam-jam kalau tidak direncanakan.

Daftar kebutuhan data sejak awal:

- **Akun dengan peran berbeda.** Misalnya penumpang biasa, penumpang terverifikasi, dan admin operator bus.
- **Kondisi saldo atau kuota.** Jadwal dengan kursi penuh, jadwal dengan sisa satu kursi, promo yang kuotanya hampir habis.
- **Nilai di sekitar batas.** Akun yang transaksinya hari ini sudah mendekati batas harian.
- **Data pihak ketiga.** Nomor kartu uji atau kode bayar sandbox dari payment gateway.

Tulis juga **siapa yang menyiapkan** dan **kapan**. Kalau data harus dibuat oleh backend engineer lewat script, masukkan ke jadwal sejak awal sprint.

## Contoh test plan: pembayaran kode bayar TiketJalan

> **Tujuan**
> Memastikan penumpang bisa membayar tiket lewat kode bayar, kursi ditahan dan dilepas dengan benar, dan tidak ada tagihan ganda.
>
> **Scope**
> In: pembuatan pesanan, penerbitan kode bayar, penahanan kursi, konfirmasi bank, kedaluwarsa, riwayat pesanan.
> Out: kartu kredit (tidak berubah), refund (sprint berikutnya), laporan admin (tim lain).
>
> **Pendekatan**
> API testing untuk aturan bisnis dan validasi. UI testing untuk alur utama dan pesan error. Exploratory session 1 jam untuk aksi ganda dan koneksi buruk.
>
> **Environment**
> Staging, build 2.8.0-rc1. Android 13 (Pixel), iOS 17 (iPhone 12), Chrome desktop.
>
> **Data uji**
> 3 akun penumpang, 1 jadwal sisa 1 kursi, 1 jadwal penuh, kode bayar sandbox. Disiapkan backend engineer hari pertama sprint.
>
> **Risiko utama**
> Tagihan ganda, kursi dijual dua kali, konfirmasi bank terlambat. Detail di tabel risiko.
>
> **Jadwal**
> Hari 1 sampai 2: test design. Hari 3 sampai 5: API testing. Hari 6 sampai 7: UI dan exploratory. Hari 8: regression dan sign-off.
>
> **Kriteria masuk / keluar**
> Lihat bagian kriteria.

Panjangnya kurang dari satu halaman. Siapa pun di tim bisa membacanya dalam tiga menit dan tahu persis apa yang akan dilakukan QA.

## Kesalahan umum

- **Copy-paste template.** Bagian yang diisi "N/A" atau kalimat generik membuat pembaca berhenti membaca. Hapus bagian yang tidak relevan.
- **Scope kabur.** Kalau tidak bisa dipakai untuk menjawab ya atau tidak, tulis ulang.
- **Tanpa data uji.** Hari ketiga sprint, kamu baru sadar butuh jadwal bus yang kursinya penuh, dan tidak ada yang bisa membuatnya.
- **Tanpa kriteria selesai.** Pengujian berhenti karena waktu habis, bukan karena kualitas sudah cukup.
- **Tidak dibagikan.** Test plan yang tidak dibaca PM dan engineering lead tidak bisa menyamakan ekspektasi.

## Ringkasan

- Test plan menjawab apa yang dites, bagaimana, di mana, dengan data apa, dan kapan selesai. Untuk satu fitur, satu halaman cukup.
- Delapan bagian: tujuan, scope, pendekatan, environment, data uji, risiko, jadwal, kriteria masuk dan keluar.
- Scope yang tegas bisa menjawab "apakah ini dites?" dengan ya atau tidak. Out of scope selalu disertai alasan.
- Untuk fitur uang, rencanakan data uji sejak awal, termasuk siapa yang menyiapkannya.
- Lesson berikutnya membahas cara mengisi bagian risiko dengan likelihood × impact.
