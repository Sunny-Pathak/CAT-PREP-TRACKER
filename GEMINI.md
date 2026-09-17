# Agent Behavioral Rules: UI Iconography & Aesthetics

## Zero-Emoji Policy
- **NEVER use raw Unicode emojis** anywhere in user interfaces, JSX components, templates, or UI strings (no `🐱`, `🐾`, `🚀`, `⚡`, `🎯`, `👑`, `🔥`, `🏆`, `🏁`, `★`, etc.).
- **ALWAYS use animated SVGs or vector icons**:
  - Prefer existing SVG components from `./src/components/AspirantIcons.jsx` or inline `<svg>` elements with precise `viewBox`, `stroke`, `fill`, and sizing props.
  - Pair icons with modern micro-animations (e.g. subtle CSS glow, pulse, float, spin, or wave) for a premium, high-tech aesthetic.
  - When rendering mascots (such as the cat companion), render them as vector SVG illustrations (e.g. `AsciiMascot`, `ComicPeekingCatBuddy`, or inline SVG characters), never raw emojis.
- When handling external or legacy strings containing emojis, pass them through `stripEmojis()` from `./src/utils/textUtils.js` or replace with appropriate SVG badge icons.

## Responsive Design & Cross-Device Compatibility Policy
- **MANDATORY MOBILE-FIRST RESPONSIVENESS FOR ALL UI CODE**:
  - Whenever creating, touching, or editing ANY visual UI code (JSX components, templates, HTML, CSS, layouts, cards, modals, navigation), it **MUST be fully responsive across mobile (<640px), tablet (640px–1024px), and desktop (>1024px)**.
  - **Exclusion**: Pure tools, algorithmic utilities, data processing functions, or non-visual backend/hard logic may ignore responsive styling rules.
- **ZERO SIDE-BY-SIDE MOBILE SQUEEZE**:
  - Header strips, hero marquees, split cards, side-by-side columns, and dashboard widgets MUST stack vertically (`flex-direction: column !important; width: 100% !important; align-items: stretch !important;`) on viewports `<= 768px` (or `<= 900px` where applicable).
  - Never allow flex child columns to share a narrow mobile row (<450px) unless explicitly intended as compact icon pills or micro tags.
- **WORD INTEGRITY & ZERO SYLLABLE BREAKS**:
  - Never allow `word-break: break-word` or `overflow-wrap: anywhere` on headings, badges, or titles.
  - Use `word-break: keep-all !important; overflow-wrap: normal !important;` paired with fluid typography (`clamp(min, vw, max)`) so words like `ASPIRANT` or `BATTLEGROUND` never get sliced into broken syllables (`ASPIRA / NT`).
- **RESET DESKTOP MIN-WIDTHS ON MOBILE**:
  - Any desktop fixed `min-width` (e.g. `min-width: 320px`, `min-width: 440px`) MUST be accompanied by a mobile reset (`min-width: 0 !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box;`) to prevent horizontal clipping and layout collision.
- **ZERO HORIZONTAL VIEWPORT OVERFLOW**:
  - The viewport document on mobile devices must never generate horizontal scrollbars or cut off right-side columns (e.g. matrices, rosters, chips). Top bars, docks, and interactive controls must gracefully collapse or scale with touch targets >= 40px.
