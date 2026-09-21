---
title: Workflow: plan template (one plan file)
impact: WORKFLOW
tags: workflow, template, handoff, plan, executor
---

# Workflow: plan template

The skeleton for a single file under `plans/`, produced by `workflows/plan.md`. Fill every heading.
By junhan of select.codes.

The reader is an executor with none of this conversation, no access to the survey, and no taste of
its own: a different agent, a cheaper model, a CLI tool, or the same user three weeks later. Every
value has to be on the page. A plan that says "the easing we picked" is a broken plan.

---

## The skeleton

````markdown
# NNN: <imperative title, one line>

- **Status**: TODO
- **Commit**: <short SHA this plan was written against>
- **Severity**: HIGH | MEDIUM | LOW
- **Group**: motion | interaction | state | appearance
- **Rule-ids**: <every id this plan enforces>
- **Scope**: <how many files, roughly how large>

## Problem

State the defect, its address, and what it costs the product. Address everything in the form
`path/to/file.tsx:123`, and paste the code as it stands today:

```css
/* src/components/dropdown.css:14, current */
.dropdown { transition: all 400ms ease-in; }
```

Name the rule each line breaks, for example `perf-transform-opacity-only` (unbounded property
list), `easing-no-ease-in` (banned curve), `timing-300ms-cap` (over the ceiling).

## Target

The finished state, with no value left to the executor's judgment. Curves, durations, media
queries, origins, all written out:

```css
/* src/components/dropdown.css:14, target */
.dropdown {
  transform-origin: var(--transform-origin);
  transition:
    transform 200ms var(--ease-out),
    opacity 200ms var(--ease-out);
}
```

Source every number: components to `references/26-motion-spec.md` by row, everything else to its
rule-id. If a token the target needs does not exist yet, the plan creates it in the file where this
repo already keeps tokens, and says which file that is.

## Conventions to match

The shape this repository already uses for a change like this, plus one exemplar to copy:

- Easing and duration tokens live in `<path>`; add new ones there, never inline.
- `<path/to/file.tsx:NN>` already does it correctly. Match its shape.

## Steps

1. <One edit per step: the file, the change, the resulting code.>
2. <Next edit.>
3. <Continue. Order matters: tokens before the components that consume them.>

## Boundaries

- Do NOT touch <files, components, or directories outside the scope above>.
- Do NOT change markup, props, or behaviour. This plan changes <motion / state handling /
  appearance> only, except where a step says otherwise.
- Do NOT add a dependency.
- If the code at a cited line no longer matches what is quoted here, the repo has moved since the
  commit stamp. STOP and report it rather than improvising a substitute.

## Verification

- **Mechanical**: `<exact command, for example pnpm typecheck && pnpm lint>`, expected to exit
  clean.
- **Rule check**: run `/anything-uxui:audit <path>` and expect Approve, with none of the rule-ids
  listed at the top of this plan appearing as findings.
- **Feel check**: open <surface>, trigger <interaction>, and confirm:
  - <what the eye should see, for example: the panel grows from the button, not from the middle>
  - <for example: firing the toggle three times in a second never restarts the motion from zero>
  - Replay at 2x to 5x duration, or at 10% in the DevTools animation panel, and confirm <detail>.
  - Switch on reduced motion in the Rendering panel and confirm the travel is gone while the
    opacity cue remains.
- **Done when**: <criterion an eye or a command can settle, with no room for opinion>.

## Commit

```
<type>(<scope>): <imperative summary, under 50 characters>
```
````

---

## Notes for whoever writes the plan

- One finding, one plan. Merge two findings only when they share the files and the identical fix,
  such as one easing token swapped across four components.
- Every number is copied, never recalled. `references/26-motion-spec.md` is the component table;
  `02`, `03`, `04`, `06`, and `07` carry the reasoning behind its values.
- Never drop the feel check. Motion can satisfy every rule on this page and still read wrong,
  so hand the executor, and whoever reviews their diff, something concrete to watch.
- Keep the steps in dependency order. A plan that edits a component before the token it references
  exists will fail halfway and leave the tree in a state nobody planned for.
- Write the boundaries as prohibitions, not preferences. They are the only thing standing between a
  narrow fix and an executor refactoring a file it was never asked to open.
