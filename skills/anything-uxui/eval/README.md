# Self-Eval — does the skill actually fix bad UI?

Deliberately-broken components + expected findings (rule-ids the audit MUST catch + verdict). **Pass** = ≥90% of expected rules caught, correct Block/Approve, zero fixes that break the component.

| Case (broken) | Expected rule-ids | Verdict |
|---|---|---|
| broken-button | `component-active-scale`, `easing-no-ease-in`, `a11y-target-size-24`, `perf-transform-opacity-only` (transition:all), `perf-motion-hw` | Block |
| broken-loading-state | `state-loading-aria-busy`, `state-indicator-threshold`, `state-skeleton-mirrors-layout` | Block |
| slop-landing | `distinct-no-default-font`, `distinct-no-slop-palette`, `distinct-break-scaffold`, `distinct-emoji-not-icons` | Block |
| drag-only-list | `gesture-non-drag-alternative` | Block |
| optimistic-delete-no-undo | `state-optimistic-limits` | Block |
| clean-button (control) | — | Approve |

**Run**: feed each case to `/anything-uxui:audit`, diff the found rule-ids against expected. The control case (must Approve) guards against false positives — a skill that Blocks everything is as useless as one that Approves everything.

## Files

- `cases/*.tsx`: the six fixtures above, one file each, 43 to 71 lines.
- `cases/expected.json`: the answer key, holding per case the expected verdict and rule-ids, plus a `workflows` block with the fixtures for `find-motion`, `animate` and `plan`.
- `cases/find-motion-app/`: a four-file app used by the `find-motion` and `animate` fixtures.
- `baseline-3.0.0.md`: the measured hit rate of 3.0.0, recorded before the 3.1.0 changes.

**The fixtures never name a rule-id.** Writing the expected ids into a fixture comment hands the auditor its own answer key, so the ids live only in `expected.json`. Keep it that way when adding a case.

## How to run one case

Run headlessly against a specific plugin copy, from a scratch directory so nothing in the repo is touched:

```sh
claude -p "/anything-uxui:audit <abs path>/cases/broken-button.tsx" \
  --model sonnet \
  --plugin-dir <abs path to the plugin root> \
  --add-dir <abs path>/cases --add-dir <abs path to the plugin root> \
  --output-format stream-json --verbose \
  < /dev/null > raw/broken-button.jsonl
```

- `--plugin-dir` loads the plugin from a directory for that session only. Pass it explicitly: the plugin is usually also installed as `anything-uxui@junhan-skills`, and without the flag you cannot tell which copy answered.
- `--add-dir` keeps the file reads out of the permission prompt in `-p` mode.
- `--output-format stream-json --verbose` records the tool calls. The `Read` paths in that stream are the evidence of which plugin copy actually served the run, which the prose answer alone cannot prove.
- `< /dev/null` stops the run from waiting on stdin.

Wrap the whole thing in `caffeinate -i timeout -s KILL 480`:

```sh
caffeinate -i timeout -s KILL 480 claude -p "..." ... < /dev/null > raw/case.jsonl
```

- `caffeinate -i` holds off idle sleep. If the Mac sleeps mid-run the stream stops without a `result` event, and because sleep pauses the timer, `timeout` never fires: runs were observed sitting at 29 and 35 minutes before this was added, against 70 to 100 seconds with it.
- `timeout -s KILL`, not plain `timeout`. The process did not exit on SIGTERM.
- Record wall-clock start and end per run, so a sleep gap stays visible in the log.

To check which plugin copy answered, run a command that exists in only one of them. `/anything-uxui:find-motion` exists from 3.1.0 onward, so if it resolves and reads `workflows/find-motion.md`, the newer copy is loaded.

## Scoring

A rule-id counts as a hit only when the id string appears verbatim in the output. Extra findings beyond the expected list are not misses; on the control they are acceptable only while the verdict stays Approve. Audit is read-only, so confirm it afterwards:

```sh
git status --short -- skills/anything-uxui/eval/cases   # expect no output
```
