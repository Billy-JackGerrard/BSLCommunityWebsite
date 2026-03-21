# Theme Contrast & Variety Fixes

**Date:** 2026-03-21
**Scope:** `src/themes.css` only — CSS variable changes, no component or layout changes.

---

## Problems Being Solved

1. **List view contrast** — Forest dark and parchment dark have insufficient luminosity difference between `--color-bg-page` and `--color-bg-card`. Cards blend into the page background.

2. **Forest dark monotony** — All tokens (page, card, inset, borders, text, gradients) use the same green family with no hue variation. Feels heavy and overbearing.

3. **Calendar cell prominence** — On rose dark and parchment light, the page/panel background draws the eye more than the calendar cells themselves. Three compounding causes: cells aren't distinct enough, the background gradient is too saturated, and the grid line borders between cells are too subtle.

---

## Changes

### 1. List view contrast — forest dark

File: `src/themes.css` — selector `:root[data-theme="forest"][data-dark]`

| Token | Before | After |
|---|---|---|
| `--color-bg-card` | `#0A2E1F` | `#103D28` |
| `--color-bg-panel-gradient` | `linear-gradient(180deg, #0a3c28 0%, #021a12 100%)` | `linear-gradient(180deg, #143e2c 0%, #021a12 100%)` |
| `--color-bg-card-gradient` | `linear-gradient(160deg, #0c4030 0%, #0a2e1f 55%)` | `linear-gradient(160deg, #0e4832 0%, #103d28 55%)` |

### 2. List view contrast — parchment dark

File: `src/themes.css` — selector `:root[data-theme="parchment"][data-dark]`

| Token | Before | After |
|---|---|---|
| `--color-bg-card` | `#24201A` | `#302820` |
| `--color-bg-panel-gradient` | `linear-gradient(180deg, #38301e 0%, #1a1612 100%)` | `linear-gradient(180deg, #463C28 0%, #1a1612 100%)` |
| `--color-bg-card-gradient` | `linear-gradient(160deg, #302818 0%, #24201a 55%)` | `linear-gradient(160deg, #3C3020 0%, #302820 55%)` |

### 3. Forest dark teal variety

File: `src/themes.css` — selector `:root[data-theme="forest"][data-dark]`

| Token | Before | After | Note |
|---|---|---|---|
| `--color-text-muted` | `#6EE7B7` | `#5EEAD4` | Green → teal |
| `--color-text-link` | `#6EE7B7` | `#5EEAD4` | Green → teal |
| `--color-hero-orb-2` | `#6EE7B7` | `#2DD4BF` | Deeper teal orb |
| `--color-accent-gradient` | `#34D399 → #6EE7B7 → #A7F3D0` | `#34D399 → #2DD4BF → #A7F3D0` | Teal midpoint |
| `--color-bg-page-gradient` | `linear-gradient(160deg, #083020 0%, #021A12 40%, #071e12 100%)` | `linear-gradient(160deg, #062e28 0%, #021A12 40%, #071e12 100%)` | Teal-green start |
| `--color-bg-panel-gradient` | `linear-gradient(180deg, #0a3c28 0%, #021a12 100%)` | `linear-gradient(180deg, #083c30 0%, #021a12 100%)` | Teal-shifted top |

Structural greens (page, card, inset, borders, accent, shadows) remain unchanged — teal appears only in expressive tokens.

### 4. Calendar cell prominence — parchment light

File: `src/themes.css` — selector `:root[data-theme="parchment"]`

| Token | Before | After | Lever |
|---|---|---|---|
| `--color-bg-card` | `#FDFBF2` | `#FAF4E2` | A — cells warmer, distinct from page |
| `--color-bg-page-gradient` | `linear-gradient(160deg, #F2EDD8 0%, #F8F4E3 50%, #e4dcb8 100%)` | `linear-gradient(160deg, #EDE7D0 0%, #F2EDD8 50%, #D9D0A8 100%)` | B — background recedes |
| `--color-bg-panel-gradient` | `linear-gradient(180deg, #f2edd8 0%, #fdfbf2 100%)` | `linear-gradient(180deg, #eae4cc 0%, #faf4e2 100%)` | B — consistent muting |
| `--color-bg-card-gradient` | `linear-gradient(160deg, #f5f0e0 0%, #fdfbf2 50%)` | `linear-gradient(160deg, #f2ece0 0%, #faf4e2 50%)` | A — card gradient matches new card |
| `--color-border` | `#CFC5A5` | `#B8AA80` | C — stronger grid lines |

### 5. Calendar cell prominence — rose dark

File: `src/themes.css` — selector `:root[data-theme="rose"][data-dark]`

| Token | Before | After | Lever |
|---|---|---|---|
| `--color-bg-card` | `#3D2232` | `#4B2A3C` | A — cells lifted |
| `--color-bg-panel-gradient` | `linear-gradient(180deg, #501e38 0%, #1a0a10 100%)` | `linear-gradient(180deg, #3d1830 0%, #1a0a10 100%)` | B — background peak reduced |
| `--color-bg-page-gradient` | `linear-gradient(160deg, #26101a 0%, #1A0A10 40%, #220e18 100%)` | `linear-gradient(160deg, #1e0d15 0%, #1A0A10 40%, #1a0b14 100%)` | B — flattened |
| `--color-bg-card-gradient` | `linear-gradient(160deg, #401830 0%, #3d2232 55%)` | `linear-gradient(160deg, #4e2438 0%, #4b2a3c 55%)` | A — gradient matches new card |
| `--color-border` | `#4C0519` | `#5C1A35` | C — more visible grid separators |

---

## Unchanged

- All other themes (azure light/dark, ember light/dark, rose light, forest light, parchment dark accent/text)
- All component CSS files
- All layout and structure
- Forest dark structural colours (page, inset, accent, shadows)

---

## Testing Checklist

- [ ] Forest dark: list view — cards visually distinct from page background
- [ ] Parchment dark: list view — cards visually distinct from page background
- [ ] Forest dark: check teal appears in muted text, links, gradients; feels peaceful not jarring
- [ ] Parchment light: calendar — cells clearly more prominent than page; grid lines visible
- [ ] Rose dark: calendar — cells clearly more prominent than page; grid lines visible
- [ ] All unchanged themes: no regressions (spot-check azure, ember, rose light, forest light)
