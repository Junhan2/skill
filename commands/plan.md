---
description: Survey a codebase against the anything-uxui diagnosis map and write self-contained plans into plans/. Source is never modified.
argument-hint: <path|group (motion/interaction/state/appearance)|description, omit for whole repo>
allowed-tools: [Bash, Read, Grep, Glob, Write]
---

Survey $ARGUMENTS (if empty, the whole repository) using the **anything-uxui** skill.

1. Follow `skills/anything-uxui/workflows/plan.md`: recon, survey the four groups of `references/00-diagnosis-map.md`, verify every finding at its `file:line`, then stop and ask which findings become plans.
2. Write one plan per selected finding to `plans/NNN-<slug>.md` using `workflows/plan-template.md`, and refresh `plans/README.md`.
3. Write **only** inside `plans/`. Never create or edit a file anywhere else, and never modify source: prove it with `git status --short`.
4. Each plan must be executable by someone with zero context: exact `file:line`, exact values (cubic-bezier, ms) from `references/26-motion-spec.md`, rule-ids, ordered steps, a verification command, a suggested commit message.
