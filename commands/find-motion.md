---
description: Sweep a UI for places that should move but don't, gate every candidate hard, and report the survivors plus the rejections. Read-only.
argument-hint: <file|dir path, omit for the whole UI surface>
allowed-tools: [Bash, Read, Grep, Glob]
---

Sweep the target at $ARGUMENTS (if empty, the whole interactive surface) using the **anything-uxui** skill.

1. Follow `skills/anything-uxui/workflows/find-motion.md` exactly: stance, hard rules, the four-question gate, the seam table, the four-step procedure, the required three-part output.
2. Take every value from `references/26-motion-spec.md` by component row, and cite the rule-ids behind it from `02`, `03`, `04`, `06`, `07`.
3. Cap the report at 5–7 suggestions for an app, fewer for one view, and include the REQUIRED rejected-candidates section (2–5 entries, each naming the gate question that killed it).

Read-only: do NOT modify any files. Close by pointing the user at `/anything-uxui:plan <suggestion>`.
