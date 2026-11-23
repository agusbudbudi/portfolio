---
title: Severity vs Priority, dan Rekomendasi Go / No-Go
slug: severity-vs-priority
excerpt: Severity mengukur dampak, priority mengukur urgensi. Pelajari bedanya, cara menentukan keduanya dengan alasan yang jelas, dan cara menyusun test summary serta rekomendasi rilis berbasis risiko.
seo_title: Severity vs Priority dan Rekomendasi Go / No-Go
seo_description: Beda severity dan priority bug, cara menentukannya dengan alasan yang jelas, serta cara menyusun test summary dan rekomendasi rilis berbasis risiko.
category: Manual Testing (pilih di admin)
tags: severity, priority, bug report, test summary, release
visibility: library
course: Junior QA Ready · Modul 3 (Bug Hunting) · Lesson 3
---

Setiap bug report punya dua label yang sering dianggap sama: **severity** dan **priority**. Keduanya memang berhubungan, tapi menjawab pertanyaan yang berbeda. Memahami bedanya membantu tim memperbaiki bug yang tepat lebih dulu. Ujungnya, kamu juga bisa memberi rekomendasi rilis yang bisa dipertanggungjawabkan.

## Bedanya

| | Severity | Priority |
|---|---|---|
| Pertanyaan | Seberapa parah dampaknya? | Seberapa cepat harus diperbaiki? |
| Sudut pandang | Teknis dan dampak ke user | Bisnis dan jadwal |
| Biasanya ditentukan | QA | QA mengusulkan, PM memutuskan |
| Berubah? | Jarang, karena dampaknya tetap | Bisa berubah sesuai jadwal rilis dan kampanye |

## Level severity

| Severity | Artinya | Contoh di aplikasi pesan antar fiktif PesanAja |
|---|---|---|
| **Critical** | Kehilangan uang atau data, alur utama tidak bisa dipakai, masalah keamanan | Potongan voucher memotong harga makanan sehingga user membayar lebih sedikit dari seharusnya |
| **Major** | Fitur penting salah, tapi ada jalan lain | Voucher yang memenuhi syarat tampil nonaktif, user harus memasukkan kode manual |
| **Minor** | Fitur berjalan, tapi ada yang mengganggu | Teks sisa minimum belanja tidak diperbarui sampai halaman di-refresh |
| **Trivial** | Kosmetik, tidak memengaruhi fungsi | Ikon voucher sedikit tidak sejajar dengan teksnya |

Patokan sederhana: **kesalahan hitung uang hampir selalu Critical**, meskipun selisihnya kecil. Selisih Rp6.000 per transaksi bisa menjadi kerugian besar setelah ribuan transaksi, dan merusak kepercayaan user.

## Level priority

| Priority | Artinya |
|---|---|
| **P1** | Harus diperbaiki sebelum rilis |
| **P2** | Diperbaiki di sprint ini atau rilis berikutnya |
| **P3** | Masuk backlog, diperbaiki saat ada waktu |

## Kenapa keduanya bisa berbeda

Kebanyakan bug punya severity dan priority yang sejalan. Tapi ada pengecualian, dan di situlah kedua label ini benar-benar berguna:

- **Severity rendah, priority tinggi.** Typo di nama promo pada banner halaman utama saat kampanye besar. Dampak teknisnya Trivial, tapi dilihat jutaan orang dan bisa merusak citra brand. Priority P1.
- **Severity tinggi, priority lebih rendah.** Aplikasi crash saat membuka voucher di versi Android yang sudah tidak didukung dan dipakai 0,1% user. Severity Critical untuk user yang terkena, tapi tim bisa memutuskan P2 dengan workaround, sambil menampilkan pesan untuk update.

Saat memberi label, **tulis alasannya dalam satu kalimat.** Contoh: "Critical karena user membayar lebih sedikit dari seharusnya di setiap transaksi dengan voucher lebih besar dari ongkir." Alasan ini mempercepat diskusi triage.

## Dari daftar bug ke test summary

Di akhir siklus testing, PM dan engineering lead butuh satu hal dari QA: **apakah fitur ini siap dirilis?** Jawabannya disampaikan lewat test summary. Isinya ringkas dan berbasis data:

1. **Cakupan eksekusi:** berapa test case dijalankan, berapa pass, fail, dan blocked.
2. **Bug yang masih open, per severity.**
3. **Risiko:** area yang belum dites, atau bug yang belum diperbaiki beserta dampaknya.
4. **Rekomendasi:** Go atau No-Go, dengan alasan dan syaratnya.

Contoh:

> **Test summary: Voucher ongkir v1 (build 2.14.0)**
>
> - Eksekusi: 32 test case, 27 pass, 4 fail, 1 blocked (menunggu akun member Plus).
> - Bug open: 1 Critical, 2 Major, 3 Minor.
> - Risiko utama: potongan voucher bisa memotong harga makanan (Critical). Kombinasi member Plus dengan voucher belum dites.
>
> **Rekomendasi: No-Go.**
> Bug Critical menyebabkan selisih uang di setiap transaksi dengan voucher yang lebih besar dari ongkir.
> **Syarat Go:** bug Critical diperbaiki dan lolos retest, lalu 6 test case kombinasi member Plus dijalankan. Estimasi retest: setengah hari setelah fix masuk staging.

## Menulis rekomendasi yang tegas

- **Pilih satu: Go atau No-Go.** "Sepertinya cukup aman" bukan rekomendasi.
- **Dasarnya risiko, bukan jumlah bug.** Sepuluh bug Trivial bisa Go. Satu bug Critical di kalkulasi uang biasanya No-Go.
- **Sertakan syarat yang terukur.** Apa yang harus terjadi supaya No-Go berubah jadi Go.
- **Tulis untuk pembaca non-teknis.** PM perlu paham dampaknya ke user dan bisnis, bukan detail kode.
- **Keputusan akhir ada di tim.** Kalau tim memutuskan rilis dengan risiko yang kamu sebutkan, pastikan risiko itu tercatat. Itu tetap tugas yang dijalankan dengan baik.

## Ringkasan

- Severity mengukur dampak, priority mengukur urgensi.
- Kesalahan hitung uang hampir selalu Critical.
- Keduanya bisa berbeda. Tulis alasan dalam satu kalimat untuk setiap label.
- Test summary berisi cakupan eksekusi, bug per severity, risiko, dan rekomendasi.
- Rekomendasi Go atau No-Go harus tegas, berbasis risiko, dan punya syarat yang jelas.
