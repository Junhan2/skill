---
title: Workflow: animate (add motion to an existing component)
impact: WORKFLOW
tags: workflow, motion, build, implementation, tool-ladder
---

# Workflow: animate

Take one component that already exists and decide, in order, whether it moves, with what tool, on
which properties, along which curve, for how long, and how it leaves. Then write it.
Entry point: `/anything-uxui:animate <component or request>`.
By junhan of select.codes.

Neighbours: `find-motion.md` finds candidates, `plan.md` writes specs for another executor,
`/anything-uxui:design` builds a screen that does not exist yet.

---

## Stance

Two ways to get this wrong, worst first.

1. **Moving something that should have stayed still.** The gate below exists so that this workflow
   can end with zero lines of animation code. That outcome is a success and gets reported as one.
2. **Moving the right thing with wrong ingredients**: `ease-in` on an entrance, a start scale below
   0.95, keyframes on a toast, a dropdown slow enough to feel like waiting.

Do not hand the user a menu of options. Decide, give the one-line reason, write the code.

## Hard rules

1. The steps run in order. Steps 1 and 2 gate the rest, so no curve gets picked before the
   component has earned the right to move at all.
2. No value is approximated. Curves, durations, and spring configs come from
   `references/26-motion-spec.md` by component row, with the underlying rule-ids from `02`, `03`,
   `04`, `06`, and `07`.
3. Extend the tokens the codebase already has. A second, parallel easing or duration scale is a
   defect, not a convenience.
4. Reduced motion and pointer gating ship in the same edit as the motion, never as a follow-up.
5. Use the cheapest tool on the ladder that does the job. A fade does not justify a dependency.

## Step 1: Should it move at all?

| Exposure | Decision |
|---|---|
| 100+ per day: keyboard shortcuts, command palette, focus moves | None. Stop here and say why |
| Tens per day: hover, list browsing, frequent toggles | Only motion short enough to pass unnoticed, or nothing |
| Occasional: modals, drawers, toasts | Standard budget |
| Rare or first run: onboarding, completion, celebration | The whole delight budget sits in this row |

A high-frequency keyboard-initiated action fails by rule (`02` Step 1). When the request lands in
that row, refuse the animation, name the exposure tier, and offer the still alternative: an instant
state swap, or a static affordance that carries the same information.

## Step 2: Name the purpose

One of: **feedback**, **spatial consistency**, **state indication**, **jarring-change bridge**,
**explanation** (marketing or onboarding only), **delight** (rare tier only). The list is closed.
Then check function: content the user is reading or aiming at does not move for decoration.

## Step 3: Pick the tool

Walk down and stop at the first row that fits.

| Need | Tool | Rule-id |
|---|---|---|
| Hover, press, colour, a state you already toggle with a class or attribute | CSS `transition` | `philosophy-transition-over-keyframe` |
| Entry on mount with no JS state to hold | CSS `@starting-style` | `component-starting-style` |
| Predetermined motion that must survive a busy main thread | CSS `@keyframes` | `perf-css-vs-js` |
| Programmatic control at CSS cost, no library | WAAPI (`element.animate()`) | `perf-waapi` |
| Springs, exits, layout changes, gesture-driven values | Motion (`motion/react`) | `perf-motion-hw`, `perf-motion-bundle` |

If the request is really for a component rather than for motion (a toast system, a drawer, a
command menu, a dropdown), stop and pick a library instead of hand-rolling one, then animate what
the library exposes. Focus handling and dismissal are where hand-rolled overlays fail.

## Step 4: Pick the properties

- Only `transform` and `opacity` (`perf-transform-opacity-only`). `clip-path` is the sanctioned
  fourth for reveals and hold-to-confirm. `height` is tolerated only for disclosures, where there
  is no transform equivalent (`component-details-accordion`).
- Entrance starts at `scale(0.95)` or higher plus `opacity: 0`, never at `scale(0)`
  (`component-no-scale-zero`).
- Trigger-anchored surfaces (popover, dropdown, menu, tooltip) scale from the trigger via
  `transform-origin` (`component-popover-origin`, `css-transform-origin`). Modals are the
  exception and stay centred.
- Translate in percentages so the distance follows the element's own size
  (`css-translate-percent`).
- In Motion, prefer the full transform string over `x`/`y`/`scale` on anything running while the
  page is busy (`perf-motion-hw`), and keep per-frame values out of React state
  (`perf-motion-values-no-rerender`).
- Do not set a variable on a parent element in order to move its children
  (`perf-css-variable-inheritance`).

## Step 5: Curve and duration, or a spring

Easing by context (`easing-decision-tree`): entering or leaving is `ease-out`, on-screen movement
is `ease-in-out`, hover and colour is `ease`, progress and time is `linear`
(`easing-linear-progress-only`). `ease-in` is banned on UI in both directions
(`easing-no-ease-in`, `exit-easing-ease-out`).

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

Durations come from the component's row in `references/26-motion-spec.md`. The ceiling is 300ms for
user-triggered UI (`timing-300ms-cap`); the named component exceptions are drawer and sheet up to 500ms
on `--ease-drawer`, and toast up to 400ms. Dropdowns and selects run 150 to 250ms. Groups stagger by
item count, 60ms or less for 1 to 5, 40ms for 6 to 10, 30ms for 11 or more, total under 400ms
(`timing-stagger-adaptive`).

Reach for a spring when the motion carries momentum, follows a gesture, can be reversed mid-flight,
or should feel physical. Default is `duration: 0.4, bounce: 0.15` (`spring-apple-style-default`),
with bounce held to 0.1 to 0.2 outside deliberately playful surfaces (`spring-bounce-subtle`).

## Step 6: Exit and interruption

- Exit runs at about 60% of its own entrance, on `ease-out` (`timing-exit-faster`,
  `exit-timing-asymmetric`).
- Exit retraces the entrance path and properties (`exit-property-symmetric`), which is what makes
  swipe-to-dismiss legible.
- Anything retriggerable before it finishes uses transitions, which retarget from wherever the
  value currently sits, instead of keyframes, which restart from the beginning
  (`component-transition-vs-keyframe`).
- Gestures use springs so velocity survives the interruption (`spring-interruptible`,
  `spring-velocity-preservation`), and a drag always has a single-pointer alternative
  (`gesture-non-drag-alternative`).
- In Motion, exits need the presence wrapper, an `exit` prop, and stable keys
  (`exit-requires-wrapper`, `exit-prop-required`, `exit-key-stable`).
- Context menus get an exit only, no entrance (`exit-no-context-menu-entrance`).
- Deliberate phases stay slow while the system response snaps, for example a hold-to-confirm at 2s
  linear releasing in 200ms (`timing-asymmetric-press`).

## Step 7: Reduced motion and pointer gating

```css
@media (prefers-reduced-motion: reduce) {
  .panel { transition: opacity 150ms var(--ease-out); transform: none; }
}

@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); }
}
```

Reduced motion means quieter, not absent (`a11y-reduced-motion`): keep the opacity and colour cues
that explain the change, drop the travel. Hover motion is always gated
(`a11y-touch-hover-gate`), and any target you touch stays at 24px or larger, 44 to 48px on touch
(`a11y-target-size-24`).

## Finish

Write the code, then report in a few lines, not a document.

- **Gate result**: the exposure tier and the named purpose. If part of the request was refused, say
  which part and which step refused it.
- **Ingredients**: tool, properties, curve, duration or spring config, one line each, with the
  `26-motion-spec.md` row they came from.
- **Feel check**: anything the code cannot settle (a crossfade, a bounce, the balance in an
  entering list). Point at `15` Debugging Methods: replay at 2x to 5x duration, step frames in the
  DevTools animation panel, test gestures on real hardware, look again the next day.
- **Then tell the user to run `/anything-uxui:audit` on the file you changed.** Motion that was
  written against these rules should come back Approve; if it does not, the audit wins.
