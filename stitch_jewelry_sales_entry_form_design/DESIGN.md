---
name: Aurelian Oversight
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1c19'
  on-tertiary-container: '#858480'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e5e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#474743'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  headline-md-mobile:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for internal high-end retail management, blending the operational rigor of a sales tool with the aesthetic prestige of a luxury jewelry brand. It targets boutique owners and sales associates who require clarity, speed, and a sense of "digital craftsmanship" while managing high-value inventory.

The visual style is **Corporate Modern with Minimalist influences**. It prioritizes high-contrast legibility, generous whitespace to reduce cognitive load during data entry, and a sophisticated material palette that mirrors physical jewelry displays—velvet-deep tones, metallic accents, and pristine editorial surfaces. The emotional response is one of calm authority, precision, and exclusivity.

## Colors
The palette is built on a foundation of **Deep Navy (Charcoal-tinted)** and **Champagne Gold**.

- **Primary:** A dense, authoritative navy used for typography, primary navigation, and high-priority UI borders.
- **Secondary (Accent):** A refined champagne gold used sparingly for calls-to-action, success states, and subtle decorative accents to signify luxury.
- **Surface:** The background utilizes a warm, off-white "Paper" tone to reduce eye strain compared to pure white, maintaining a premium editorial feel.
- **Status:** Functional colors (Red for "Urgent/Cancelled", Green for "Shipped/Paid") are desaturated and lean towards jewel tones (Ruby, Emerald) to remain cohesive with the brand.

## Typography
The typography system uses a dual-font strategy to balance elegance with utility.

- **Headlines (Noto Serif):** Brings a classic, literary authority to the interface. Use for page titles, section headers, and high-level metrics.
- **Body & Data (Manrope):** A modern, technical grotesque that ensures maximum legibility for SKU numbers, price points, and customer addresses. It remains highly readable at small sizes on mobile devices.
- **Labels:** All form labels and table headers should use `label-caps` for a structured, architectural feel that distinguishes metadata from user content.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to ensure that wide data tables do not become unreadable, while transitioning to a **Fluid Single-Column** layout on mobile for ease of data entry.

- **Desktop:** 12-column grid with a 1440px max-width.
- **Spacing Rhythm:** Based on an 8px scale. Use 16px (4 units) for standard padding and 32px (8 units) for section spacing.
- **Mobile Reflow:** In the sales tracking tool, tables should transform into "Card Lists" on mobile. Each row of the table becomes a card with labeled key-value pairs to avoid horizontal scrolling.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surfaces:** Use subtle shifts in background color (e.g., from `tertiary` to pure white) to define content containers.
- **Outlines:** Use 1px solid strokes in a light-grey navy (#E2E8F0) for input fields and table cells.
- **Elevation:** Reserved exclusively for floating action buttons (FABs) or dropdown menus, using a very soft, highly diffused 10% opacity shadow with no vertical offset (Ambient Glow).

## Shapes
This design system uses a **Soft (0.25rem)** roundedness level. This keeps the interface feeling "crisp" and professional, echoing the faceted cuts of gemstones. Avoid pill-shaped buttons unless used for status chips; primary buttons and inputs should maintain a disciplined, architectural corner.

## Components
- **Primary Buttons:** Solid Navy background with Gold or White text. 48px height for touch-target safety on mobile.
- **Input Fields:** 1px border with a floating label pattern. On focus, the border transitions to Gold. Ensure the font size is at least 16px on mobile to prevent iOS "zoom-on-focus."
- **Data Tables:** High-density with 1px horizontal dividers. Use the `label-caps` style for headers. Alternating row colors (zebra striping) is discouraged; use hover states instead.
- **Status Chips:** Small, rectangular tags with light background tints and darker text (e.g., "Shipped" in dark emerald on a light mint background).
- **Sales Summary Cards:** Prominent Noto Serif figures for "Net Profit" or "Total Sales," placed at the top of the dashboard for immediate visibility.