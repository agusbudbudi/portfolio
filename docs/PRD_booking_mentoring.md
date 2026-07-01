# Product Requirements Document
## QA Mentoring Booking Page - MVP

**Project:** Agent Billy - QA Mentoring Module  
**Version:** 1.0 MVP  
**Last Updated:** June 29, 2026  
**Status:** Ready for Development  

---

## 1. Overview

### 1.1 Purpose
Provide a streamlined, user-friendly interface for QA professionals to book mentoring sessions with available mentors. The form captures session details and generates a pre-filled WhatsApp message for mentor confirmation.

### 1.2 Scope
- Single-page form with dependent field validation
- localStorage draft save/restore capability
- WhatsApp integration with pre-filled message
- JSON-based configuration (static for MVP, API-driven future)

### 1.3 Success Metrics
- Form completion rate > 80%
- Average time to fill form: < 3 minutes
- WhatsApp message sent within form session
- No validation errors for valid inputs

---

## 2. User Audience & Context

### 2.1 Primary User
- QA Engineers / QA Leads
- Seeking practical mentoring on specific QA topics
- Mobile-accessible (direct WhatsApp after booking)
- Prefer asynchronous booking (no real-time confirmation)

### 2.2 Secondary User
- Mentors (receive WhatsApp notifications)
- Admin (configure JSON for now, API later)

---

## 3. Functional Requirements

### 3.1 Configuration (JSON Structure)

**File Location:** `/config/qa-mentoring-config.json`

```json
{
  "metadata": {
    "timezone": "Asia/Jakarta",
    "timezone_abbr": "WIB",
    "version": "1.0"
  },

  "topics": [
    {
      "id": "api-testing",
      "label": "API Testing",
      "description": "REST/GraphQL API testing strategies"
    },
    {
      "id": "ui-automation",
      "label": "UI Automation",
      "description": "Selenium, Cypress, Playwright frameworks"
    },
    {
      "id": "performance-testing",
      "label": "Performance Testing",
      "description": "Load testing, metrics analysis, optimization"
    },
    {
      "id": "mobile-testing",
      "label": "Mobile Testing",
      "description": "Android & iOS testing strategies"
    },
    {
      "id": "test-automation-framework",
      "label": "Test Automation Framework",
      "description": "Building maintainable automation architecture"
    }
  ],

  "mentors": [
    {
      "id": "mentor-001",
      "name": "Budi Santoso",
      "whatsapp": "62812345678",
      "expertise": ["api-testing", "ui-automation", "test-automation-framework"],
      "bio": "10+ years QA automation experience",
      "schedule": {
        "monday": ["09:00", "10:00", "14:00", "15:00"],
        "wednesday": ["10:00", "11:00", "15:00", "16:00"],
        "friday": ["09:00", "10:00", "14:00", "15:00"]
      }
    },
    {
      "id": "mentor-002",
      "name": "Siti Nurhaliza",
      "whatsapp": "62887654321",
      "expertise": ["performance-testing", "ui-automation", "mobile-testing"],
      "bio": "8+ years in performance testing",
      "schedule": {
        "tuesday": ["09:00", "14:00", "15:00"],
        "thursday": ["10:00", "11:00", "14:00"],
        "saturday": ["10:00", "11:00"]
      }
    },
    {
      "id": "mentor-003",
      "name": "Ahmad Rizki",
      "whatsapp": "62899988776",
      "expertise": ["mobile-testing", "api-testing"],
      "bio": "Specialized in mobile QA automation",
      "schedule": {
        "monday": ["14:00", "15:00"],
        "tuesday": ["10:00", "11:00"],
        "wednesday": ["14:00", "15:00"],
        "thursday": ["09:00", "10:00"]
      }
    }
  ],

  "availableDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  
  "bookingRules": {
    "minIntroductionLength": 256,
    "maxTopicsSelectable": 3,
    "sessionDurationMinutes": 60,
    "daysInAdvanceMin": 1,
    "daysInAdvanceMax": 30
  }
}
```

### 3.2 Form Fields

#### 3.2.1 Date Selection
- **Label:** Pilih Tanggal
- **Type:** Dropdown / Date Picker
- **Default:** Next available date from `availableDays`
- **Rules:**
  - Only show dates from `availableDays`
  - Only show dates within next 30 days
  - Disabled dates: dates with 0 available mentors
  - Show day name + date (e.g., "Senin, 01 Juli 2026")
- **Required:** Yes

#### 3.2.2 Mentor Selection
- **Label:** Pilih Mentor
- **Type:** Dropdown (Radio group visual)
- **Placeholder:** Pilih mentor untuk sesi ini
- **Rules:**
  - Initially empty (no default)
  - Filtered based on selected topics (only mentors with expertise in selected topics)
  - Show mentor name + expertise tags
  - Show "Not available" indicator if no slot on selected date
- **Required:** Yes
- **Validation Message:** "Mentor harus dipilih untuk melanjutkan"

#### 3.2.3 Topics Selection
- **Label:** Topik yang Ingin Dibahas
- **Type:** Checkbox group (Multiple select)
- **Rules:**
  - Minimum: 1 topic
  - Maximum: 3 topics
  - Show all topics from config
  - Display as card/checkbox with description
  - Re-filter mentor list on change
- **Required:** Yes
- **Validation Messages:**
  - "Minimal pilih 1 topik"
  - "Maksimal 3 topik dapat dipilih"

#### 3.2.4 Time Selection
- **Label:** Pilih Waktu (1 Jam)
- **Type:** Dropdown
- **Rules:**
  - Generated from selected mentor's schedule for selected date
  - Show time range (e.g., "09:00 - 10:00 WIB")
  - Hide fully booked slots (grey out)
  - Dynamically update when date or mentor changes
- **Required:** Yes
- **Validation Message:** "Waktu harus dipilih"

#### 3.2.5 Introduction & Discussion Topics
- **Label:** Jelaskan Materi & Pendekatan Diskusi
- **Type:** Textarea
- **Placeholder:** "Jelaskan materi spesifik yang ingin dibahas, pertanyaan yang ingin dijawab, dan pendekatan mentoring apa yang Anda harapkan. Minimal 256 karakter.\n\nContoh:\n'Saya ingin belajar tentang page object model di Cypress. Saat ini project kami menggunakan Cypress tapi struktur kode tidak terorganisir dengan baik...'"
- **Rules:**
  - Minimum: 256 characters
  - Maximum: 2000 characters
  - Character counter at bottom
  - Trim whitespace before validation
- **Required:** Yes
- **Validation Messages:**
  - "Deskripsi terlalu pendek (minimal 256 karakter)"
  - "Deskripsi terlalu panjang (maksimal 2000 karakter)"

---

### 3.3 Field Dependencies & Logic

```
1. PAGE LOAD
   ├─ Load config.json
   ├─ Calculate next available date
   │  └─ First date in availableDays + at least 1 mentor available
   ├─ Set date field = next available date (pre-selected)
   ├─ All other fields = empty
   └─ Attempt restore draft from localStorage

2. USER SELECT TOPICS
   ├─ Validate: 1-3 topics max
   └─ Trigger: Filter mentor list
      ├─ Show only mentors with expertise in ALL selected topics
      ├─ If no mentor matches all topics, show: "Tidak ada mentor yang menguasai kombinasi topik ini"
      └─ Reset mentor selection (clear current selection)

3. USER SELECT MENTOR
   ├─ Fetch mentor's schedule for selected date
   └─ Populate time dropdown
      ├─ Show only available slots (e.g., 09:00-10:00 WIB)
      └─ Show "(Penuh)" for booked slots

4. USER SELECT DATE
   ├─ If date changed, refresh time slots for selected mentor
   └─ If no slots available for this date + mentor, show: "Mentor tidak tersedia pada tanggal ini"

5. USER MODIFY ANY FIELD
   ├─ Auto-save to localStorage (debounce 1000ms)
   ├─ Show subtle indicator "Draft tersimpan" for 2 seconds
   └─ Clear indicator

6. USER SUBMIT FORM
   ├─ Validate all fields
   ├─ If validation fails: show error banner at top
   ├─ If validation passes:
   │  ├─ Generate WhatsApp link + pre-filled message
   │  ├─ Save final state to localStorage with timestamp
   │  ├─ Redirect to WhatsApp (user sends manually)
   │  └─ Show success toast: "Pesan WhatsApp siap dikirim ke {mentor_name}"
   └─ Return to form (user can modify & submit again)
```

---

### 3.4 WhatsApp Integration

#### 3.4.1 Message Generation

**Template:**
```
Halo {mentor_name},

Saya ingin booking sesi mentoring QA dengan Anda.

📅 Tanggal: {day_name}, {date} {month} {year}
⏰ Waktu: {time_start} - {time_end} WIB
👤 Nama Saya: {user_name_if_available}

📚 Topik yang ingin dibahas:
{topic_1}
{topic_2}
{topic_3}

💬 Detail Diskusi:
{user_introduction_text}

Apakah Anda bisa confirm ketersediaan slot ini?

Terima kasih!
```

**Example Output:**
```
Halo Budi Santoso,

Saya ingin booking sesi mentoring QA dengan Anda.

📅 Tanggal: Kamis, 30 Juni 2026
⏰ Waktu: 14:00 - 15:00 WIB
👤 Nama Saya: Agus Budiman

📚 Topik yang ingin dibahas:
- API Testing
- Test Automation Framework

💬 Detail Diskusi:
Saya sedang mengembangkan automation framework untuk project kami. Saat ini menggunakan REST Assured untuk API testing, tapi ingin belajar best practices untuk structure dan maintainability jangka panjang...

Apakah Anda bisa confirm ketersediaan slot ini?

Terima kasih!
```

#### 3.4.2 Implementation
- Use `https://wa.me/{phone}?text={encoded_message}` format
- URL encode message using `encodeURIComponent()`
- Phone number format: `62{digits_without_0}` (international format)
- Open in new tab: `window.open(whatsapp_link, '_blank')`

---

### 3.5 localStorage Draft Management

#### 3.5.1 Storage Key
`qa-mentoring-booking-draft`

#### 3.5.2 Data Structure
```javascript
{
  savedAt: "2026-06-29T14:30:00Z",  // ISO timestamp
  expiresAt: "2026-07-06T14:30:00Z", // 7 days expiry
  formData: {
    date: "2026-06-30",
    topics: ["api-testing", "ui-automation"],
    mentorId: "mentor-001",
    time: "14:00",
    introduction: "..."
  }
}
```

#### 3.5.3 Behavior
- **Auto-save:** On any field change (debounce 1000ms)
- **Show indicator:** "Draft tersimpan" for 2 seconds after save
- **Restore on load:** If valid draft exists (not expired), show banner:
  - "Kami menemukan draft Anda dari {date}. [Restore] atau [Buat Baru]"
- **Clear draft:** After successful WhatsApp message generation
- **Expiry:** 7 days - auto-delete on load if expired

---

## 4. Non-Functional Requirements

### 4.1 Performance
- JSON config load time: < 500ms
- Form render time: < 1s
- localStorage operations: < 100ms
- WhatsApp link generation: < 200ms

### 4.2 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support for all form fields
- Focus indicators visible on all interactive elements
- Error messages linked to form fields

### 4.3 Mobile Optimization
- Responsive design: mobile-first (320px+)
- Touch-friendly inputs (min 44px height)
- WhatsApp deep link works on mobile
- Vertical layout for all fields

### 4.4 Error Handling
- Network error (JSON load fails): Show fallback message + retry button
- Invalid JSON format: Show admin error message
- localStorage quota exceeded: Show warning, disable auto-save
- Form validation errors: Show field-level error messages

### 4.5 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

---

## 5. Design & UI Requirements

### 5.1 Layout
- **Container:** Max width 600px
- **Padding:** 24px (mobile), 32px (desktop)
- **Spacing:** 20px between form sections, 12px between form fields

### 5.2 Typography
- **Page Title:** 28px, semibold, dark gray
- **Section Labels:** 14px, semibold, dark gray
- **Field Labels:** 14px, medium, dark gray
- **Helper Text:** 12px, regular, medium gray
- **Input Text:** 14px, regular, dark gray
- **Error Messages:** 12px, regular, red (#ef4444)

### 5.3 Color Palette
- **Primary:** #2563eb (blue, CTA button)
- **Primary Dark:** #1d4ed8 (hover state)
- **Success:** #10b981 (auto-save indicator)
- **Error:** #ef4444 (validation errors)
- **Background:** #ffffff (light), #f9fafb (section bg)
- **Text:** #111827 (primary), #6b7280 (secondary)
- **Border:** #e5e7eb (light gray)

### 5.4 Components
- **Inputs:** shadcn/ui Select, Textarea
- **Buttons:** shadcn/ui Button (blue primary, ghost secondary)
- **Checkboxes:** shadcn/ui Checkbox
- **Alerts:** shadcn/ui Alert (for errors, drafts)
- **Badge:** shadcn/ui Badge (for topics, mentor expertise)

### 5.5 States
- **Default:** All fields empty except date (pre-selected)
- **Loading:** Spinner on JSON load, button disabled during submit
- **Error:** Field-level error messages, top error banner
- **Draft restored:** Info banner with restore/new options
- **Success:** Toast notification, draft cleared

---

## 6. Technical Implementation

### 6.1 Tech Stack
- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State Management:** React useState + localStorage
- **Config:** JSON file in `/public/config/`
- **Analytics:** GA4 event tracking (future integration with Agent Billy)

### 6.2 Project Structure
```
app/
├── qa-mentoring/
│   ├── page.tsx              // Main page
│   ├── components/
│   │   ├── BookingForm.tsx    // Main form component
│   │   ├── DateField.tsx      // Date select
│   │   ├── MentorField.tsx    // Mentor select
│   │   ├── TopicsField.tsx    // Topics multi-select
│   │   ├── TimeField.tsx      // Time select
│   │   ├── IntroField.tsx     // Textarea
│   │   ├── DraftBanner.tsx    // Draft restore banner
│   │   └── ErrorBanner.tsx    // Top error banner
│   └── hooks/
│       ├── useConfig.ts       // Load & parse config.json
│       ├── useDraft.ts        // localStorage management
│       └── useFormValidation.ts // Validation logic
│
public/
└── config/
    └── qa-mentoring-config.json

lib/
├── whatsapp.ts               // WhatsApp link generation
├── validation.ts             // Form validation logic
└── dates.ts                  // Date calculation helpers
```

### 6.3 Key Functions

#### `useConfig()`
```typescript
const { config, loading, error } = useConfig();
// Returns: { config, loading, error }
```

#### `useDraft()`
```typescript
const { draft, restore, save, clear } = useDraft();
// Returns: { draft, restore(), save(), clear() }
```

#### `generateWhatsAppLink()`
```typescript
const link = generateWhatsAppLink({
  mentorPhone: "62812345678",
  mentorName: "Budi Santoso",
  date: "2026-06-30",
  time: "14:00",
  topics: ["api-testing"],
  introduction: "..."
});
// Returns: "https://wa.me/62812345678?text=..."
```

#### `validateForm()`
```typescript
const errors = validateForm({
  date, topics, mentorId, time, introduction
});
// Returns: { [field]: errorMessage | null }
```

---

## 7. Success Criteria

- ✅ All form fields render correctly with proper labels and help text
- ✅ Field dependencies work: topic selection filters mentors, mentor + date filter time slots
- ✅ Form validation catches all edge cases
- ✅ localStorage draft saves/restores seamlessly
- ✅ WhatsApp link generation produces valid, readable message
- ✅ Mobile responsive on all screen sizes
- ✅ No console errors or warnings
- ✅ Accessibility compliance verified
- ✅ GA4 events tracked (form complete, WhatsApp sent)

---

## 8. Future Enhancements (Phase 2)

- [ ] Replace JSON config with API endpoint
- [ ] Real-time mentor availability from booking system
- [ ] User authentication (auto-fill name)
- [ ] Email confirmation instead of WhatsApp
- [ ] Calendar integration (iCal export)
- [ ] Booking history & cancellation
- [ ] Mentor ratings & reviews
- [ ] Automated WhatsApp confirmation workflow
- [ ] Multi-language support
- [ ] Timezone selection

---

## 9. Assumptions Clarified

| Question | Decision | Rationale |
|----------|----------|-----------|
| Next available date logic? | First available day from availableDays with ≥1 mentor available | Simpler logic, user can select different dates if needed |
| Date picker independence? | Date = independent, Time = dependent on date + mentor | Better UX - user can explore dates first |
| User name source? | Not available in MVP (TBD with authentication) | Keep MVP simple, add with user auth phase |
| localStorage auto-save trigger? | onChange with 1000ms debounce | Prevent excessive writes, smooth UX |
| Clear draft on WhatsApp send? | Yes, after message generated | Prevent confusion if user returns to page |
| Mentor name in WhatsApp? | Yes, personalized opening | Better engagement with mentor |

---

## 10. Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-06-29 | 1.0 | Initial PRD creation |