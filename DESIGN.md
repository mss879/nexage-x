# YARI — Design System

Extracted from the existing site (homepage Hero, Services, Footer) and preserved across all
new pages. Every color, font, and motion value on new pages must trace back to this document.

## 1. Identity
- **Product**: YARI — a high-performance digital automation, e-commerce & logistics studio.
- **Audience**: visionary brands & operators who want stunning storefronts, web apps and
  end-to-end logistics.
- **Voice**: confident, technical, premium. Cinematic / Awwwards-tier marketing surface.

## 2. Direction
Dark, cinematic "cyber-atelier". Near-black canvas, a dark `#18181b` frame motif, coppery-orange
energy, condensed uppercase display type, glass panels, grain, marquees, and GSAP/3D motion.
Taste lane: **gpt-tasteskill** (cinematic, scroll-triggered). Never flat, never generic.

## 3. Color tokens
| Token | Value | Use |
|-------|-------|-----|
| `--color-bg-base` | `#050508` | Page background |
| frame | `#18181b` | Dark frame blocks, headers |
| panel | `#121212` / `#0a0a14` | Section surfaces |
| light card | `#dfdfe1` / `#F5F5F7` | Inverted light sections |
| **brand** | `#df8326` | Primary accent (orange) |
| brand deep | `#C57019` | Borders, gradient end |
| brand gradient | `#e58f37 → #b7610c` | Active pills, CTAs |
| brand shadow | `#994d00` | Deep shadow on orange |
| neon purple | `#8b5cf6` / `#c084fc` | Secondary accent (sparingly) |
| neon cyan | `#06b6d4` / `#22d3ee` | Secondary accent (sparingly) |
| text hi | `#eeeeee` / `#f3f4f6` | Primary text on dark |
| text mid | `#9E9E9E` / zinc-400 | Secondary text |
| border | `rgba(255,255,255,0.06–0.12)` | Hairlines |

CTA gradient: `linear-gradient(180deg,#df8326 0%,#C57019 100%)`. Text selection & glows use
`rgba(139,92,246,*)` and `rgba(223,131,38,*)`.

## 4. Typography
- **Display / headings**: `Syne` (medium/bold), tight tracking, often UPPERCASE.
- **Condensed display**: `Mohave` — huge uppercase, `tracking-tighter` (footer, big numerals).
- **Body**: `Plus Jakarta Sans`.
- **Labels / mono**: `font-mono` uppercase, `tracking-[0.15–0.22em]`, 11–13px.
- **Handwritten accent**: `Rock Salt` (with wobbly SVG turbulence filter) — section eyebrows.
Scale (display): clamp from ~2rem mobile → 4.2rem+ desktop; condensed hero up to `text-[8vw]`.

## 5. Primitives & states
- **Skewed "framer" button** (`.framer-m5N6O`): `skewX(-20deg)`, orange border, content
  counter-skewed; hover lift + shimmer (`.cta-btn`, `.cta-shimmer-effect`).
- **Glass panel** (`.glassmorphism`): blur(16px) + hairline border.
- **Tag badge**: pill, pulsing orange dot + mono uppercase label.
- **Cards**: chamfered / clip-path polygon shoulders, big radius (24px) frames, grain texture.
- States: every interactive element has default / hover (orange shift + lift) / focus-visible
  (orange ring) / active (scale 0.98). Sliding-text links (label slides up, orange copy follows).

## 6. Spacing & layout
`max-w-7xl` content, generous section padding (`py-24 md:py-32`), side guide hairlines,
`rounded-t-[32–56px]` stack transitions, 24px card frames with 12px outer padding.

## 7. Motion
- Engine: **GSAP** (+ `@gsap/react` `useGSAP`, `ScrollTrigger`) and Framer Motion for layout.
- Eases: `power3/power4.out` (entrances), `back.out(1.6)` (pops), `expo`/`cubic-bezier(0.16,1,0.3,1)`
  (expressive reveals). Marquees linear infinite.
- GPU-composited only: `transform / opacity / filter`. Never animate width/height/top/left.
- Reveals: text lines rise from `overflow-hidden` masks with stagger; scroll-linked parallax.
- **Always** honor `prefers-reduced-motion` via `gsap.matchMedia()`.
- Signature: GSAP + WebGL (Three.js) fullscreen menu — flowing orange/black plasma shader
  backdrop + masked line-stagger nav reveals.

## 8. Routes
`/` · `/about` · `/services` · `/services/software` · `/services/logistics` · `/blog` · `/contact`
Shared chrome: `SiteHeader` (inner pages) + `MenuOverlay` (global) + `Footer` (all pages).
New pages must use **new sections** — never copy homepage sections — at equal fidelity.
