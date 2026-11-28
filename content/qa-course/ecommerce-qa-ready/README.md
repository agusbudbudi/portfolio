# E-commerce QA Ready: konten course

Source artikel untuk course ketiga (level advanced, lanjutan dari **Junior QA
Ready** dan **Fintech QA Ready**). File ini tidak dirender oleh aplikasi.

Status: 12 artikel, thumbnail, dan `feedback.json` selesai. Misi 4 phase TokoKita
siap (build staging rc1, rc2, rc3). Belum di-seed ke database.

## Cara memasukkan ke database (script)

`course.json` berisi metadata course + urutan artikel dan misi. Seed membuat
kategori yang belum ada (Design QA, Performance & Release), 12 artikel, dan
course-nya sebagai **draft**.

Dry run (tidak menulis apa-apa):

```bash
npm run seed:course -- content/qa-course/ecommerce-qa-ready
```

Tulis ke Turso:

```bash
npm run seed:course -- content/qa-course/ecommerce-qa-ready --apply
```

Publish (unggah thumbnail dari `thumbnails/` ke Blob, artikel jadi published +
**course-only**, lalu course jadi published dengan `thumbnails/course.png` dan
SEO dari `course.json`):

```bash
npm run publish:course -- content/qa-course/ecommerce-qa-ready
```

```bash
npm run publish:course -- content/qa-course/ecommerce-qa-ready --apply
```

Feedback Checkpoint (popup feedback di akhir tiap modul, flow yang sama dengan
Junior QA Ready; pertanyaan dan flow yang sudah ada dipakai ulang). Jalankan
setelah course di-seed:

```bash
npm run seed:feedback -- content/qa-course/ecommerce-qa-ready
```

```bash
npm run seed:feedback -- content/qa-course/ecommerce-qa-ready --apply --attach
```

Thumbnail dibuat ulang dengan `npm run course:thumbs -- content/qa-course/ecommerce-qa-ready`.

Misi phase 3 dan 4 (`voucher-testing`, `release-readiness`) ada di
`public/qa-simulator/config/ecommerce.json`, dengan build staging di
`/qa-simulator/sandbox/tokokita?build=rc2` (bug voucher VP-xx) dan
`?build=rc3` (VP-08 masih open, Analytics debugger dengan bug AN-xx, feature
flag `checkout_v2`). Semuanya harus sudah ter-deploy sebelum course di-publish,
supaya misi modul 3 dan 4 bisa dibuka.

| Build | Phase | Isi |
|---|---|---|
| rc1 (default) | design-review | 13 deviasi desain (DR-xx), `sandbox/tokokita/spec.ts` |
| rc2 | voucher-testing | 8 bug voucher & harga (VP-xx), `sandbox/tokokita/rc2.ts` |
| rc3 | release-readiness | VP-08 open + 5 bug analytics (AN-xx), `sandbox/tokokita/rc3.ts` |

## Positioning

- **Untuk siapa:** QA dengan 1 sampai 3 tahun pengalaman, atau yang sudah
  menyelesaikan dua course sebelumnya. Dasar PRD, EP/BVA, bug report, risk-based
  testing, idempotency, dan release sign-off tidak diulang; artikel menautkan ke
  artikel course sebelumnya.
- **Fokus:** rilis kampanye e-commerce. Aturan promo, konkurensi, design review,
  aksesibilitas, teknik uji logika, performa, analytics, dan keputusan rilis.
- **Praktik:** project QA Simulator **TokoKita** (`ecommerce`, advanced, ±8 jam).
- **Domain contoh di artikel:** aplikasi booking hotel fiktif **"InapYuk"** dengan
  kampanye **Payday Sale** (promo INAP2 dan PAYDAY25, kamar promo terbatas, build
  v3.8.0). Sengaja bukan checkout marketplace supaya jawaban misi TokoKita tidak
  bocor, tapi tetap punya promo, kuota, stok, harga, dan traffic puncak.

## Struktur course

| Modul | Artikel | Misi |
|---|---|---|
| 1. Requirement | 01 Membaca PRD Promo dan Kampanye · 02 Kasus Ramai: Kuota, Stok, dan Klik Dobel · 03 Peta Risiko Rilis Kampanye | `ecommerce` / `requirement-analysis` |
| 2. Design Review | 04 Design Review untuk QA · 05 State yang Sering Hilang dari Desain · 06 Aksesibilitas Dasar untuk QA | `ecommerce` / `design-review` |
| 3. Voucher Testing | 07 Decision Table untuk Aturan Promo · 08 State Transition Testing · 09 Menguji Race Condition dan Double Submit | `ecommerce` / `voucher-testing` |
| 4. Release Readiness | 10 Membaca Hasil Load Test · 11 Validasi Event Analytics · 12 Go / No-Go Kampanye: Monitoring dan Rollback | `ecommerce` / `release-readiness` |

Pemetaan ke assignment simulator:

| Assignment | Disiapkan oleh |
|---|---|
| `rq-gaps` (gap + pertanyaan klarifikasi) | 01, 02 |
| `rq-risk` (peta risiko 11.11) | 03 |
| `dr-findings` (deviasi desain vs build) | 04, 06 |
| `dr-gaps` (pertanyaan untuk desainer) | 05 |
| `dr-report` (ringkasan design QA) | 04 |
| `vp-cases` (test case voucher) | 07, 08 |
| `vp-bugs` (bug voucher & harga) | 08, 09 |
| `rr-performance` (analisis load test) | 10 |
| `rr-analytics` (validasi event) | 11 |
| `rr-signoff` (Go / No-Go + monitoring + rollback) | 12 |

## Intro modul

Ada di `course.json` (`modules[].intro`). Setiap intro ditutup dengan misi yang
dikerjakan di TokoKita.

## Catatan penulisan

- Bahasa Indonesia santai-profesional, sama dengan course sebelumnya. Tanpa em-dash.
- Panjang ±5.800 sampai 7.300 karakter per artikel.
- Tiap artikel ditutup **Checklist** atau **Latihan singkat** yang memakai InapYuk,
  lalu **Ringkasan**. Artikel 12 punya **Penutup course**.
- Jangan menyebut angka/aturan spesifik TokoKita (voucher 1111HEMAT, PERSEN11,
  ongkir Rp 18.000, angka load test rc3, event log u_7731) dan jangan memakai
  contoh yang persis menunjuk bug yang ditanam (VP-xx, AN-xx, PF-xx, DR-xx).
