---
title: Motion Spec Sheet (copy these values)
impact: CRITICAL
tags: motion, spec, duration, easing, transform-origin, reference
---

# Motion Spec Sheet

The settled value for every component that moves. Do not approximate, and do not re-derive a
duration from the tier table: copy the row. Every value here is already carried by a rule in
`02`, `03`, `04`, `05`, `06` or `07`, and the last column names it.
By junhan of select.codes.

---

## How to read this sheet

- **Tool** is the first tool on the escalation path that can do the job: CSS transition, then
  `@starting-style`, then CSS animation, then WAAPI, then Motion. Never start at Motion.
- **Motion** means the library imported from `motion/react` (formerly Framer Motion). The old
  name is not used in this plugin.
- **Enter / Exit** are the animation durations, not the time the component stays on screen.
  Exit is about 60% of enter wherever the component leaves the screen (→ `timing-exit-faster`).
- **Start value** is what the element animates from. Nothing enters from `scale(0)`, and the
  entrance scale floor is `scale(0.95)` (→ `component-no-scale-zero`).
- A cell reading `n/a` means the row has no such phase, not that the value is open.

---

## Component values

| Component | Tool | Properties | Start value | Easing | Enter | Exit | transform-origin | Source |
|---|---|---|---|---|---|---|---|---|
| Press feedback | CSS transition | `transform` | `scale(0.97)` on `:active` | `var(--ease-out)` | 160ms | 160ms (release, same transition) | default (center) | `component-active-scale`, `easing-custom-curves` |
| Dropdown / popover | CSS transition + `@starting-style` | `opacity`, `transform` | `scale(0.95)`, opacity 0 | `var(--ease-out)` | 200ms | 120ms | `var(--transform-origin)` (Base UI), `var(--radix-popover-content-transform-origin)` (Radix) | `timing-duration-tiers`, `component-popover-origin`, `component-no-scale-zero`, `component-starting-style` |
| Tooltip | CSS transition | `opacity`, `transform` | `scale(0.97)`, opacity 0 | `var(--ease-out)` | 125ms | 80ms | `var(--transform-origin)` (trigger) | `component-tooltip-skip-delay`, `timing-duration-tiers`, `timing-exit-faster` |
| Modal / dialog | CSS transition + `@starting-style`, or Motion with `AnimatePresence` | `opacity`, `transform` | `scale(0.95)`, opacity 0 | `var(--ease-out)` | 250ms | 150ms | center (the one component that is not trigger anchored) | `timing-exit-faster`, `timing-duration-tiers`, `component-popover-origin`, `component-no-scale-zero` |
| Drawer / sheet | CSS transition, Motion only for the drag | `transform` (panel), `transform` + `border-radius` (background at `scale(0.95)`) | `translateY(100%)` | `var(--ease-drawer)` | 500ms | 300ms | n/a (edge anchored) | `component-drawer-scaled-background`, `timing-300ms-cap`, `css-translate-percent` |
| Toast | CSS transition + `@starting-style` | `opacity`, `transform` | `translateY(100%)`, opacity 0 | `ease` | 400ms | 240ms | edge of screen | `component-starting-style`, `timing-300ms-cap`, `component-transition-vs-keyframe` |
| Accordion / disclosure | CSS transition on `::details-content` | `opacity`, `block-size`, `content-visibility` with `allow-discrete` (`interpolate-size: allow-keywords`, grid `0fr`→`1fr` fallback) | `block-size: 0`, opacity 0 | `var(--ease-out)` | 200ms | 120ms | n/a (size, not scale) | `component-details-accordion`, `timing-exit-faster` |
| Stagger (list entrance) | CSS animation + `animation-delay` (or `sibling-index()`) | `opacity`, `transform` | `translateY(8px)`, opacity 0 | `var(--ease-out)` | 300ms per item; delay 60ms for 1 to 5 items, 40ms for 6 to 10, 30ms for 11+, total ≤400ms | n/a (the list exits under its own rule) | n/a | `timing-stagger-adaptive`, `component-stagger`, `component-stagger-sibling-index` |
| Hold to confirm | CSS transition on `clip-path` | `clip-path` on an overlay, `transform` on the button | `inset(0 100% 0 0)`, `scale(0.97)` while held | `linear` while holding, `var(--ease-out)` on release | 2s (the hold) | 200ms (snap back on release) | n/a | `css-clip-path-hold-to-delete`, `timing-asymmetric-press` |
| Tab indicator | CSS transition (or a shared `view-transition-name`) | `transform` | current indicator position (it never enters from nothing) | `var(--ease-in-out)` | 150ms | n/a (the indicator persists) | n/a | `timing-duration-tiers`, `easing-decision-tree`, `easing-custom-curves` |
| Scroll reveal | CSS animation + `animation-timeline: view()`, IntersectionObserver fallback | `opacity`, `transform` (or `clip-path`) | `translateY(20px)`, opacity 0 | `linear` (scroll linked), fallback `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | scroll range `entry 0%` to `entry 100%`; fallback 0.8s | n/a (reveal once) | n/a | `css-view-timeline`, `css-scroll-timeline`, `css-clip-path-scroll-reveal` |
| Swipe to dismiss | Motion (`drag` + spring) | `transform`, `opacity` | current drag position, release velocity preserved | spring `duration: 0.4, bounce: 0.15` | n/a (the drag follows the pointer) | spring; dismiss at `velocity > 0.11` or past the distance threshold | n/a | `gesture-momentum-dismiss`, `spring-velocity-preservation`, `spring-apple-style-default` |

Notes that do not fit a cell:

- **Dropdown / popover** sits in a 150–250ms band. 200ms is the value to use unless the panel is
  unusually large or small (→ `timing-duration-tiers`).
- **Tooltip** drops to 0ms, entrance and exit both, while an adjacent tooltip is already open
  (`data-instant`) (→ `component-tooltip-skip-delay`).
- **Drawer / sheet** and **toast** are the two named exceptions to the 300ms cap. Nothing else
  crosses it (→ `timing-300ms-cap`).
- **Tab indicator** moves, the panel content does not. Tab switching carries no spatial
  expectation, so the panel swaps instantly (→ `02-animation-timing` step 1).
- **Swipe to dismiss** and the drawer drag are the only rows where a spring belongs. Everything
  else is duration based (→ `03-spring-physics`).

---

## Shared curves and the default spring

| Token | Value | Source |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | `easing-custom-curves` |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | `easing-custom-curves` |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | `easing-custom-curves` |
| `SPRING_DEFAULT` | `{ type: "spring", duration: 0.4, bounce: 0.15 }`, physics form `stiffness: 400, damping: 25` | `spring-apple-style-default`, `spring-bounce-subtle` |

`--ease-out` is the default for anything not covered by a row above. `--ease-in-out` is only for
an element moving across the screen while staying visible. `--ease-drawer` is only for the drawer
and sheet family (→ `easing-decision-tree`).

---

## Before you copy a row

1. Check whether the component should animate at all. Anything a user triggers 100+ times a day,
   by shortcut or command palette or focus move, gets no animation and no row from this sheet
   (→ `02-animation-timing` step 1).
2. Check `prefers-reduced-motion`. Reduce rather than remove: keep opacity and color, drop the
   movement. Page and view transitions are the exception and switch off entirely
   (→ `14-accessibility`, `css-view-transition-loading-mask`).
3. Gate hover motion behind `@media (hover: hover) and (pointer: fine)`, and keep hover scale-up
   off anything frequently touched (→ `component-no-hover-grow`).

---

*Produced by junhan of select.codes*
