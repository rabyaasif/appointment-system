# Design System

## 1. Audit (current state)

### Repeated UI pieces

| Item | Occurrences | Files | Decision |
|---|---|---|---|
| Card | 20 | 9 | One `Card` component |
| Page heading | 14 | 12 | One `PageHeader` component |
| Gradient button | 9 | 8 | One `Button` component with variants |
| Skeleton (loading) | 8 | 8 | One `Skeleton` component |
| Modal | 6 | 4 | One `Modal` component |
| Input box | 6 | 6 | `Input`, `Select` and `Textarea` components |
| Status badge | 5 | 5 | One `Badge` component |

### Colors in use

- Brand: `brand` (indigo), `violet`
- Gradient accents: `fuchsia`, `pink`, `orange`
- Status: `amber` (pending), `emerald` (confirmed), `sky` (completed), `rose` (cancelled)
- Service categories: `emerald`, `rose`, `sky`, `fuchsia`
- Neutral: `slate` (text, borders, backgrounds)
- Form errors: `red`

### Font sizes in use

- Sizes: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`
- Custom size outside the Tailwind scale: `text-[11px]`
- Weights: `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`
- `text-[11px]` is used 6 times in 3 files. Decision: replace with `text-xs`.

### Inconsistencies

- Two different reds are used for danger and errors: `rose` (75 uses in 11 files) and `red` (17 uses in 6 files). Decision: use one `danger` color, based on `rose`.
- Gradients have no single rule. The sidebar, the banner and the buttons each use a different one.
- The same long modal code is repeated in 6 places.
- A custom font size (`text-[11px]`) is used outside the Tailwind scale, in 8 files.

## 2. Design tokens

### 2.1 Colors

Rule: colors are named by their purpose, not by their hue.

| Token | Based on | Used for |
|---|---|---|
| `primary` | indigo (currently `brand`) | main actions, links, focus rings, active menu item |
| `secondary` | violet | second color of the main gradient |
| `accent` | fuchsia and pink | highlight gradient on call-to-action buttons |
| `success` | emerald | confirmed status, success messages |
| `warning` | amber | pending status, cautions |
| `info` | sky | completed status, information |
| `danger` | rose | cancel, delete, error messages |
| `slate` (unchanged) | slate | text, borders, backgrounds |

Each color comes in these shades:

| Shade | Used for |
|---|---|
| `50` | soft background (for example a badge background) |
| `500` | main color |
| `600` | hover state |
| `700` | text on top of a soft background |
| `100` | soft ring or light hover background |
| `200` | soft border |
| `900` | very dark shade (only `primary`, used by the sidebar gradient) |

All tokens are defined in `frontend/src/index.css`.

### 2.2 Status colors

| Appointment status | Token |
|---|---|
| Pending | `warning` |
| Confirmed | `success` |
| Completed | `info` |
| Cancelled | `danger`

### 2.3 Typography

Font family: **Plus Jakarta Sans** (fallback: system sans-serif).

Rule: use only the sizes and weights below. No custom sizes such as `text-[11px]`.

| Role | Size | Tailwind classes | Used for |
|---|---|---|---|
| Page title | 24px | `text-2xl font-extrabold tracking-tight` | one per page |
| Stat number | 24px | `text-2xl font-extrabold leading-none` | big numbers on dashboards |
| Dialog title | 18px | `text-lg font-bold` | modal headings |
| Section title | 16px | `text-base font-bold` | card and section headings |
| Body | 14px | `text-sm` | most text |
| Label | 14px | `text-sm font-medium` | form labels, small headings |
| Muted text | 14px | `text-sm text-slate-500` | descriptions under titles |
| Caption | 12px | `text-xs font-semibold` | badges, helper text, small notes |

Font weights:

| Weight | Class | Used for |
|---|---|---|
| 500 | `font-medium` | labels, menu items |
| 600 | `font-semibold` | badges, buttons |
| 700 | `font-bold` | titles |
| 800 | `font-extrabold` | page titles, big numbers | |

### 2.4 Border radius

| Element | Class | Notes |
|---|---|---|
| Input, select, textarea | `rounded-xl` | |
| Button (normal) | `rounded-xl` | |
| Button (small, inside lists) | `rounded-lg` | Confirm, Cancel, Edit |
| Time slot button | `rounded-lg` | |
| Card | `rounded-2xl` | |
| Modal | `rounded-3xl` | |
| Badge, tab chip, avatar | `rounded-full` | |

### 2.5 Shadows

| Element | Class | Notes |
|---|---|---|
| Card | `shadow-sm` | |
| Card on hover | `shadow-md` | only if the card is interactive |
| Primary button | `shadow-lg` + colored glow | for example `shadow-primary-600/25` |
| Modal | `shadow-2xl` | |

### 2.6 Gradients

Rule: only the four gradients below are allowed. Do not write a new gradient inside a page.

| Token | Colors | Used for |
|---|---|---|
| `gradient-primary` | primary-600 to secondary (violet-600) | selected states: active tab, active menu item, selected date or time slot, step numbers, logo |
| `gradient-accent` | primary, purple, pink, orange (slides on hover) | the main call-to-action button on a screen (Create Account, Add Service, Book Appointment) |
| `gradient-hero` | primary-600, secondary, fuchsia | the welcome banner at the top of the Overview pages |
| `gradient-sidebar` | primary-900 to slate-950 | the dark sidebar background |

Status colors can also be used as a soft gradient on stat icons (for example `success`, `warning`, `info`, `accent`), but only on those small icons.

Soft page backgrounds (not a brand gradient):

| Where | Classes |
|---|---|
| Login, Signup, OTP page | `from-slate-50 via-primary-50 to-secondary-50` |
| Dashboard content area | `from-slate-50 to-primary-50/50` |

### 2.7 Avatars

Avatars (the round circle with initials) use only the three colors below, so they always match the app theme.

| Token | Gradient | Classes |
|---|---|---|
| `avatar-1` | primary to secondary | `from-primary-500 to-secondary-500` |
| `avatar-2` | secondary to accent | `from-secondary-500 to-accent-500` |
| `avatar-3` | accent to pink | `from-accent-500 to-pink-500` |

Rules:

- The color is picked from the person's `id` (`id % 3`), so the same person always gets the same color.
- Never use status colors (`success`, `warning`, `info`, `danger`) for avatars.
- Avatar text is always white, `font-bold`, and uses `text-xs` or `text-sm`.
- The sidebar user card uses the same three colors.

### 2.8 Spacing

Rule: use Tailwind's 4px scale (`1` = 4px, `2` = 8px, `3` = 12px, `4` = 16px, `5` = 20px, `6` = 24px). Prefer the values below. No custom values such as `p-[18px]`.

| Where | Classes | Notes |
|---|---|---|
| Page container | `mx-auto max-w-5xl` | `max-w-3xl` for narrow pages (My Schedule) |
| Gap between page blocks | `mt-4` | banner, stat cards, sections |
| Gap after page header or tabs | `mt-5` | before the list starts |
| Gap between list items | `space-y-3` | |
| Gap between cards in a grid | `gap-4` | |
| Card padding (large) | `p-5` | form cards, chart cards |
| Card padding (list row) | `p-4` | appointment and service rows |
| Card header | `px-6 py-4` | title row with a bottom border |
| Modal padding | `p-6` | |
| Form fields | `space-y-1` | each field already reserves space for its error text |
| Two columns in a form | `gap-x-4` | |
| Icon to text | `gap-2` or `gap-3` | |

### 2.9 Sizes (heights)

| Element | Height |
|---|---|
| Input, select, primary button | `h-11` |
| Small button, search box in toolbar | `h-10` |
| Time slot button | `h-9` |
| Avatar (list) | `h-10 w-10` or `h-11 w-11` |
| Stat icon | `h-12 w-12` |