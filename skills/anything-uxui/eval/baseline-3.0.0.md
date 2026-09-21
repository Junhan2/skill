# Baseline: anything-uxui 3.0.0

**Date**: 2026-09-21
**Plugin under test**: `anything-uxui` 3.0.0, the untouched installed copy at
`/Users/leegangjoon2/.claude/plugins/cache/junhan-skills/anything-uxui/3.0.0`
**Model**: `sonnet`
**Command**: `/anything-uxui:audit <case>` (the slash command resolved normally in `-p` mode; no fallback prompt was needed)

This is the first time the harness has ever run. Before today `eval/` held only `README.md`, so the "3.0.0 catches 90% of the expected rules" claim was untested.

---

## Result

**Overall hit rate: 14/14 = 100.0%.** Every expected rule-id was cited verbatim in the audit output.
**Verdicts: 6/6 correct.** The five broken cases were all Blocked.
**Control (`clean-button.tsx`): Approve.** The false-positive guard held.

By the README's own bar (≥90% of expected rules caught, correct Block/Approve), 3.0.0 passes.

| Case | Expected | Hit | Missed | Expected verdict | Actual | Run time |
|---|---|---|---|---|---|---|
| broken-button | 5 | 5 | none | Block | **Block** | 91s |
| broken-loading-state | 3 | 3 | none | Block | **Block** | 89s |
| slop-landing | 4 | 4 | none | Block | **Block** | 88s |
| drag-only-list | 1 | 1 | none | Block | **Block** | 82s |
| optimistic-delete-no-undo | 1 | 1 | none | Block | **Block** | 102s |
| clean-button (control) | 0 | n/a | n/a | Approve | **Approve** | 104s |
| **Total** | **14** | **14** | **0** | | **6/6** | 9m16s |

A rule-id counts as a hit only when the id string appears verbatim in the output.

---

## Exact commands

Flags were confirmed by reading the entire output of `claude --help` first, not by assumption:

- `--plugin-dir <path>`: "Load a plugin from a directory or .zip for this session only; a folder of plugins loads each child (repeatable)". Present, spelled as expected.
- `-p, --print`: "Print response and exit". Present.

The scored pass:

```sh
SCRATCH=<scratch dir>
CASES="$SCRATCH/isolated-cases"
PLUG=/Users/leegangjoon2/.claude/plugins/cache/junhan-skills/anything-uxui/3.0.0

cd "$SCRATCH"
for name in broken-button broken-loading-state slop-landing \
            drag-only-list optimistic-delete-no-undo clean-button; do
  timeout 600 claude -p "/anything-uxui:audit $CASES/$name.tsx" \
    --model sonnet \
    --plugin-dir "$PLUG" \
    --add-dir "$CASES" --add-dir "$PLUG" \
    --output-format stream-json --verbose \
    < /dev/null > "$SCRATCH/raw2/$name.jsonl" 2> "$SCRATCH/raw2/$name.err"
done
```

All six exited 0. No run timed out, and no run produced an empty result.

---

## Which copy of the plugin actually ran

The plugin is also installed globally as `anything-uxui@junhan-skills`, so `/anything-uxui:audit` resolves without `--plugin-dir` and the prose answer alone cannot say which copy served it.

**How this was settled**: `--output-format stream-json --verbose` records every tool call. The `Read` paths in that stream name the file on disk that the audit actually opened. In all six scored runs, every reference file read came from:

```
/Users/leegangjoon2/.claude/plugins/cache/junhan-skills/anything-uxui/3.0.0/skills/anything-uxui/references/
```

A programmatic scan of all six streams for the string `anything-uxui-src` (the shared working tree) returned no matches, against a positive control confirming the same scan does find the `3.0.0` cache path in every run.

Two supporting facts:

- `installed_plugins.json` still records `version: 2.0.0` with `installPath: .../anything-uxui/2.0.0` for both entries, which is stale. The `2.0.0` folder contains no `commands/` directory at all (`ls` on it: "No such file or directory", against a positive control showing `audit.md`, `design.md`, `fix.md` under `3.0.0/commands/`). A `/anything-uxui:audit` command therefore cannot have come from the 2.0.0 copy.
- The `3.0.0` cache and the working tree are both at upstream commit `b0f68db`, so at the start of the day they were the same content. They are no longer: see the contamination note below.

---

## A contaminated first pass, and why it was discarded

The first pass pointed the audit at the fixtures in their real location inside the shared working tree (`~/Desktop/anything-uxui-src/skills/anything-uxui/eval/cases/`). Two other agents are editing that tree at the same time.

In five of six runs the audit read the rules from the pinned `3.0.0` cache. In the sixth (`optimistic-delete-no-undo`) it walked up from the case file and read the rules from the **working tree** instead:

```
Read /Users/leegangjoon2/Desktop/anything-uxui-src/skills/anything-uxui/references/00-diagnosis-map.md
Read /Users/leegangjoon2/Desktop/anything-uxui-src/skills/anything-uxui/references/15-review-checklist.md
Read /Users/leegangjoon2/Desktop/anything-uxui-src/skills/anything-uxui/references/24-state-design.md
```

Both `00-diagnosis-map.md` and `15-review-checklist.md` were already modified at that moment (`git status` showed them as ` M`, and `diff` against the cache copy showed them differing). That run measured a half-edited 3.1.0, not the 3.0.0 baseline.

**Fix**: the six fixtures were copied byte-for-byte to a scratch directory outside the repository, and the pass was re-run with `--add-dir` naming only that scratch directory and the plugin copy. The working tree was then unreachable. Only this isolated pass is scored above. The discarded pass reached the same score (14/14, 6/6 verdicts), so the conclusion does not depend on the mistake, but the number reported here comes from the clean run.

---

## Read-only check

Audit is read-only by design. Confirmed after the runs:

```
$ git -C ~/Desktop/anything-uxui-src status --short -- skills/anything-uxui/eval/cases
?? skills/anything-uxui/eval/cases/
```

`cases/` is a brand-new untracked directory, so git reports the directory as a whole and cannot prove per-file integrity. Two further checks close that gap:

- Every fixture's mtime is between 17:43:31 and 17:44:11, before the first pass finished (17:53) and before the isolated pass started (17:55). No file was written during a run.
- The fixtures are byte-identical to the copies taken before the isolated pass.

---

## Evidence: verdict lines and cited rule-ids

Quoted from the `result` message of each scored run. The audits answer in Korean, which is the session default; the rule-ids and the Block/Approve tokens are verbatim.

### broken-button: Block

> **결정: Block.** `ease-in`, `transition: all`, hover scale 충돌이 feel을 깨는 회귀이고, 타깃 크기 미달은 WCAG 2.2 AA 실패입니다.

Expected ids all cited: `component-active-scale`, `easing-no-ease-in`, `a11y-target-size-24`, `perf-transform-opacity-only`, `perf-motion-hw`.
Also raised (not scored): `timing-300ms-cap`, `a11y-touch-hover-gate`, `a11y-hit-area-expansion`, `easing-custom-curves`, `state-focus-visible`, `a11y-reduced-motion`.

### broken-loading-state: Block

> **판정: Block** (STATUS: DONE, 읽기 전용, 파일 변경 없음)

Expected ids all cited: `state-loading-aria-busy`, `state-indicator-threshold`, `state-skeleton-mirrors-layout`.
Also raised: `state-swr-no-skeleton`, `state-error-recovery`, `state-empty-is-teachable`.

### slop-landing: Block

> **판정: Block.** 이 파일은 AI 티가 나는 디자인의 전형이고, 접근성 실패(CTA 대비, 포커스 링 없음)와 눌림 피드백 누락이 함께 있습니다.

Expected ids all cited: `distinct-no-default-font`, `distinct-no-slop-palette`, `distinct-break-scaffold`, `distinct-emoji-not-icons`.
Also raised: `color-contrast-minimum` (the audit computed white on `#3b82f6` as 3.68:1 and on `#a855f7` as 3.96:1), `distinct-radius-is-brand`, `distinct-saturate-neutrals`, `state-focus-indicator-wcag`, `component-active-scale`.

### drag-only-list: Block

> **Block.** WCAG 2.5.7(AA) 위반이 있습니다. 순서 변경이 마우스 드래그로만 가능하고, 키보드·스크린리더·단일 포인터 대안이 없습니다.

Expected id cited: `gesture-non-drag-alternative`.
Also raised: `keyboard-arrow-directions`, `gesture-pointer-capture`, `gesture-multi-touch-guard`, `a11y-target-size-24`, `component-active-scale`.

### optimistic-delete-no-undo: Block

> **최종 판정: Block.** 이 파일은 수정하지 않았습니다.

Expected id cited: `state-optimistic-limits`.
Also raised: `state-error-recovery`, `state-pending-on-trigger`, `state-aria-disabled-over-disabled`, `type-tabular-nums`. The audit noted the optimistic update is dispatched after the `await` rather than before it, and cited react.dev for `useOptimistic`.

### clean-button (control): Approve

> **Approve** 판정입니다. 막을 사유는 없고, 표에 적은 3건은 모두 비차단 개선입니다.

No expected ids (the control expects none). The audit still raised three non-blocking items: `state-matrix-7-states` and `state-aria-disabled-over-disabled` (the button exposes no disabled or busy state), `form-font-inherit`, and `token-css-variables-runtime` / `token-no-magic-numbers` (the fixture declares `:root` tokens inside a component-level `<style>`). None of these met a Block criterion, which is the behaviour the control is there to check.

---

## Caveats and things not verified

- **One fixture bug was fixed mid-build, before scoring.** A pilot run flagged `a11y-touch-hover-gate` on the control: its `:hover` rule was not wrapped in `@media (hover: hover)`. That is a real rule the control should have satisfied by construction, so the fixture was corrected and the whole pass re-run. The control's expected verdict (Approve) never changed, and the pilot had already returned Approve before the fix.
- **The fixtures deliberately name no rule-ids.** The first draft carried headers like "Deliberately violates: `perf-motion-hw`, ...". The pilot audit read one of those headers and quoted it back, which would have made the score meaningless. All such comments were stripped before any scored run, and a grep across `cases/` for the expected ids and for the words "Deliberately", "SUGGEST", "REJECT" and "Expected verdict" now returns zero hits, against a positive control confirming the same grep matches ordinary code in all ten files.
- **100% is a ceiling reading on 14 data points, not a general accuracy claim.** The fixtures were written against the rule text, so they are close to the textbook cases. Real code is messier. The number's job is to be a floor that the 3.1.0 changes must not fall below, and for that it is sound.
- **Only `sonnet` was measured.** Another model may score differently.
- **Single run per case.** Nothing here measures run-to-run variance.
- **No fix was applied and re-audited**, so the README's third pass condition ("zero fixes that break the component") is untested. That belongs to `/anything-uxui:fix`, not to this baseline.
- **The three workflow fixtures were not run.** `find-motion`, `animate` and `plan` do not exist in 3.0.0. Their fixtures and expectations sit in `cases/find-motion-app/` and the `workflows` key of `cases/expected.json`, ready for whoever lands those commands.
