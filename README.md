# YARI Engine Showcase

Welcome to **YARI**, a cutting-edge spatial visual interface engine built on the absolute latest Next-Gen web development stack:
- **Next.js 16 (App Router)** with Turbopack compilation.
- **React 19 (Latest Core)** with React Compiler support.
- **Tailwind CSS v4 (CSS-First System)** with zero-legacy configuration.
- **GSAP (GreenSock) Animations** with high-performance tracking and quickSetters.
- **Framer Motion 12** with physics-based spring models.

---

## 🛠️ Stack Configuration

### 🎨 Tailwind CSS v4 (Modern CSS-First Setup)
This project utilizes the brand-new **Tailwind CSS v4** engine. Unlike older versions, **no `tailwind.config.js` or `tailwind.config.ts` is required!** 

Everything is configured natively within your CSS stylesheet:
1. **Global Styles & Variables**: Custom colors, custom fonts, animation keyframes, and neon styles are configured inside [src/app/globals.css](file:///Users/shahidshamir/Desktop/Nexage-X/src/app/globals.css) under the `@theme` block.
2. **PostCSS Rendering**: Rendered using the modern `@tailwindcss/postcss` plugin, fully configured inside [postcss.config.mjs](file:///Users/shahidshamir/Desktop/Nexage-X/postcss.config.mjs).
3. **Usage**: Simply write standard utility classes (e.g. `bg-bg-base`, `text-neon-cyan`, `glassmorphism`, `animate-float-slow`) and Tailwind v4 compiled engines build them instantly at compile time.

---

## 🚀 Running the Project

To boot up the local hot-reloaded development server:

```bash
npm run dev
```

*Note: Make sure to type **`run`** instead of `riun`!*

Open **[http://localhost:3000](http://localhost:3000)** inside your browser to interact with the high-fidelity sandbox lab.

---

## 📁 Project Architecture

- **`src/app/`**: Root layouts, pages, and global stylesheet setup.
- **`src/components/`**: Layout containers (`Navbar`, `Footer`, custom GSAP `CustomCursor`).
- **`src/components/sections/`**: Section canvases:
  - `Hero.tsx` (GSAP timelines + count-up analytics).
  - `Features.tsx` (Framer Motion 3D tilt interaction grids).
  - `InteractiveLab.tsx` (Tabbed physics sandbox, particle blast target, proximity matrices, and morphing SVG node parameters).
