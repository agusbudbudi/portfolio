---
title: Anatomi Bug Report yang Baik
slug: anatomi-bug-report-yang-baik
excerpt: Bug yang tidak bisa direproduksi tidak akan diperbaiki. Pelajari bagian-bagian bug report yang baik, cara menulis judul dan langkah reproduksi, serta bukti apa yang perlu dilampirkan.
category: Manual Testing (pilih di admin)
tags: bug report, bug hunting, jira, manual testing
visibility: library
course: Junior QA Ready · Modul 3 (Bug Hunting) · Lesson 2
---

Menemukan bug baru setengah pekerjaan. Setengahnya lagi adalah memastikan bug itu diperbaiki, dan itu sangat bergantung pada kualitas laporanmu. Developer yang menerima laporan kabur akan bertanya balik, menunda, atau menutupnya dengan status "cannot reproduce".

Ukuran bug report yang baik: **developer bisa mereproduksi bug-nya tanpa bertanya apa pun ke kamu.**

## Bagian-bagian bug report

| Bagian | Fungsi |
|---|---|
| **Judul** | Membuat orang paham masalahnya dari daftar tiket, tanpa membuka detail |
| **Severity dan priority** | Seberapa parah dampaknya dan seberapa cepat harus diperbaiki |
| **Environment** | Di mana bug terjadi: build, perangkat, browser, akun |
| **Precondition** | Kondisi data sebelum langkah pertama |
| **Langkah reproduksi** | Aksi bernomor yang memunculkan bug |
| **Expected result** | Seharusnya terjadi apa, dengan rujukan ke requirement |
| **Actual result** | Yang benar-benar terjadi |
| **Evidence** | Screenshot, rekaman layar, log |

Severity dan priority dibahas tersendiri di lesson berikutnya. Artikel ini fokus ke bagian lainnya.

## Judul: area, masalah, kondisi

Judul yang baik menjawab tiga hal: **di mana**, **apa yang salah**, dan **dalam kondisi apa**. Format yang sering dipakai:

> **[Area] Apa yang salah saat/jika kondisi**

| ❌ Kurang baik | ✅ Baik |
|---|---|
| Voucher error | [Checkout] Potongan voucher ongkir melebihi ongkir saat nilai voucher lebih besar |
| Bug di total | [Ringkasan] Total bayar tidak diperbarui setelah alamat diganti |
| Tidak bisa bayar | [Pembayaran] Tombol Bayar tidak merespons setelah koneksi putus lalu tersambung lagi |

Hindari kata seperti "error", "bug", "tidak berfungsi", atau "aneh" tanpa penjelasan. Kata-kata itu tidak memberi informasi apa pun.

## Langkah reproduksi

Aturannya sama dengan langkah di test case:

- **Bernomor**, satu aksi per langkah.
- **Mulai dari kondisi yang jelas.** Halaman mana, akun apa, data apa.
- **Pakai data uji yang konkret.** "Tambahkan menu senilai Rp60.000", bukan "tambahkan beberapa menu".
- **Langkah terpendek** yang tetap memunculkan bug. Kalau bug muncul tanpa langkah 2 dan 3, hapus langkah itu.

Contoh dari aplikasi pesan antar fiktif PesanAja:

> **Precondition:** login sebagai akun uji `qa.voucher01`, voucher GRATISONGKIR (potongan ongkir Rp15.000) tersedia, alamat "Kantor" dengan ongkir Rp9.000.
>
> 1. Tambahkan menu senilai total Rp60.000 ke keranjang.
> 2. Buka checkout dengan alamat "Kantor".
> 3. Pilih voucher GRATISONGKIR.
> 4. Perhatikan ringkasan pembayaran.

## Expected vs actual

Tulis keduanya berdampingan, dengan angka atau teks yang pasti. **Expected harus merujuk ke requirement**, bukan pendapat pribadi:

> **Expected (US-02 AC3a):** ongkir menjadi Rp0, baris "Voucher ongkir" berisi -Rp9.000, total bayar Rp60.000.
>
> **Actual:** baris "Voucher ongkir" berisi -Rp15.000, total bayar Rp54.000. Potongan Rp6.000 memotong harga makanan.

Rujukan ke AC punya dua manfaat. Developer langsung tahu aturan mana yang dilanggar, dan tidak ada debat "menurut saya sih seharusnya begini".

Kalau requirement-nya ternyata tidak mengatur kasus ini, jangan tulis sebagai bug pasti. Tulis sebagai pertanyaan ke PM, atau buat tiket dengan label "needs clarification".

## Environment

Bug yang hanya muncul di satu kondisi akan berstatus "cannot reproduce" kalau environment-nya tidak ditulis:

- **Build atau versi:** misalnya staging build 2.14.0 (431).
- **Perangkat dan OS:** Android 14, Samsung A54.
- **Browser** untuk web: Chrome 131 di Windows 11.
- **Akun dan role:** akun uji, member biasa atau member Plus.
- **Kondisi jaringan** jika relevan.

## Evidence

- **Screenshot** untuk masalah tampilan atau angka yang salah. Beri tanda pada bagian yang salah.
- **Rekaman layar** untuk masalah yang melibatkan urutan aksi. Ini bukti paling kuat.
- **Log atau response API** jika kamu punya akses, misalnya dari tab Network di browser.

Pastikan evidence bisa dibuka oleh tim. Link ke folder pribadi yang terkunci sama saja dengan tidak ada evidence.

## Satu bug, satu tiket

Jika kamu menemukan dua masalah dalam satu alur, buat dua tiket. Bug yang digabung sulit dilacak: satu sudah diperbaiki, satu belum, lalu tiketnya berstatus apa? Kalau keduanya saling terkait, hubungkan tiketnya dengan link.

## Checklist sebelum mengirim

- [ ] Judul menyebut area, masalah, dan kondisinya.
- [ ] Langkah reproduksi bernomor dan sudah dicoba ulang dari awal.
- [ ] Expected merujuk ke requirement, actual berisi hasil konkret.
- [ ] Environment lengkap.
- [ ] Evidence terlampir dan bisa dibuka tim.
- [ ] Sudah dicek bahwa bug ini belum pernah dilaporkan orang lain.

## Ringkasan

- Bug report yang baik bisa direproduksi tanpa bertanya.
- Judul: area, apa yang salah, dan kondisinya.
- Langkah reproduksi bernomor, dengan data konkret dan sependek mungkin.
- Expected merujuk ke requirement, actual berisi hasil yang terlihat.
- Lampirkan environment dan evidence, dan buat satu tiket untuk setiap bug.
