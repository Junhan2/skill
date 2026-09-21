# Results: anything-uxui 3.1.0

**Date**: 2026-09-21
**Plugin under test**: the `feat/unified-3.1` working tree at `/Users/leegangjoon2/Desktop/anything-uxui-src`, `plugin.json` version 3.1.0
**Model**: `sonnet`
**Compare against**: `baseline-3.0.0.md` (14/14, 6/6 verdicts)

---

## Headline

| Measure | 3.0.0 baseline | 3.1.0 |
|---|---|---|
| Hit rate, original answer key (14 ids) | 14/14 = 100% | **14/14 = 100%** |
| Hit rate, 3.1.0 answer key (15 ids) | not applicable | **14/15 = 93.3%** |
| Verdicts correct | 6/6 | **6/6** |
| Control verdict | Approve | **Approve** |

The one miss is the rule added in 3.1.0, `component-no-hover-grow`. The audit diagnosed the behaviour correctly and told the user to delete the hover scale-up, but cited other rule-ids for it. See the defect below.

---

## Isolation: which copy of the plugin ran

A plugin of the same name is installed globally as `anything-uxui@junhan-skills` (3.0.0 in the cache), so `/anything-uxui:audit` resolves with or without `--plugin-dir` and the answer text alone cannot say which copy served it.

**What actually happens**: passing `--plugin-dir /Users/leegangjoon2/Desktop/anything-uxui-src` loads the working tree copy, and it wins. No settings override, no `--safe-mode` and no `--bare` was needed, and nothing under `~/.claude` was touched.

**The discriminator**: `/anything-uxui:find-motion` is a command that exists only in 3.1.0. It resolved, and the stream-json tool calls show it reading

```
/Users/leegangjoon2/Desktop/anything-uxui-src/skills/anything-uxui/workflows/find-motion.md
/Users/leegangjoon2/Desktop/anything-uxui-src/skills/anything-uxui/references/26-motion-spec.md
```

Neither `workflows/` nor `26-motion-spec.md` exists in the 3.0.0 cache, so the working tree copy is the one that loaded.

**Confirmed per run**: across all six audit runs, every reference file read resolved under `…/anything-uxui-src/skills/anything-uxui/references/`. A scan of all six streams for a `plugins/cache/...anything-uxui` path returned exactly one hit, and it is not a reference read: it is the fragment `ls ~/.claude/plugins/cache | head` inside a Bash command the `slop-landing` run used while locating the diagnosis map. No rule text was read from the 3.0.0 cache. Positive control: the same scan over the stored 3.0.0 baseline runs returns 29 hits, so the scan does detect cache paths when they are there.

---

## Exact commands

```sh
SCRATCH=<scratch dir>
CASES="$SCRATCH/isolated-cases"     # the 6 fixtures, copied outside the repo
TREE=/Users/leegangjoon2/Desktop/anything-uxui-src

caffeinate -i timeout -s KILL 480 claude -p "/anything-uxui:audit $CASES/$name.tsx" \
  --model sonnet \
  --plugin-dir "$TREE" \
  --add-dir "$CASES" --add-dir "$TREE" \
  --output-format stream-json --verbose \
  < /dev/null > "$SCRATCH/raw31/$name.jsonl" 2> "$SCRATCH/raw31/$name.err"
```

Two runner details that matter, both learned the hard way:

- **`caffeinate -i` is required.** Two earlier runs were destroyed by the Mac going to idle sleep mid-run. Sleep pauses the `timeout` timer as well, so a run showed 29 and 35 minutes of elapsed time while `timeout 480` never fired, and the stream ended mid-thinking with no `result` event. With `caffeinate -i` the same runs take 70 to 97 seconds.
- **`timeout -s KILL`**, not plain `timeout`. Plain `timeout` sends SIGTERM and the process did not exit on it.

Wall clock per run, from the runner's own log: 89s, 97s, 76s, 92s, 70s, 91s. Six audits in 4m40s, two at a time.

---

## Audit cases, 3.1.0 vs baseline

| Case | Expected | Hit | Missed | Verdict | Baseline | Runtime |
|---|---|---|---|---|---|---|
| broken-button | 6 | 5 | `component-no-hover-grow` | Block ✓ | 5/5 Block | 89s |
| broken-loading-state | 3 | 3 | none | Block ✓ | 3/3 Block | 97s |
| slop-landing | 4 | 4 | none | Block ✓ | 4/4 Block | 76s |
| drag-only-list | 1 | 1 | none | Block ✓ | 1/1 Block | 92s |
| optimistic-delete-no-undo | 1 | 1 | none | Block ✓ | 1/1 Block | 70s |
| clean-button (control) | 0 | n/a | n/a | **Approve ✓** | Approve | 91s |
| **Total** | **15** | **14** | **1** | **6/6** | **14/14** | **4m40s** |

**On the answer key change.** `component-no-hover-grow` was added to `expected.json` for `broken-button` as part of this pass, because 3.1.0 introduces the rule at `references/04-component-patterns.md:40` and the fixture has violated it since it was written (`whileHover={{ scale: 1.05 }}` at line 56, on a Save button, unchanged for this run). Scored on the original 14-id key, 3.1.0 gets **14/14, identical to baseline**. Scored on the new 15-id key it gets **14/15**. Both numbers are given above so the comparison stays honest in either direction.

### Verdict lines

- **broken-button**, Block: "대상 파일에서 발견한 문제는 10건이고, 그중 느낌을 깨는 항목(`ease-in`, 호버 확대, 누름 피드백 없음, 저장 실패 시 버튼 고착)이 4건입니다."
- **broken-loading-state**, Block: "200ms짜리 캐시 응답에 스켈레톤이 깜빡이고, 실패하면 영원히 로딩만 돕니다."
- **slop-landing**, Block: "슬롭 지표 8개가 모두 나오고, 접근성 실패 1건과 누락 1건이 있습니다."
- **drag-only-list**, Block, citing `gesture-non-drag-alternative`.
- **optimistic-delete-no-undo**, Block: "되돌릴 수 없는 금전 기록 삭제에 낙관적 UI를 쓰고 있고, 실패를 사용자에게 알리지 않습니다."
- **clean-button (control)**, **Approve**: "막을 만한 결함은 없고, 비차단 지적 2건이 있습니다." It cited `26-motion-spec` approvingly, so the new spec sheet is reachable from the audit path.

---

## Defect 1: the new rule is not routed from the diagnosis map

**Where**: `skills/anything-uxui/references/00-diagnosis-map.md`
**What is wrong**: `component-no-hover-grow` is defined at `references/04-component-patterns.md:40` and cited by `recipes/recipe-button.md:7` and `:13`, but **no row of the diagnosis map points to it**. Grepping the map for `component-` returns only `component-active-scale` and `component-no-scale-zero`. The only hover row in the map is line 41, `hover-only reveal on touch`, which routes to `a11y-touch-hover-gate`, a different rule about touch gating.

**Why it matters**: `commands/audit.md` instructs the audit to "Start from the skill's `references/00-diagnosis-map.md` and match each symptom you see in the code to its rule-ids." A rule absent from the map is not reached by that path.

**Measured consequence**: on `broken-button` the audit found the hover scale-up and gave the right fix, but attributed it to the wrong ids:

> `:56` `whileHover={{ scale: 1.05 }}` → 삭제. 호버는 `:22`의 색 변화로만 처리 → 저장 버튼은 자주 누르는 컨트롤이라 호버 확대는 불필요합니다 (`review-escalation`: 게이트 없는 호버 모션). 터치 기기에서 호버가 고착되기도 합니다 (`a11y-touch-hover-gate`).

The behaviour is right and the remedy is right; only the citation is wrong. Adding a "hover scale-up on a frequently touched element" row to the Bad INTERACTION table pointing at `component-no-hover-grow` would close it. Not fixed here, as instructed.

**Scope of the defect**: the rule is reachable from the other paths. The `plan` workflow cited `component-no-hover-grow` correctly in `plans/002-fix-save-button-motion.md` ("Rule-ids: ... `component-no-hover-grow` ..."), so only the diagnosis-map route is missing it.

---

## Workflow cases, run for the first time

All three were run against throwaway copies outside the repository, so a wrong edit could not reach the fixtures. Total workflow runtime 10m42s.

| Workflow | Runtime | Expectations | Result |
|---|---|---|---|
| find-motion | 2m27s | 5 | 4 pass, 1 fail (fixture defect, see below) |
| animate | 33s | 2 | **2 pass** |
| plan | 7m42s | 6 | 5 pass, 1 partial |

### find-motion

Command: `/anything-uxui:find-motion <copy of find-motion-app>`

| Expectation | Result | Evidence |
|---|---|---|
| Button suggested | **PASS** | Row 1 covers `Toolbar.tsx:9 .toolbar__button` (Publish, Duplicate) and `TrialBanner.tsx:14 .trial-banner__action`, proposing the Press feedback row |
| Conditional render suggested | **FAIL** | It was rejected instead, see below |
| Command palette rejected, frequency reason | **PASS** | "`CommandPalette.tsx:22` ... **Q1에서 탈락: Cmd+K로 여는 키보드 동작이고 하루 100회 이상입니다.**" |
| ≤ 7 suggestions | **PASS** | 2 suggestions |
| Zero source files modified | **PASS** | `shasum -c` on all four files: OK |

**The one failure is my fixture's fault, not the workflow's.** It rejected the trial banner with:

> `TrialBanner.tsx:30`, 배너 진입 모션. **Q2에서 탈락: `daysLeft`는 `useState(4)`이고 setter가 없어(`App.tsx:9`) 배너는 첫 페인트부터 있습니다.** 이어줄 변화가 없고 6가지 목적 어디에도 해당하지 않습니다.

That reading is correct. `App.tsx:9` declares `const [daysLeft] = useState(4)` with no setter, so the banner is present from the first paint and never actually pops in. The fixture does not create the state change its expectation assumes. The workflow read the code more carefully than the fixture author did. To make this expectation testable the fixture needs a real trigger (a setter, a timer or a prop change); it is left as-is here so the record matches what was measured.

**Value check against `26-motion-spec.md`**: every proposed value is an exact row copy, not an approximation.

- Press feedback: `scale(0.97)` on `:active`, `var(--ease-out)` spelled out as `cubic-bezier(0.23, 1, 0.32, 1)`, 160ms in and out, centre origin. Matches the spec's "Press feedback" row exactly.
- Toast: `@starting-style`, `opacity` and `transform`, start `translateY(100%)` and opacity 0, easing `ease`, 400ms enter and 240ms exit. Matches the spec's "Toast" row exactly, and 240/400 is the required 60% exit ratio.
- Zero occurrences of "Framer" in the output. Properties proposed are `transform` and `opacity` only. No entrance scale below 0.95 anywhere.
- All 10 rule-ids it cited exist as headings in `references/`, checked individually with a fabricated id as negative control.

### animate

Command: `/anything-uxui:animate add an open/close animation to the command palette in <copy>`

| Expectation | Result | Evidence |
|---|---|---|
| Zero lines of animation code | **PASS** | The run used only `Read` (3) and `Bash` (2). No `Write`, `Edit` or `MultiEdit` at all, and `shasum -c` on all four files: OK |
| Gate rejection citing frequency/keyboard | **PASS** | "**애니메이션 코드 0줄. 파일은 수정하지 않았습니다.** 요청은 Step 1 게이트에서 거절됩니다. ... 하루 100회 이상 tier입니다. `CommandPalette.tsx:12-14`가 Cmd+K로 토글되므로 키보드로 시작하는 고빈도 동작입니다." |

It backed the refusal with three line-level citations, and all three are verbatim correct:

- `02-animation-timing.md:22` = "| 100+/day (keyboard shortcuts, command palette toggle) | No animation. Ever. |"
- `02-animation-timing.md:33` = "**Launcher/utility tools** ... should have ZERO open/close animation. Speed is the feature."
- `26-motion-spec.md:79-80` = "Check whether the component should animate at all. Anything a user triggers 100+ times a day, by shortcut or command palette or focus move, gets no animation and no row from this sheet"

This is the behaviour the gate exists for: the correct answer was to build nothing, and it built nothing.

### plan

Command: `/anything-uxui:plan <scratch repo>/src`, where `src/` holds copies of the 6 audit fixtures inside a throwaway git repo.

| Expectation | Result | Evidence |
|---|---|---|
| `plans/NNN-*.md` created | **PASS** | `001-add-non-drag-reorder-buttons.md` through `005-add-member-list-failure-recovery.md`, plus a `plans/README.md` index |
| Each has a `file:line` | **PASS** | 4, 8, 7, 8 and 4 matches of `*.tsx:N` respectively |
| Each has a commit marker | **PASS, with a caveat** | All five carry a Commit field. The repo had no commits (my setup staged but never committed), which the workflow detected and handled: "**Commit**: none. The repository has no commits yet (`git rev-parse --short HEAD` fails with "Needed a single revision"). Drift stamp instead: `git hash-object src/broken-button.tsx` = `56bb6461...`" |
| Each has an exact cubic-bezier | **PARTIAL** | Only `002` carries the literal `cubic-bezier(0.23, 1, 0.32, 1)`. `003` writes `var(--ease-out)` and states the dependency; `001`, `004` and `005` contain no easing at all |
| Each has a duration in ms | **PARTIAL** | `002`, `003` and `005` do; `001` and `004` do not |
| `git status` shows changes only under `plans/` | **PASS** | The six sources stay `A ` (staged, unmodified) and the only new entry is `?? plans/`. `shasum -c` on all six: OK |

**On the two partials: the expectation was written too literally, and the output is defensible.** Three of the five plans (`001` move buttons, `004` pending state instead of fake optimism, `005` failure recovery) contain no motion at all, so an easing curve would have to be invented to satisfy the letter of the expectation. For `003`, which is a motion plan, the curve is not missing but delegated: `002` defines `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `plans/README.md` records the hard dependency "**003 after 002**: both edit `src/broken-button.tsx`, and 003 quotes line numbers for the file as 002 leaves it." A context-free executor running the plans in the stated order does get the exact curve. The expectation in `expected.json` should be narrowed to "every plan that proposes motion resolves to an exact curve and duration"; it is left unchanged here so this record reports what was actually measured against what was actually expected.

**Value check against `26-motion-spec.md`**: the only values the plans propose are `160ms`, `cubic-bezier(0.23, 1, 0.32, 1)` and `scale(0.97)`, all exact matches for the "Press feedback" row and the shared-curve table. The `200ms` and `300ms` strings in the plans are quotations of the existing bad code and of prose, not proposals. Every `framer-motion` occurrence is the import being **deleted**, never proposed: "Do NOT add `motion` or any dependency, and do NOT keep a `framer-motion` import." Animated properties proposed are `transform` and `background-color` only, with `transition: none` under reduced motion.

No contradiction with the spec was found in any of the three workflows.

---

## Runner notes and what was not verified

- **Total runtime**: 6 audits 4m40s (two at a time), 3 workflows 10m42s, 15m22s of measured runtime overall.
- **Two runs were lost to the Mac sleeping** before `caffeinate -i` was adopted, and were rerun from scratch. Their partial streams were discarded, not scored.
- **Single run per case**, `sonnet` only. No run-to-run variance measured, and no other model tried.
- **The `find-motion` conditional-render expectation is currently untestable** with this fixture, as described above. It is a known-bad expectation, not a silent failure.
- **`plan` was run against a repo with no commits**, so the commit-marker expectation was satisfied by a `git hash-object` drift stamp rather than a real sha. A repo with history would exercise the intended path.
- **No `fix` run**, so "zero fixes that break the component" is still untested, as in the baseline.


## Re-check after two fixes (2026-09-21, 20:51 to 20:53, lead session)

Two items from the run above were fixed and only the affected cases were re-run (same runner: `caffeinate -i timeout -s KILL 480 claude -p ... --model sonnet --plugin-dir <working tree>`, fixtures copied outside the repo, stream-json).

| Fix | Change | Re-run result |
|---|---|---|
| Defect: no diagnosis-map row routed to `component-no-hover-grow` | One row added under the interaction table of `references/00-diagnosis-map.md` | `broken-button` audit now cites `component-no-hover-grow` and still returns Block. New key: **15/15**. 0 reads from the 3.0.0 cache, 0 Write/Edit calls |
| Fixture bug: `find-motion-app/App.tsx` held `daysLeft` in state with no setter, so the banner never arrived after first paint | `daysLeft` now starts `null` and is set from a fetch; the banner renders once it arrives | `find-motion`: press feedback suggested, banner insertion suggested (jarring-change bridge, accordion row, 200ms), command palette rejected at question 1 (keyboard, high frequency), 3 suggestions, 5 rejected candidates, 0 Write/Edit calls, all five fixture files byte-identical (`shasum -c`). **5/5** |

The `plan` expectation in `expected.json` was narrowed: every plan needs a `file:line` and a commit marker; an exact cubic-bezier and a duration are required only for plans that carry motion.
