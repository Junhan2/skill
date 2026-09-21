# Changelog

## 3.1.0 (2026-09-21)

Added
- Three workflows with slash commands: `find-motion` (read-only sweep for missing motion, with a rejection gate and a required list of rejected candidates), `animate` (add motion to an existing component, gate first), `plan` (read-only codebase survey that writes self-contained plans into `plans/`).
- `references/26-motion-spec.md`: per-component values (tool, properties, easing, enter and exit duration, origin) with the source rule-id for every number, plus `eval/check-motion-spec.py` to keep the sheet in sync with the rules.
- Rule `component-no-hover-grow` (04): no hover scale-up on frequently touched elements.
- `eval/cases/`: the audit fixtures planned for 3.0.0, workflow fixtures, and the measured 3.0.0 baseline.

Changed
- `timing-300ms-cap` (02): the cap stays, with named exceptions for drawer and sheet (up to 500ms on `--ease-drawer`) and toast (up to 400ms), so the rule no longer contradicts the component examples in 04.
- Dropdown and popover moved out of the Medium tier to a per-component value of 150 to 250ms.
- Keyboard rule (02, 15, SKILL quick reference) scoped to high-frequency keyboard actions: shortcuts, command palette, focus moves. A modal opened with Enter is out of scope.
- Stagger guidance in 15 now points at the count-based table in `timing-stagger-adaptive` instead of a flat range.
- Entrance scale floor unified at 0.95 (04).
- Motion shorthand guidance in 15 and 03 aligned with `perf-motion-hw` (12).
- View Transition reduced-motion note in 05 explains why zeroing is correct there.
- Rule counts in `SKILL.md` and `README.md` re-measured: 300 rules across 24 categories.
