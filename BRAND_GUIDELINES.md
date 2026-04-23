# XceliQOS — Brand Guidelines

> **Product Name**: XceliQOS (final, non-negotiable)  
> **Design Principle**: Rule of 3s — three colors, three typeweights, three spacing scales  
> **Last Updated**: 2026-03-19

---

## 1. Brand Identity

### Name
**XceliQOS** — always written as one word, capital L, lowercase u-m-i-q, capital O-S.

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| XceliQOS | XceliQ OS, LUMIQOS, xceliqos, XceliQ-OS |

### Tagline (Rule of 3)
> **Intelligence. Insight. Impact.**

### Brand Promise (3 words)
> **Illuminate Every Learner.**

### Brand Pillars (3 pillars)
1. **Intelligence** — AI-first decisions, not dashboards
2. **Equity** — Every child visible, no one overlooked
3. **Trust** — Data-sovereign, transparent, school-owned

---

## 2. Color System (Rule of 3)

### Primary Palette (3 colors)

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| **Primary** | XceliQ Blue | `#3B82F6` | CTAs, active states, links, primary buttons |
| **Secondary** | XceliQ Emerald | `#10B981` | Success states, growth metrics, positive actions |
| **Accent** | XceliQ Cyan | `#06B6D4` | Highlights, gradients, differentiation |

### Neutral Palette (3 tiers)

| Tier | Name | Hex | Usage |
|------|------|-----|-------|
| **Deep** | Midnight | `#0F172A` | Page background, sidebar |
| **Mid** | Slate | `#1E293B` | Cards, secondary backgrounds |
| **Light** | Silver | `#94A3B8` | Secondary text, borders |

### Signal Colors (3 states)

| State | Name | Hex | Usage |
|-------|------|-----|-------|
| **Warning** | Amber | `#F59E0B` | Alerts, pending states |
| **Danger** | Coral | `#EF4444` | Errors, critical actions |
| **Info** | Violet | `#8B5CF6` | AI insights, special features |

### Brand Gradient
```css
background: linear-gradient(135deg, #10B981, #06B6D4);
```
Used for: Logo mark, avatars, premium badges.

---

## 3. Typography (Rule of 3)

### Typeface
**Inter** — loaded from Google Fonts. Fallback: `-apple-system, BlinkMacSystemFont, sans-serif`

### Weight Scale (3 weights)

| Weight | Value | Usage |
|--------|-------|-------|
| **Regular** | 400 | Body text, descriptions |
| **Semi-Bold** | 600 | Labels, nav items, subheadings |
| **Bold** | 700 | Headings, stat values, emphasis |

### Size Scale (3 tiers)

| Tier | Size | Usage |
|------|------|-------|
| **Large** | 24–28px | Page titles, hero stat values |
| **Medium** | 14–16px | Body copy, nav items, subheadings |
| **Small** | 11–13px | Labels, timestamps, badges, metadata |

---

## 4. Spacing & Layout (Rule of 3)

### Spacing Scale (3 increments)

| Scale | Value | Usage |
|-------|-------|-------|
| **Tight** | 8px | Between inline elements, badge padding |
| **Base** | 16px | Between components, card padding gaps |
| **Loose** | 24–32px | Between sections, page margins |

### Border Radius (3 sizes)

| Size | Value | CSS Variable |
|------|-------|-------------|
| **Small** | 8px | `--radius-sm` |
| **Medium** | 12px | `--radius` |
| **Large** | 16px | `--radius-lg` |

### Grid (Rule of 3)
- **Stats row**: 3 columns (`grid-template-columns: repeat(3, 1fr)`)
- **Charts row**: 2 columns
- **Bottom row**: 2:1 ratio

---

## 5. Logo

### Mark
The logo mark is a **36×36px rounded square** with the brand gradient (`Emerald → Cyan`), containing the letter **"L"** in bold white.

```css
.logo {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #10B981, #06B6D4);
  border-radius: 8px;
  color: white;
  font-weight: 800;
  font-size: 16px;
}
```

### Wordmark
School name appears first (e.g., **"Greenfield Academy"**), with **"powered by XceliQOS"** below in muted text (10px).

### Usage Rules
- Never stretch or rotate the logo
- Minimum clear space: 8px on all sides
- On dark backgrounds only (designed for dark mode)

---

## 6. UI Component Patterns

### Buttons (3 types)
| Type | Style | Usage |
|------|-------|-------|
| **Primary** | Blue gradient + glow shadow | Main actions (Save, Generate, Execute) |
| **Secondary** | Slate background + border | Cancel, alternative actions |
| **Danger** | Red background | Destructive actions (Delete, Remove) |

### Cards
- Background: `rgba(30, 41, 59, 0.7)` with `backdrop-filter: blur(8px)`
- Border: `rgba(148, 163, 184, 0.1)`
- Hover: border brightens to `0.2` opacity

### Animations
- **Transition default**: `all 0.2s ease`
- **Page entry**: `fadeIn 0.3s` (translateY 8px → 0)
- **Hover lift**: `translateY(-1px)` on buttons

---

## 7. Voice & Tone (Rule of 3)

### Brand Voice
| Attribute | Description |
|-----------|-------------|
| **Clear** | No jargon. A principal, teacher, and parent should all understand. |
| **Warm** | Human-first language. "Aarav improved" not "student_id_123 delta +5" |
| **Confident** | Data-backed statements. "3 students need attention" not "some students might" |

### Copy Patterns
- **Headlines**: Action-oriented, max 6 words ("Generate AI Lesson Plan")
- **Descriptions**: One sentence, benefit-first ("Aligned with CBSE board benchmarks")
- **Labels**: UPPERCASE, 12px, muted color ("TOTAL STUDENTS")

---

## 8. Iconography

### Style
Emoji-first for v1 (no icon library dependency). Examples:
- 📊 Dashboard, 📚 Curriculum, 💡 Lesson Planner
- ✅ Success, ⚠️ Warning, ❌ Error
- 🧠 AI features, 🏠 Parent features

### Future
Migrate to **Lucide React** icons when building production mobile apps.

---

## 9. Dark Mode (Default & Only)

XceliQOS is **dark-mode only** for v1. This is a deliberate brand decision:
- Reduces eye strain during long admin sessions
- Creates visual premium feel
- Differentiates from competition (most EdTech is light-mode)

---

## CSS Variable Reference (Complete)

```css
:root {
  /* Brand Colors */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: rgba(30, 41, 59, 0.7);
  --bg-sidebar: #0b1120;
  --accent: #3b82f6;
  --accent-glow: rgba(59, 130, 246, 0.3);
  --accent-hover: #2563eb;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --purple: #8b5cf6;
  --orange: #f97316;
  --cyan: #06b6d4;

  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Borders */
  --border: rgba(148, 163, 184, 0.1);
  --border-hover: rgba(148, 163, 184, 0.2);

  /* Layout */
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  --sidebar-width: 240px;
  --topbar-height: 64px;
  --transition: all 0.2s ease;
}
```

> **Note**: These variables already exist in `index.css`. No changes needed. The brand guidelines formalize what is already implemented.
