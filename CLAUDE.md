# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**QA Engineer Portfolio** is a modern React 19 + TypeScript + Vite site showcasing Agus Budiman's experience, projects, and certifications. It includes a new **Mentoring Booking system** that allows scheduling 1:1 mentoring sessions with configurable mentors and topics.

**Live:** https://portfolio-qa-agus.vercel.app/

---

## Development Commands

```bash
npm run dev          # Start dev server on localhost:5173
npm run build        # Production build (tsc -b && vite build)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

**Note:** The `build` command runs TypeScript compilation first (`tsc -b`) before Vite, so type errors block the build.

---

## Architecture

### Core Stack

- **Framework:** React 19 + React Router v7
- **Language:** TypeScript (strict mode)
- **Build:** Vite (HMR enabled)
- **Styling:** Tailwind CSS v4 + CSS Custom Properties (`@tailwindcss/vite` plugin)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Theme:** Dark/Light mode via React Context + localStorage

### Directory Structure

```
src/
├── components/
│   ├── Home/           # Hero, timelines, project showcase components
│   ├── Layout/         # Navbar, Footer
│   └── common/         # Button, Badge, ProjectCard, SectionHeader
├── context/
│   └── ThemeContext.tsx # Dark/light mode provider (html.dark class + CSS vars)
├── pages/
│   ├── Home.tsx, About.tsx, Projects.tsx, Certifications.tsx
│   └── Mentoring/
│       ├── BookingPage.tsx          # Entry point for mentoring booking
│       └── components/              # Form, fields, banners
├── hooks/
│   ├── useConfig.ts       # Loads mentoring config JSON
│   ├── useFormValidation.ts
│   └── useDraft.ts
├── lib/
│   ├── dates.ts           # Date calculation & slot logic
│   ├── validation.ts      # Form validation rules
│   └── whatsapp.ts        # WhatsApp link generator
├── App.tsx                # Router setup (routes below)
├── main.tsx
└── index.css              # Tailwind import + CSS custom properties
```

### Routes

| Path                | Component      | Note                                  |
|--------------------|----------------|---------------------------------------|
| `/`                | Home           | Hero, experience, projects, skills    |
| `/about`           | About          | Full bio, work history, education     |
| `/projects`        | Projects       | Project showcase with tags            |
| `/certifications`  | Certifications | Certification cards with images       |
| `/mentoring/booking` | BookingPage   | New mentoring booking form            |

---

## Styling System

### CSS Custom Properties + Tailwind Hybrid

**Light Mode** (default, `data-theme="light"`):
- `--bg-primary`, `--bg-secondary`, `--bg-card` — background colors
- `--text-primary`, `--text-secondary`, `--text-muted` — text colors
- `--accent` (#2590ff), `--border`, `--shadow` — accent & borders

**Dark Mode** (`data-theme="dark"` + `html.dark` class):
- Inverted values in CSS custom properties
- Tailwind `dark:` variants for Tailwind-defined colors (e.g., `dark:bg-slate-950`)

**Important:** Pages transitioning from vanilla CSS to Tailwind should:
1. Use `dark:` Tailwind variants for colors (e.g., `dark:border-slate-800`)
2. Use `var(--*)` CSS custom properties **only** for legacy pages or shared design tokens
3. Newer pages (like the Mentoring booking) should be **100% Tailwind + dark: variants**

### Mentoring Booking Styling (Reference)

The `/mentoring/booking` page demonstrates the **target styling approach**:
- All padding/spacing: Tailwind classes (`p-6`, `gap-7`, `md:p-4`)
- All colors: `dark:` Tailwind variants (e.g., `dark:border-slate-800`, `dark:bg-slate-950`)
- **No vanilla CSS files** for component-level styling
- Global styles only in `src/index.css` for theme provider & base resets

---

## Mentoring Booking Feature

### Config-Driven System

**Source:** `/public/config/qa-mentoring-config.json`

```json
{
  "metadata": { "timezone", "version" },
  "topics": [{ "id", "label", "description" }],
  "mentors": [{ "id", "name", "whatsapp", "expertise", "bio", "schedule" }],
  "availableDays": ["monday", "tuesday", ...],
  "bookingRules": {
    "minIntroductionLength": 256,
    "sessionDurationMinutes": 60,
    "daysInAdvanceMin": 1,
    "daysInAdvanceMax": 30
  }
}
```

To **add a new mentor** or **change availability**:
1. Edit `/public/config/qa-mentoring-config.json`
2. No code changes needed — the UI re-reads at page load via `useConfig` hook

### Booking Flow

1. **useConfig** (`src/hooks/useConfig.ts`) — Fetches & parses JSON, handles loading/error states
2. **BookingForm** — 2-panel grid layout (Topics + Date + Mentor | Time + Intro + Submit)
3. **Field Components** — TopicsField, DateField, MentorField, TimeField, IntroField
4. **Validation** — useFormValidation checks min length, required fields
5. **Draft Persistence** — useDraft saves form state to localStorage (survives refresh)
6. **WhatsApp Integration** — generateWhatsAppLink builds pre-filled message, opens `https://wa.me/...`

### Key Files

| File                    | Purpose                                     |
|-------------------------|---------------------------------------------|
| BookingPage.tsx         | Page wrapper, loading/error states          |
| BookingForm.tsx         | Main form logic, validation, 2-panel layout |
| TopicsField.tsx         | Horizontal slider, max 2 selections         |
| DateField.tsx           | Calendar month picker, availability filter |
| MentorField.tsx         | List with expertise badges, slot checking  |
| TimeField.tsx           | 3-column grid, duration display             |
| IntroField.tsx          | Textarea with char counter & progress bar  |
| useConfig.ts            | Load & parse mentoring config               |
| useFormValidation.ts    | Validation rules & error messages           |
| useDraft.ts             | localStorage draft auto-save                |
| lib/dates.ts            | Slot calculation, availability logic       |
| lib/validation.ts       | Error message mapping                       |
| lib/whatsapp.ts         | WhatsApp link generator                     |

---

## Theme System (ThemeContext)

**Pattern:**

```tsx
import { useTheme } from './context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  // ...
}
```

**How it works:**
1. User toggles theme in Navbar
2. ThemeContext updates state → sets `html.dark` class + `data-theme` attribute
3. CSS custom properties and Tailwind `dark:` variants react automatically
4. Theme persists in localStorage (`theme` key)

**Important:** Always use **both** mechanisms for new components:
- CSS custom properties for colors that reference `var(--*)` (e.g., `border-[var(--border)]`)
- Tailwind `dark:` variants for hardcoded colors (e.g., `dark:bg-slate-800`)

---

## Common Patterns

### Form Validation

**In BookingForm:**
```tsx
const { errors, validate, clearError, clearAllErrors } = useFormValidation();

// On field change: clear the specific error
onChange={(val) => { setValue(val); clearError('fieldName'); }}

// On submit: validate all, show banner if failed
const isValid = validate({ field1, field2, ... });
if (!isValid) { setShowErrorBanner(true); return; }
```

**Error messages defined in** `lib/validation.ts` — update there when adding new validations.

### Draft Auto-Save

```tsx
const { draft, save, restore, clear, draftSavedIndicator } = useDraft();

// Auto-save on any field change (run in useEffect)
useEffect(() => { save({ date, topics, mentorId, time, introduction }); }, [...deps]);

// Show "Draft tersimpan" indicator
{draftSavedIndicator && <div>Draft tersimpan</div>}

// Restore form from draft
const handleRestore = () => {
  const formData = restore();
  // ... apply to form state
};
```

### Responsive Layout

Use Tailwind breakpoints:
- `md:` — 768px+
- `lg:` — 1024px+

Example (from BookingForm):
```tsx
<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
  <div className="lg:col-span-3 p-6 md:p-4">Left Panel</div>
  <div className="lg:col-span-2 p-6 md:p-4">Right Panel</div>
</div>
```

---

## Import/Module Guidelines

- **Hooks:** Always `import { useHookName } from '../../hooks/...'` (relative path OK for local hooks)
- **Components:** Import from relative paths `./components/...`
- **Utilities:** Import from `src/lib/...` (e.g., `import { formatDate } from '../../lib/dates'`)
- **Types:** Define in the hook/util they belong to; export for use elsewhere
- **Context:** `import { useTheme } from '../../context/ThemeContext'`

---

## Testing & Verification

- **Type checking:** `npm run build` runs `tsc -b` first; all type errors block the build
- **Linting:** `npm run lint` (ESLint + React hooks plugin)
- **Manual verification:** After changes, run `npm run dev` and test the affected page(s)

---

## Performance Notes

- **Code splitting:** Not yet implemented (vite warn on build > 500KB)
- **Images:** Stored in `/public/img/` as static assets (no dynamic imports)
- **Fonts:** DM Sans from Google Fonts via `@import` in `index.css`
- **Icons:** Lucide React (tree-shakeable)

---

## Deployment

**Target:** Vercel (current production host)

```bash
npm run build  # Creates dist/
```

Vercel auto-deploys on push to main branch. Build command in `vercel.json` (or auto-detected from `package.json`).

---

## Key Decisions & Rationale

1. **CSS Custom Properties + Tailwind Hybrid:**
   - Custom props for theme colors that need runtime switching
   - Tailwind for rapid utility-first layout and dark mode support
   - Mentoring page is the **reference implementation** of this pattern

2. **Config-Driven Mentoring:**
   - JSON config allows mentors/topics to update without code deployment
   - useConfig hook handles loading, caching, error states
   - Schedule stored as `Record<day, timeSlots[]>` for flexible expansion

3. **Draft Persistence:**
   - Form state auto-saved to localStorage every keystroke
   - Survives page refresh but clears after successful booking
   - Improves UX for slow/unreliable connections

4. **WhatsApp Integration:**
   - Pre-filled message reduces friction (user just sends)
   - No backend needed — direct user-to-mentor conversation
   - Timezone is baked into config (WIB)
