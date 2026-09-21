---
description: Add motion to an existing component: gate it first, then pick tool, properties, curve and duration from the anything-uxui spec.
argument-hint: <component path or what to animate>
allowed-tools: [Bash, Read, Grep, Glob, Edit, Write]
---

Animate $ARGUMENTS using the **anything-uxui** skill.

1. Follow `skills/anything-uxui/workflows/animate.md` in order. Steps 1–2 are a gate: a high-frequency or keyboard-initiated action ends with **zero lines of animation code** plus the reason, and that is a correct result.
2. Walk the tool ladder (CSS transition → `@starting-style` → CSS keyframes → WAAPI → Motion) and stop at the first rung that works.
3. Pull every curve, duration and spring config from `references/26-motion-spec.md` by component row. Ship reduced-motion and hover gating in the same edit.
4. Report the gate result, the ingredients, and whatever needs a feel check.

Finish by telling the user to run `/anything-uxui:audit` on what you changed.
