---
title: Membaca Hasil Load Test sebagai QA
slug: membaca-hasil-load-test
excerpt: QA tidak harus menjalankan load test untuk bisa menilainya. Cara membaca p95, error rate per endpoint, dan skenario test, supaya tidak tertipu kesimpulan "aman".
seo_title: Cara Membaca Hasil Load Test untuk QA
seo_description: Panduan QA membaca laporan load test: rata-rata vs p95 dan p99, error rate per endpoint, jenis test, kritik skenario, dan risiko kapasitas sebelum kampanye.
category: Performance & Release
tags: load test, performance testing, p95, error rate, kampanye
visibility: library
course: E-commerce QA Ready · Modul 4 (Release Readiness) · Lesson 1
---

Dua hari sebelum Payday Sale, tim platform InapYuk mengirim laporan load test ke grup: tabel penuh angka, grafik yang naik lalu mendatar, dan satu kalimat penutup, "Rata-rata respons 420 ms, error 0,3%. Aman."

Semua orang lega. Tidak ada yang bertanya lebih jauh, karena tidak ada yang merasa paham cukup untuk bertanya.

Kamu tidak harus bisa menjalankan load test untuk bisa menilainya. Yang kamu butuhkan adalah kemampuan **membaca** laporannya: angka mana yang penting, angka mana yang menipu, dan apakah skenarionya mewakili kondisi kampanye. Di Modul 1 kamu sudah mengubah "harus cepat" jadi target terukur. Sekarang saatnya memakai target itu.

## Istilah yang perlu kamu pahami

| Istilah | Arti |
|---|---|
| Throughput | Jumlah request yang dilayani per detik (RPS) |
| Latency / waktu respons | Waktu dari request dikirim sampai respons diterima |
| Rata-rata | Jumlah semua waktu respons dibagi jumlah request |
| p95 | 95% request lebih cepat dari angka ini, 5% lebih lambat |
| p99 | 99% request lebih cepat dari angka ini |
| Error rate | Persentase request yang gagal (timeout, 5xx, error bisnis) |
| Saturasi | Seberapa penuh sumber daya: CPU, memori, koneksi database, jumlah server |

## Rata-rata menyembunyikan user yang menunggu

Rata-rata 420 ms terdengar cepat. Tapi coba lihat distribusinya:

| Metrik | Nilai |
|---|---|
| Rata-rata | 420 ms |
| p95 | 1.600 ms |
| p99 | 4.100 ms |

Artinya 1 dari 20 tamu menunggu lebih dari 1,6 detik, dan 1 dari 100 menunggu lebih dari 4 detik. Di traffic puncak dengan ribuan booking per menit, itu ratusan orang yang mungkin menyerah dan pindah aplikasi.

Karena itu target performa ditulis dalam p95 atau p99, bukan rata-rata. Saat membaca laporan, **abaikan rata-rata dulu**. Cari p95, bandingkan dengan target.

## Baca per endpoint, bukan total

Laporan sering punya baris "Total". Baris itu bisa menyesatkan, karena endpoint yang paling sering dipanggil mendominasi angkanya.

| Endpoint | Request/detik | p95 | Error rate |
|---|---|---|---|
| GET /hotels | 3.000 | 450 ms | 0,05% |
| POST /promo/apply | 400 | 1.300 ms | 1,8% |
| POST /booking | 200 | 1.900 ms | 0,9% |
| **Total** | **3.600** | **700 ms** | **0,3%** |

Error rate total 0,3% terlihat aman di bawah target 0,5%. Tapi hitung ulang per endpoint: promo gagal 1,8% dan booking gagal 0,9%. Dua endpoint yang paling penting untuk uang justru yang paling bermasalah, tertutup oleh ribuan request pencarian hotel yang sehat.

Aturannya: **target berlaku untuk setiap endpoint penting**, kecuali PRD menyatakan lain. Kalau PRD tidak jelas, ini pertanyaan yang harus dijawab sebelum load test dijalankan.

## Jenis load test

Setiap jenis menjawab pertanyaan yang berbeda:

| Jenis | Pertanyaan | Bentuk traffic |
|---|---|---|
| Load test | Apakah sistem memenuhi target di traffic yang diperkirakan? | Naik ke target, lalu bertahan |
| Stress test | Di titik mana sistem mulai gagal? | Terus naik melewati target |
| Spike test | Apakah sistem bertahan saat traffic melonjak tiba-tiba? | Lonjakan tajam dalam hitungan detik atau menit |
| Soak test | Apakah sistem stabil dalam waktu lama? | Traffic sedang selama berjam-jam |

Kampanye yang dimulai tepat jam 00:00 adalah kasus **spike**, bukan load biasa. Load test yang naik pelan selama 30 menit memberi waktu server untuk menambah kapasitas, kemewahan yang tidak ada di malam kampanye.

## Kritik skenarionya

Load test hanya sebaik skenarionya. Sebelum percaya hasilnya, tanyakan:

**Bentuk traffic.** Naik pelan atau melonjak? Bertahan berapa lama? Apakah mirip pola kampanye sebelumnya?

**Data uji.** Apakah perilaku virtual user mirip user asli? Kalau di kampanye mayoritas tamu memakai satu kode promo yang sama, tapi load test memakai ribuan kode unik, maka rebutan kuota di satu kode tidak pernah diuji.

**Dependency.** Apakah payment gateway, layanan hotel, atau layanan eksternal lain diuji asli atau di-mock? Mock yang selalu merespons 50 ms membuat endpoint terlihat jauh lebih cepat dari kenyataan.

**Cache dan data.** Apakah cache dipanaskan dulu? Apakah ukuran database staging mendekati produksi?

**Lingkungan.** Apakah staging punya ukuran server dan konfigurasi yang sama dengan produksi?

Setiap jawaban "tidak" bukan berarti hasilnya salah, tapi berarti hasilnya **lebih optimis** dari kenyataan.

## Lihat kapasitas

Selain angka respons, perhatikan tanda sistem sudah penuh:

- Autoscaling mencapai batas maksimal sebelum target traffic tercapai.
- CPU atau memori di atas 85 sampai 90% saat traffic target.
- Koneksi database mendekati batas.

Sistem yang lulus target tapi sudah di batas kapasitas tidak punya ruang untuk traffic yang sedikit lebih tinggi dari perkiraan. Dan perkiraan traffic kampanye hampir selalu meleset.

## Menulis temuan

Tulis temuan dengan bukti angka, dampak, dan rekomendasi yang bisa dieksekusi:

> **Temuan:** Error rate POST /promo/apply melewati target
> **Bukti:** 1,8% di traffic target, target ≤ 0,5%. Total 0,3% tertutup oleh GET /hotels
> **Dampak:** ± 1 dari 55 tamu gagal memakai promo di malam Payday
> **Rekomendasi:** Cari penyebab error terbanyak, lalu load test ulang. Lulus jika error ≤ 0,5% di setiap endpoint

## Ringkasan

- QA tidak harus menjalankan load test untuk menilainya dengan kritis.
- Bandingkan p95 atau p99 dengan target, bukan rata-rata.
- Baca error rate dan latency per endpoint. Baris total bisa menyembunyikan endpoint yang bermasalah.
- Kritik skenario: bentuk traffic, data uji, dependency, cache, dan lingkungan. Kampanye jam 00:00 butuh spike test.
- Performa adalah separuh cerita. Setelah rilis, tim harus bisa membuktikan fitur berhasil, dan itu bergantung pada data analytics.
