# Griffin interaction refinement

Inspired by the supplied Ramp design notes dated September 30, 2026. Preserve the current editorial typography, brand assets, compact mastheads and page structure.

## Applied
- Griffin red actions, black mastheads, gold radar details and white/warm neutral surfaces.
- Translucent sticky desktop navigation; natural scrolling navigation on narrower screens.
- Once-only section and card reveals, using IntersectionObserver and the Web Animations API. Content remains visible without JavaScript.
- Responsive input feedback and a ratio-orbit marker driven by the actual simplified ratio (decorative angle caps at 2×; displayed numeric result remains exact).
- Short opacity feedback on recalculated results; values update immediately.
- Fine dot-grid texture, restrained card elevation and directional link movement.
- Radar motion pauses outside the viewport. Reduced-motion preferences disable positional motion and ongoing radar animation.

## Validation
`npm run check`: lint, shared spacing tokens, TypeScript, 64 unit tests and production build passed.
Browser verification could not run in this environment: the Chromium download returned an invalid archive. Visual, responsive and accessibility browser checks remain pending before merge.

No calculation formulas, financing assumptions, contact destinations, disclosures or brand assets changed. No new animation dependency or artificial live activity counters.
