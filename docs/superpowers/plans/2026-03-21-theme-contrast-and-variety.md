# Theme Contrast & Variety Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix list-view contrast in forest dark and parchment dark, introduce teal variety into forest dark, and make calendar cells visually dominant over the page background in parchment light and rose dark.

**Architecture:** All changes are CSS custom property value edits in `src/themes.css`. No component or layout changes. Changes are grouped by theme selector so each commit is a clean, isolated diff. There are no automated tests for CSS variables — verification is visual, done in the browser by switching themes.

**Tech Stack:** CSS custom properties, Vite dev server (`npm run dev`)

---

## File Map

| File | Role |
|---|---|
| `src/themes.css` | Single file for all changes — 5 selector blocks touched |

**Selectors touched:**
1. `:root[data-theme="forest"][data-dark]` — contrast lift + teal variety (Tasks 1 + 2)
2. `:root[data-theme="parchment"][data-dark]` — contrast lift (Task 3)
3. `:root[data-theme="parchment"]` — calendar cell prominence (Task 4)
4. `:root[data-theme="rose"][data-dark]` — calendar cell prominence (Task 5)

---

## Reference: How themes.css is structured

Each theme has a light selector `[data-theme="name"]` and dark selector `[data-theme="name"][data-dark]`. The azure theme uses bare `:root` / `:root[data-dark]` instead. Token names are self-describing (`--color-bg-card`, `--color-bg-panel-gradient`, etc.).

To switch themes in the browser: use the theme picker in the app UI. Dark mode toggle is also in the UI.

---

## Task 1: Forest dark — list contrast lift

**Files:**
- Modify: `src/themes.css` — selector `:root[data-theme="forest"][data-dark]`

- [ ] **Step 1: Update `--color-bg-card`**

Find in the forest dark selector (`[data-theme="forest"][data-dark]`):
```css
--color-bg-card:    #0A2E1F;
```
Replace with:
```css
--color-bg-card:    #103D28;
```

- [ ] **Step 2: Update `--color-bg-card-gradient`**

Find in the same selector:
```css
--color-bg-card-gradient:  linear-gradient(160deg, #0c4030 0%, #0a2e1f 55%);
```
Replace with:
```css
--color-bg-card-gradient:  linear-gradient(160deg, #0e4832 0%, #103d28 55%);
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Switch to Forest Dark theme. Go to the List view. Cards should now be noticeably lighter than the page background.

- [ ] **Step 4: Commit**

```bash
git add src/themes.css
git commit -m "style: lift forest dark card contrast for list view"
```

---

## Task 2: Forest dark — teal variety

**Files:**
- Modify: `src/themes.css` — selector `:root[data-theme="forest"][data-dark]`

Note: `--color-bg-panel-gradient` is updated here — this also satisfies the contrast lift for that token (the teal-shifted value `#083c30` is both lighter than the original `#0a3c28` and teal-shifted).

- [ ] **Step 1: Update muted text, link, and CTA text**

Find and replace these three tokens in the forest dark selector:
```css
--color-text-muted:   #6EE7B7;
```
→
```css
--color-text-muted:   #5EEAD4;
```

```css
--color-text-link:    #6EE7B7;
```
→
```css
--color-text-link:    #5EEAD4;
```

```css
--color-cta-text:            #6EE7B7;
```
→
```css
--color-cta-text:            #5EEAD4;
```

- [ ] **Step 2: Update surface-raised RGBA**

Find:
```css
--color-bg-surface-raised:     rgba(110, 231, 183, 0.08);
```
Replace with:
```css
--color-bg-surface-raised:     rgba(94, 234, 212, 0.08);
```
(This is the RGBA equivalent of `#6EE7B7` → `#5EEAD4`.)

- [ ] **Step 3: Update hero orb 2**

Find:
```css
--color-hero-orb-2:          #6EE7B7;
```
Replace with:
```css
--color-hero-orb-2:          #2DD4BF;
```

- [ ] **Step 4: Update accent gradient**

Find:
```css
--color-accent-gradient: linear-gradient(135deg, #34D399 0%, #6EE7B7 50%, #A7F3D0 100%);
```
Replace with:
```css
--color-accent-gradient: linear-gradient(135deg, #34D399 0%, #2DD4BF 50%, #A7F3D0 100%);
```

- [ ] **Step 5: Update page gradient**

Find:
```css
--color-bg-page-gradient: linear-gradient(160deg, #083020 0%, #021A12 40%, #071e12 100%);
```
Replace with:
```css
--color-bg-page-gradient: linear-gradient(160deg, #062e28 0%, #021A12 40%, #071e12 100%);
```

- [ ] **Step 6: Update panel gradient**

Find:
```css
--color-bg-panel-gradient: linear-gradient(180deg, #0a3c28 0%, #021a12 100%);
```
Replace with:
```css
--color-bg-panel-gradient: linear-gradient(180deg, #083c30 0%, #021a12 100%);
```

- [ ] **Step 7: Verify visually**

Still in Forest Dark theme. Check:
- Muted text and links have a teal tone (not pure green)
- List view panel gradient feels receded relative to cards
- Hero page orbs include a teal/turquoise variation (orb-1 remains green by design — only orb-2 shifts to teal)
- Overall feel is peaceful, not heavy — green structural, teal expressive

- [ ] **Step 8: Commit**

```bash
git add src/themes.css
git commit -m "style: add teal variety to forest dark theme"
```

---

## Task 3: Parchment dark — list contrast lift

**Files:**
- Modify: `src/themes.css` — selector `:root[data-theme="parchment"][data-dark]`

- [ ] **Step 1: Update `--color-bg-card`**

Find in the parchment dark selector (`[data-theme="parchment"][data-dark]`):
```css
--color-bg-card:    #24201A;
```
Replace with:
```css
--color-bg-card:    #302820;
```

- [ ] **Step 2: Update `--color-bg-panel-gradient`**

Find:
```css
--color-bg-panel-gradient: linear-gradient(180deg, #38301e 0%, #1a1612 100%);
```
Replace with:
```css
--color-bg-panel-gradient: linear-gradient(180deg, #463C28 0%, #1a1612 100%);
```

- [ ] **Step 3: Update `--color-bg-card-gradient`**

Find:
```css
--color-bg-card-gradient:  linear-gradient(160deg, #302818 0%, #24201a 55%);
```
Replace with:
```css
--color-bg-card-gradient:  linear-gradient(160deg, #3C3020 0%, #302820 55%);
```

- [ ] **Step 4: Verify visually**

Switch to Parchment Dark theme. Go to List view. Cards should be clearly distinct from the warm-dark page background.

- [ ] **Step 5: Commit**

```bash
git add src/themes.css
git commit -m "style: lift parchment dark card contrast for list view"
```

---

## Task 4: Parchment light — calendar cell prominence

**Files:**
- Modify: `src/themes.css` — selector `:root[data-theme="parchment"]`

- [ ] **Step 1: Lift the card background (Lever A)**

Find in the parchment light selector (`[data-theme="parchment"]` — the one *without* `[data-dark]`):
```css
--color-bg-card:    #FDFBF2;
```
Replace with:
```css
--color-bg-card:    #FAF4E2;
```

- [ ] **Step 2: Update card gradient to match (Lever A)**

Find:
```css
--color-bg-card-gradient:  linear-gradient(160deg, #f5f0e0 0%, #fdfbf2 50%);
```
Replace with:
```css
--color-bg-card-gradient:  linear-gradient(160deg, #f2ece0 0%, #faf4e2 50%);
```

- [ ] **Step 3: Tone down page gradient (Lever B)**

Find:
```css
--color-bg-page-gradient: linear-gradient(160deg, #F2EDD8 0%, #F8F4E3 50%, #e4dcb8 100%);
```
Replace with:
```css
--color-bg-page-gradient: linear-gradient(160deg, #EDE7D0 0%, #F2EDD8 50%, #D9D0A8 100%);
```

- [ ] **Step 4: Tone down panel gradient (Lever B)**

Find:
```css
--color-bg-panel-gradient: linear-gradient(180deg, #f2edd8 0%, #fdfbf2 100%);
```
Replace with:
```css
--color-bg-panel-gradient: linear-gradient(180deg, #eae4cc 0%, #faf4e2 100%);
```

- [ ] **Step 5: Strengthen border for calendar grid lines (Lever C)**

Find:
```css
--color-border:        #CFC5A5;
```
Replace with:
```css
--color-border:        #B8AA80;
```

- [ ] **Step 6: Verify visually**

Switch to Parchment Light theme. Go to Calendar view. Check:
- Calendar cells are clearly more prominent than the page background
- Grid lines (1px gaps between cells) are visibly defined
- Empty/weekend cells (inset-coloured) still look distinct from regular cells
- List view still looks good (border change affects all borders site-wide for this theme)

- [ ] **Step 7: Commit**

```bash
git add src/themes.css
git commit -m "style: improve calendar cell prominence in parchment light"
```

---

## Task 5: Rose dark — calendar cell prominence

**Files:**
- Modify: `src/themes.css` — selector `:root[data-theme="rose"][data-dark]`

- [ ] **Step 1: Lift the card background (Lever A)**

Find in the rose dark selector (`[data-theme="rose"][data-dark]`):
```css
--color-bg-card:    #3D2232;
```
Replace with:
```css
--color-bg-card:    #4B2A3C;
```

- [ ] **Step 2: Update card gradient to match (Lever A)**

Find:
```css
--color-bg-card-gradient:  linear-gradient(160deg, #401830 0%, #3d2232 55%);
```
Replace with:
```css
--color-bg-card-gradient:  linear-gradient(160deg, #4e2438 0%, #4b2a3c 55%);
```

- [ ] **Step 3: Reduce panel gradient peak (Lever B)**

Find:
```css
--color-bg-panel-gradient: linear-gradient(180deg, #501e38 0%, #1a0a10 100%);
```
Replace with:
```css
--color-bg-panel-gradient: linear-gradient(180deg, #3d1830 0%, #1a0a10 100%);
```

- [ ] **Step 4: Flatten page gradient (Lever B)**

Find:
```css
--color-bg-page-gradient: linear-gradient(160deg, #26101a 0%, #1A0A10 40%, #220e18 100%);
```
Replace with:
```css
--color-bg-page-gradient: linear-gradient(160deg, #1e0d15 0%, #1A0A10 40%, #1a0b14 100%);
```

- [ ] **Step 5: Strengthen border for calendar grid lines (Lever C)**

Find:
```css
--color-border:        #4C0519;
```
Replace with:
```css
--color-border:        #5C1A35;
```

- [ ] **Step 6: Verify visually**

Switch to Rose Dark theme. Go to Calendar view. Check:
- Calendar cells are clearly more prominent than the page background
- Grid lines between cells are visibly defined
- List view cards still look good (border change affects all borders for this theme)

- [ ] **Step 7: Commit**

```bash
git add src/themes.css
git commit -m "style: improve calendar cell prominence in rose dark"
```

---

## Final Verification

- [ ] Spot-check all unchanged themes: Azure light, Azure dark, Rose light, Forest light — confirm no regressions. Note: Ember light/dark has a pre-existing known issue (card invisible against page) — skip Ember or treat any Ember issues as pre-existing, not regressions from this work.
- [ ] Run `npm run build` to confirm no build errors
