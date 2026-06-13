## Overview

TimeGreen Path Todo presents itself as a refreshing green-themed task management mini-program with a warm, organic visual identity. Every surface — from the frosted navigation bar to the pill-shaped buttons and super-rounded cards — communicates calm and approachability. The green is not just a color choice; it's the entire emotional framework: `#00b26a` reads as growth, completion, and clarity, while the `#e3f5eb` canvas feels like a soft meadow beneath the content. Cards float on gentle shadows, list itemspill out into standalone rounded islands, and each micro-interaction (pulse on complete, bounce on star, lift on drag) rewards the user with a tactile, almost playful feedback loop. The system doesn't fight for attention — it earns it through consistency, warmth, and over-engineered rounding at every layer.

**Key Characteristics:**
- Monochromatic green palette — `#00b26a` primary, `#e3f5eb` canvas — with zero competing brand colors
- Super-rounded corners (`32rpx`) applied universally: cards, buttons, inputs, popups, tabs, badges
- Pill-style tab navigation with green-gradient active fill inside white containers
- Frosted glass navigation bar (`backdrop-filter: blur(20rpx)`) with semi-transparent green background
- Rich micro-animation system: slideInUp entry, bounceIn success, pulse complete, badgeBounce star
- TDesign WeChat component library as the UI foundation, heavily customized via CSS variables
- Cards are either pure white (`#ffffff`) or green gradient (`#00b26a → #3ddaa0`), no third surface type

---

## Colors

> Source pages: all four tab pages (todo, calendar, stats, more), add-todo form, user-center, login. Token coverage is identical across all pages — the system is tightly constrained to a single green axis.

### Brand & Primary

- **Brand Green** (`{colors.brand-green}` = `#00b26a`): The entire brand. Primary buttons, active tab fills, link text, completed-state text, icon accents, toggle switches. Every "active" or "selected" moment in the system uses this exact hue.
- **Brand Green Light** (`{colors.brand-green-light}` = `#3ddaa0`): Gradient partner for `{colors.brand-green}`. Used in button gradients (`linear-gradient(135deg, #00b26a 0%, #3ddaa0 100%)`), active tab fills, weather card gradients, and decorative surfaces.
- **Brand Green Deep** (`{colors.brand-green-deep}` = `#008550`): Pressed state for primary buttons, deep text accent.
- **Brand Green Subtle** (`{colors.brand-green-subtle}` = `#e8f8f0` / `#f0fdf4`): Selected-state backgrounds, tag active backgrounds, hover fills.
- **Brand Canvas** (`{colors.canvas}` = `#e3f5eb`): The single page background color. Every page, every surface — no variation.

### Surface

- **Card White** (`{colors.card}` = `#ffffff`): Primary card and content surface.
- **Input Fill** (`{colors.input-fill}` = `#f8f8f8`): Input field backgrounds, picker fields, search bar fill.
- **Hairline** (`{colors.hairline}` = `#eee` / `#f5f5f5`): Dividers, border-lines, table row separators.

### Text

- **Ink** (`{colors.ink}` = `#2d3436`): Primary headlines and navigation titles — the darkest point in the palette.
- **Ink Secondary** (`{colors.ink-secondary}` = `#333`): Body text on white cards.
- **Charcoal** (`{colors.charcoal}` = `#666`): Secondary body, descriptions, tertiary information.
- **Stone** (`{colors.stone}` = `#999`): Placeholder text, meta labels, disabled instructions.
- **Muted** (`{colors.muted}` = `#ccc`): Dividers, footnote text, limit indicators.
- **Brand Text** (`{colors.brand-text}` = `#00b26a`): Links, completed items, brand-highlighted labels.

### Semantic

- **Success Green** (`{colors.success}` = `#07c160`): WeChat green for login buttons and success confirmations.
- **Error Red** (`{colors.error}` = `#e34d59` / `#ff4d4f`): Delete actions, error states, swipe-delete buttons.
- **Warning Orange** (`{colors.warning}` = `#ed7b2f` / `#ff9800`): Edit buttons, pending states.
- **Star Gold** (`{colors.star}` = `#fbbf24` → `#f59e0b`): Gold gradient for starred/favorited badge.
- **Info Cyan** (`{colors.info}` = `#2dd4bf`): Notice bar accent (border-left), informational badges.

### Tag Colors

Six system-preset tags map to distinct hues:

| Tag | Color | Usage |
|-----|-------|-------|
| Work | `#2196F3` | Blue — professional tasks |
| Study | `#4CAF50` | Green — learning tasks |
| Life | `#FF9800` | Orange — daily life |
| Health | `#E91E63` | Pink — health & fitness |
| Shopping | `#FF5722` | Deep orange — errands |
| Other | `#607D8B` | Blue-gray — uncategorized |

These six colors are the only non-green elements in the entire system. They appear exclusively as small dot indicators and tag badges — never as surface or text colors.

---

## Typography

### Font Family

**System native stack** — no custom font loaded:
```
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
             'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue',
             Helvetica, Arial, sans-serif;
```

The design deliberately avoids custom fonts for performance. PingFang SC (iOS) and Microsoft YaHei (Windows/Android) provide the Chinese glyph coverage.

### Hierarchy

| Token | Size | Weight | Color | Use |
|---|---|---|---|---|
| `{typography.hero}` | 72rpx | 700 | `#fff` | Temperature on weather card (largest text in the app) |
| `{typography.display}` | 50rpx | 600 | `#2d3436` | Page navigation titles |
| `{typography.heading-lg}` | 46rpx | 700 | `#2d3436` | Login page title |
| `{typography.heading}` | 40-42rpx | 600-700 | `#00b26a` / `#2e7d32` | Success messages, user nickname |
| `{typography.stat-number}` | 44-48rpx | 600 | `#2d3436` | Stat counters, completion numbers |
| `{typography.stat-number-green}` | 44rpx | 600 | `#00B26A` | Completed count in stats |
| `{typography.subheading}` | 34-36rpx | 500-600 | `#333` | Modal titles, form question labels |
| `{typography.body-lg}` | 32rpx | 400-500 | `#333` / `#666` | Combo names, dropdown items, list body |
| `{typography.body}` | 28rpx | 400 | `#666` / `#999` | Secondary body, descriptions, hints |
| `{typography.caption}` | 26rpx | 400 | `#999` | Subtle captions, helper text |
| `{typography.caption-bold}` | 26rpx | 500 | `#666` | Bold captions, labeled values |
| `{typography.tiny}` | 24rpx | 400 | `#999` | Badge text, timestamps, counts |
| `{typography.mini}` | 22rpx | 400 | `#999` | Update timestamps, role badges |
| `{typography.button}` | 32rpx | 600 | `#fff` | Primary button labels |

### Principles

- **Single size spectrum** — all sizes are `rpx`-based, scaling uniformly across devices. The entire range (22rpx–72rpx) covers every role without overlap.
- **Weight discipline:** 400 (body), 500 (medium emphasis/captions), 600 (headings/buttons), 700 (hero/emphasis). 800+ never used.
- **Green emphasis** — completed items, success messages, and brand moments use `{colors.brand-text}` (`#00b26a`) at matching weights. This is the only color shift in the typography system.
- **No letter-spacing modulation** — unlike editorial systems, this app doesn't tighten hero text or loosen body copy. Standard `0.5rpx` spacing everywhere.

---

## Layout

### Spacing System

- **Base unit**: 4rpx (8rpx primary increment).
- **Tokens**: `{spacing.xxs}` (4rpx) · `{spacing.xs}` (8rpx) · `{spacing.sm}` (16rpx) · `{spacing.md}` (24rpx) · `{spacing.lg}` (32rpx) · `{spacing.xl}` (40rpx) · `{spacing.xxl}` (60rpx).
- **Page margins**: `{spacing.md}` (24rpx) horizontal on content pages, `{spacing.lg}` (32rpx) on login/modal pages.
- **Card external margin**: `{spacing.sm}` (20rpx) — applied consistently to every card-like container.
- **Card internal padding**: `{spacing.md}` (24–30rpx) — varies slightly by card role. Feature cards tighter (24rpx), login/modal cards looser (40rpx).
- **List item internal padding**: `{spacing.xs}–{spacing.sm}` (12–20rpx) vertical, `{spacing.md}` (24rpx) horizontal.
- **Bottom safe area**: `{spacing.xxl}` (60rpx) on simple pages, up to 280–600rpx on form pages with floating buttons.

### Page Structure

```
┌─────────────────────────────────────┐
│  Frosted Nav (fixed)       50rpx   │  ← z-index: 999, backdrop-filter
├─────────────────────────────────────┤
│                                     │
│  Content area with margin-top      │  ← 168-180rpx (nav height + padding)
│  Cards separated by margin: 20rpx   │
│                                     │
├─────────────────────────────────────┤
│  Bottom safe area (padding-bottom)  │  ← varies by page role
└─────────────────────────────────────┘
```

### Whitespace Philosophy

The `#e3f5eb` canvas acts as generous breathing room between cards. No card touches another — every white container floats on the green background with 20rpx of visual separation. This card-on-canvas pattern creates a consistent "floating island" rhythm throughout the app. Inside cards, content is generously padded (24-30rpx) and never feels cramped.

---

## Elevation & Depth

### Shadow Scale

| Level | Value | Use |
|---|---|---|
| 0 (flat) | No shadow | Calendar cells, plain text areas |
| 1 (subtle) | `0 4rpx 8rpx rgba(0,0,0,0.1)` | Advertisement cards, lightweight surfaces |
| 2 (card) | `0 4rpx 12rpx rgba(0,0,0,0.06-0.08)` | Standard cards, combo cards, stats cards, tab containers |
| 3 (elevated) | `0 8rpx 20rpx rgba(0,0,0,0.08)` | Feature cards, popup dropdowns |
| 4 (heavy) | `0 8rpx 40rpx rgba(0,0,0,0.1)` | Standard card-style wrapper |
| 5 (modal) | `0 8rpx 32rpx rgba(0,0,0,0.15)` | Dropdown menus, floating panels |
| 6 (drag) | `0 20rpx 60rpx rgba(45,212,191,0.3)` | Drag-lift state — green-tinted glow |
| Button | `0 8rpx 20rpx rgba(0,178,106,0.25)` | Primary buttons — green glow signature |

### Glassmorphism

The navigation bar is the only glass element:
- Background: `#e3f5eb99` (semi-transparent canvas)
- Backdrop filter: `blur(20rpx) saturate(180%)`
- Applied via `-webkit-backdrop-filter` for iOS compatibility

Cards themselves are purely flat with shadow — no glass effect on content surfaces.

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{radius.xs}` | 12rpx | Small tags, voice tip bubbles, logged-in badge |
| `{radius.sm}` | 16rpx | Smaller card surfaces, logged-in badge alternate |
| `{radius.md}` | 22rpx | Icon containers, edit buttons |
| `{radius.lg}` | 24rpx | Edit buttons, inner popup content |
| **`{radius.xl}`** | **32rpx** | **Universal default — cards, buttons, inputs, tabs, popups, combo icons, picker fields, tag items, notice bars, every surfaced element** |
| `{radius.round}` | 50% | Avatars, color pickers, tag dots |
| `{radius.pill}` | 9999rpx / 44-50rpx | Login buttons, TInput override (`--td-button-border-radius: 32rpx`) |

**Critical insight:** `32rpx` is the universal radius. Unlike systems that tier radii for different component types, TimeGreen applies the same corner softening to nearly everything. This is the single strongest visual signature — the app's entire surface language reads as "super-rounded."

---

## Components

### Buttons

**`btn-primary`** — Green pill, the dominant action across all surfaces.
- Background `{colors.brand-green}` or `linear-gradient(135deg, #00b26a 0%, #3ddaa0 100%)`, text `#fff`, typography `{typography.button}`, weight 600, height `88rpx`, radius `{radius.pill}` (44-50rpx).
- Shadow: `0 8rpx 20rpx rgba(0,178,106,0.25)` — the green glow.
- Disabled: background `#ccc`, shadow `none`.
- After pseudo-element: `border: none` (removes WeChat default border).

**`btn-secondary`** — Light gray pill for cancel/secondary actions.
- Background `#f5f5f5`, text `#8c8c8c`, radius `40rpx`.

**`btn-swipe`** — Sliding cell action buttons.
- Edit: background `#ed7b2f`, width `110rpx`.
- Delete: background `#e34d59`, width `110rpx`.
- Approve: background `#08bd8f`.
- Reject: background `#f5f5f5`, text `#d90000`.

**`btn-wechat`** — WeChat login button (unique treatment).
- Gradient: `linear-gradient(135deg, #07c160 0%, #06ad56 56%)` — distinct from brand green.
- Height: `88rpx`, radius: `44rpx`.
- Includes WeChat icon left + "微信登录" text.

### Cards

Card Anatomy:
```
┌──────────────────────────────────┐
│  [icon/avatar]  Title    [badge] │  ← Header zone (24-32rpx padding)
│──────────────────────────────────│
│  Body content                    │  ← Body zone
│──────────────────────────────────│
│  [action]            [action]    │  ← Footer zone (optional)
└──────────────────────────────────┘
```

**`card-todo`** — The primary list item card.
- White background, `border-radius: {radius.xl}` (32rpx), `box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1)`.
- Margin: `12rpx 20rpx`, internal padding: `24rpx`.
- Contains `<t-swipe-cell>` for left-swipe actions.
- Completed state: gradient background `linear-gradient(135deg, #ecfdf5 0%, #90e0b7 100%)`, text strikethrough, title color shifts to `{colors.brand-text}`.
- Starred badge: gold gradient `linear-gradient(135deg, #fbbf24 0%, #f59e0b 0%)`, top-left fixed, `border-radius: 0 0 30rpx 0`.

**`card-combo`** — Combo/folder card.
- White background, `border-radius: {radius.xl}`, `padding: 24rpx`, `margin-bottom: 20rpx`.
- `box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06)`.
- Left: 88×88rpx icon with `{radius.xl}` rounding.
- Shared combo: `border: 4rpx solid #81c784` green outline.
- Add combo: `border: 2rpx dashed #00b26a` green dashed.

**`card-stats`** — Statistics card.
- White background, `border-radius: {radius.xl}`, `padding: 30rpx`, `margin-bottom: 20rpx`.
- `box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08)`.

**`card-weather`** — Weather summary (gradient card).
- Background: `linear-gradient(135deg, #3ddaa0 0%, #12b086 100%)`, text `#fff`.
- `border-radius: {radius.xl}`, `box-shadow: 0 12rpx 30rpx rgba(0,0,0,0.1)`, padding: `28rpx`.

**`card-modal`** — Modal/popup content.
- White background, `border-radius: {radius.xl} {radius.xl} 0 0` (bottom sheet) or `{radius.xl}` (centered).
- `box-shadow: 0 12rpx 40rpx rgba(0,0,0,0.08)`.
- Centered modals: `width: 580-620rpx`, `padding: 48rpx 40rpx`.

**Card Animation:**
- Entry: `animation: slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`
- Exit: `animation: slideOutRight 0.3s ease-out forwards`
- Todo complete: `animation: completePulse 0.5s ease-out`
- Star bounce: `animation: badgeBounce 0.4s ease-out`
- Drag lift: `transform: scale(1.03)`, shadow → `0 20rpx 60rpx rgba(45,212,191,0.3)`

### Tabs

**`tab-pill-container`** — White pill-style tab bar.
- Container: `display: flex; margin: 20rpx; background: #fff; border-radius: {radius.xl}; padding: 8rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06)`.

**`tab-pill`** — Individual pill tab.
- Inactive: `font-size: 32rpx; color: {colors.charcoal}; border-radius: {radius.xl}`.
- Active: `background: linear-gradient(135deg, #00b26a 0%, #3ddaa0 100%); color: #fff; font-weight: 500`.
- Transition: `all 0.3s ease`.

This is the signature navigation pattern: three pill tabs (All / Private / Shared) inside a white rounded container, the active tab filled with green gradient.

### Forms

**`form-question`** — Form section header with green dot.
- `font-size: 36rpx; font-weight: 500; color: {colors.ink-secondary}`.
- `padding-left: 32rpx; position: relative`.
- `::before` — 16rpx green dot `{colors.brand-green}`, `border-radius: 50%`, vertically centered left.
- Required indicator: `color: #ff0000` red asterisk.

**`form-input`** — Capsule-shaped input fields.
- Background `{colors.input-fill}`, `border-radius: {radius.xl}`, `padding: 26rpx 32rpx`.
- `margin-left: 28rpx` (aligned with form-question padding).
- TDesign custom: `--td-input-border-radius: 32rpx`.

**`form-picker`** — Capsule-shaped pickers (date, time, combo selector).
- Same styling as `form-input`: `#f8f8f8` background, `{radius.xl}` rounding, `26rpx 32rpx` padding.
- `display: flex; justify-content: space-between; align-items: center` with right chevron.

**`tag-selector`** — Tag chip grid.
- Container: `display: flex; flex-wrap: wrap; gap: 16rpx; margin-left: 28rpx`.
- Chips: `padding: 12rpx 24rpx; background: #f5f5f5; border-radius: 32rpx; font-size: 28rpx; color: #666`.
- Selected: background shifts to `rgba(0,178,106,0.15)`, border shifts to tag color.

### Badges & Status

**`badge-role`** — Member role indicator.
- `font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 8rpx`.
- Owner: `background: #fff3e0; color: #ff9800`.
- Admin: green gradient pill.
- Member: `background: #f5f5f5; color: #999`.

**`badge-star`** — Starred/favorited badge on todo items.
- Gold gradient: `linear-gradient(135deg, #fbbf24 0%, #f59e0b 0%)`.
- Position: top-left fixed, `border-radius: 0 0 30rpx 0`.
- Bounce animation on add: `badgeBounce`.

**`badge-completed`** — Completed state overlay.
- Background: `linear-gradient(135deg, #ecfdf5 0%, #90e0b7 100%)`.
- Text strikethrough, color shifts to `{colors.brand-text}`.

### Notifications & Popups

**`notice-bar`** — In-page notice announcement.
- Background: `linear-gradient(135deg, #f6ffed 0%, #e8f8f0 100%)`.
- `padding: 8rpx 24rpx; margin: 20rpx; border-radius: {radius.xl}`.
- `border-left: 6rpx solid {colors.info}` — cyan accent bar.
- `box-shadow: 0 4rpx 20rpx rgba(45,212,191,0.12)`.

**`popup-bottom-sheet`** — Bottom action sheet.
- Content: `background: #fff; border-radius: {radius.xl} {radius.xl} 0 0`.
- Header: `padding: 32rpx; border-bottom: 1rpx solid #eee`.
- Title: `{typography.subheading}`, weight 600.
- Close button: `background: #eee; border-radius: 50%`.

**`popup-centered`** — Centered dialog.
- Width: 580-700rpx, `border-radius: {radius.xl}`, `overflow: hidden`.
- Inner content: `padding: 48rpx 40rpx`.
- Dual action buttons: flex row, gap 16rpx.

### Dropdown Menu

- Fixed positioning below trigger, `left/right: 20rpx`.
- `border-radius: {radius.xl}`, `box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.15)`.
- Selected item: `color: #00b26a; font-weight: 500; background: #e8f8f0`.
- Color dot indicator: 24rpx, `border-radius: 50%`.
- Overlay: `background: rgba(0,0,0,0.3)`.
- `max-height: 60vh; overflow-y: auto`.

### Progress Bar

- Container: `height: 100%; background: #f0f0f0; border-radius: 30rpx`.
- Fill: `background: linear-gradient(90deg, #00B26A 0%, #81C784 100%)`.
- Animation: `transition: width 0.6s ease-out`.

---

## Icons

The system uses **TDesign Icons** exclusively via the `<t-icon>` component. No emoji or custom SVG icons are used in the UI. Icon names follow TDesign's naming convention.

**Icon Size Scale:** 32rpx (inline) · 40rpx (list items) · 56rpx (section icons) · 88rpx (combo icons) · 120rpx (modal feature icons)

**Key Icon References (TDesign name → purpose):**
- `check` — complete · `close` — dismiss · `add` — create · `delete` — remove
- `edit-1` — edit · `scan` — QR scan · `share` — share · `star` — favorite
- `calendar` — date · `time` — time · `location` — location · `camera` — photo
- `search` — search · `filter` — filter · `sort` — sort · `more` — more
- `user` — profile · `setting` — settings · `power` — logout · `notice` — notification
- `chevron-left` / `chevron-right` — navigation

---

## Do's and Don'ts

### Do
- Use `{colors.brand-green}` (`#00b26a`) for ALL active/selected/completed/success states — never introduce another brand color.
- Apply `{radius.xl}` (32rpx) as the default corner radius for every surfaced element. This is the single strongest visual signature.
- Keep cards on the `#e3f5eb` canvas with 20rpx separation — cards should never touch each other.
- Use the green gradient (`#00b26a → #3ddaa0`) on active tab pills, primary buttons, and gradient cards. Don't apply it to text or small elements.
- Animate card entry with `slideInUp` (0.4s, bounce-out easing) and completion with `completePulse`.

### Don't
- Don't introduce a second brand color. The system is monochromatic green — no blue accents, no purple highlights.
- Don't use corner radii smaller than 32rpx for containers. Tags (14rpx), badges (8rpx), and avatars (50%) are the only exceptions.
- Don't mix card border-radius values in the same viewport — inconsistent rounding breaks the visual language.
- Don't use shadows stronger than `0 8rpx 40rpx rgba(0,0,0,0.1)` on standard surfaces. Reserve green-tinted shadows for drag/button states only.
- Don't add glassmorphism to cards — the frosted effect is reserved exclusively for the navigation bar.
- Don't use `overflow: hidden` on card containers (unsupported in glass-easel atomic components).
- Don't use the `gap` CSS property in atomic components (unsupported in glass-easel).

---

## Responsive Behavior

### Breakpoints
WeChat mini-programs use `rpx` for uniform scaling, so no CSS breakpoints exist in the codebase. The layout adapts fluidly.

| Device | Width | Behavior |
|--------|-------|----------|
| iPhone SE | 375px | Minimum width. Single-column layout. All content responsive via rpx scaling. |
| iPhone 13 | 390px | Reference design width. All layouts appear as designed. |
| iPhone 14 Pro Max | 430px | Maximum width. Cards have more horizontal breathing room. |
| Android typical | 360-410px | Fragmented but handled by rpx uniform scaling. |

### Touch Targets
- Primary buttons: 88rpx height (~44px) — meets minimum touch target.
- Tab pills: 32rpx font + 8rpx padding → effective height ~80rpx (comfortable).
- Swipe actions: 110rpx fixed width.
- Bottom FAB: TDesign default, positioned `bottom: 32rpx; right: 32rpx`.

### Content Adaptation
- Text truncation: `text-overflow: ellipsis; white-space: nowrap` for single-line, `-webkit-line-clamp: 2` for multi-line.
- Images: `width: 100%; height: auto; display: block`.
- All dimensions in `rpx` — no `px` usage except for `border`.
- Page bottom safe area: varies from 60rpx (simple) to 600rpx (form with FAB).

---

## Interaction & Animation

### Animation Tokens

| Token | Duration | Easing | Use |
|---|---|---|---|
| `{anim.fast}` | 0.15s | `ease` | Hover states, simple transitions |
| `{anim.normal}` | 0.3s | `ease` / `ease-out` | General transitions, card state changes |
| `{anim.slow}` | 0.4-0.5s | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Card entry (bounce-out) |
| `{anim.progress}` | 0.6s | `ease-out` | Progress bar fill |

### Keyframe Library

```css
@keyframes slideInUp {
  from { transform: translateY(40rpx) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes completePulse {
  0% { transform: scale(1); background: #fff; }
  50% { transform: scale(1.02); background: linear-gradient(135deg, #ecfdf5, #90e0b7); }
  100% { transform: scale(1); }
}
@keyframes badgeBounce {
  0% { transform: scale(0) rotate(-30deg); }
  60% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes dragLift {
  to { transform: scale(1.03); box-shadow: 0 20rpx 60rpx rgba(45,212,191,0.3); }
}
@keyframes slideOutRight {
  to { transform: translateX(100%) scale(0.9); opacity: 0; }
}
@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
```

### Interaction Principles
- Tap feedback: `transform: scale(0.98)` on active cards — subtle press response.
- Drag: elevated shadow + scale(1.03) for lifted state.
- Swipe: TDesign `t-swipe-cell` with native gesture handling.
- FAB: standard TDesign `<t-fab>` with `icon` + `text` slots and drag support.
- All cards have `transition: transform 0.3s ease, box-shadow 0.3s ease`.

---

## Iteration Guide

1. Always check the existing spec before adding a new color, radius, or shadow — the system is intentionally constrained.
2. Reference component names and tokens directly (`{colors.brand-green}`, `{radius.xl}`, `{typography.body}`) rather than hardcoding values.
3. When applying `border-radius: 32rpx`, verify it's the ONLY radius used in the viewport (except for tags and avatars).
4. New cards should default to `card-todo` or `card-combo` patterns — don't invent new card archetypes without design review.
5. Animations should reference the existing keyframe library (slideInUp, completePulse, bounceIn) — don't add new animation types unless necessary.
6. All shadows should come from the shadow scale. If a new shadow level is needed, add it to the scale, not inline.
7. For atomic components (AI mode cards), apply the same radius/shadow/padding tokens as regular cards, but respect glass-easel constraints: no `gap`, no `overflow`, no animations.
8. The design system is complete when a developer can build a new page using only these tokens and component patterns — without introducing any new values.

---

## Known Gaps

- The `ui_design_spec.md` contains a `--gradient-chart` token (`linear-gradient(90deg, #00B26A 0%, #81C784 100%)`) for stats charts, but the actual ECharts implementation may use its own palette. Verify real chart colors against this token.
- Dark mode is not implemented. The system is light-mode-only, with no dark palette defined.
- The login page previously used `border-radius: 44rpx` for the WeChat button — **已修复**: 改为 `50rpx`（`{radius.pill}` 统一值）。
- Form input `margin-left: 28rpx` — **已修复**: 改为 `24rpx`（`{spacing.md}` 标准间距）。
- `{spacing.card-margin}` (20rpx) 是跨 7 个页面 28 处使用的卡片间距事实标准，不属于 8rpx 递增体系。建议正式纳入 tokens 而不改变实际值。
- 底部安全区域（padding-bottom）各页面值不同，源于各页底部操作栏/控件的差异，属于页面级配置而非系统 token。安全区域的"不一致"是合理的。
