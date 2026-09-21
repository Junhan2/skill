# anything-uxui

Comprehensive UIUX design principles for building world-class web interfaces.
~300 rules across 24 categories, a symptom-to-rule diagnosis map, and six workflows. By junhan of [select.codes](https://select.codes).

## Install

```bash
claude plugin add Junhan2/skill
```

## Categories

| # | Category | Impact | Rules |
|---|----------|--------|-------|
| 01 | Design Philosophy | CRITICAL | 12 |
| 02 | Animation Timing & Easing | CRITICAL | 10 |
| 03 | Spring Physics | HIGH | 6 |
| 04 | Component Patterns | HIGH | 17 |
| 05 | CSS Techniques | HIGH | 31 |
| 06 | Gesture Interaction | HIGH | 9 |
| 07 | Exit Animations | HIGH | 15 |
| 08 | Visual Design | HIGH | 9 |
| 09 | Typography | MEDIUM | 17 |
| 10 | Audio Feedback | MEDIUM | 27 |
| 11 | Laws of UX | HIGH | 23 |
| 12 | Performance | HIGH | 13 |
| 13 | Prefetching | MEDIUM | 6 |
| 14 | Accessibility | HIGH | 8 |
| 15 | Review Checklist | HIGH | — |
| 16 | Layout Systems | CRITICAL | 14 |
| 17 | Dialog & Overlay Patterns | CRITICAL | 15 |
| 18 | Color & Theming | CRITICAL | 12 |
| 19 | Design Tokens | HIGH | 9 |
| 20 | Keyboard & State Matrix | CRITICAL | 12 |
| 21 | Form Patterns | HIGH | 7 |

| 23 | Distinctive Design | CRITICAL | 9 |
| 24 | State Design | HIGH | 7 |
| 25 | AI & Streaming | HIGH | 7 |

Reference sheets (not counted as rules): `00` Diagnosis Map, `22` Animation Vocabulary, `26` Motion Spec.

## Commands

| Command | What it does | Writes code |
|---|---|---|
| `/anything-uxui:audit <path>` | Findings table with rule-ids and a Block/Approve verdict | No |
| `/anything-uxui:fix <path>` | Audit, then apply the remedial hierarchy | Yes |
| `/anything-uxui:design <brief>` | Build new UI to spec so it is not generic by construction | Yes |
| `/anything-uxui:find-motion <path>` | Find where motion is missing, gate every candidate, list what was rejected and why | No |
| `/anything-uxui:animate <component>` | Add motion to an existing component; the gate can answer "none" | Yes |
| `/anything-uxui:plan <path>` | Survey a codebase and write self-contained plans into `plans/` | Only `plans/` |

## License

MIT
