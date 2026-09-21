#!/usr/bin/env python3
"""Verify that every value in references/26-motion-spec.md is backed by a rule.

26-motion-spec.md is the sheet other workflows copy values from, so a number that
drifts from the rule it cites is worse than no sheet at all. This script re-derives
the check mechanically:

  1. Map every rule-id to the reference file whose heading declares it.
  2. Read the tables in 26-motion-spec.md. The last column of each row is the source
     column and holds rule-ids in backticks; the first column is the row label; every
     cell in between is a value cell.
  3. Pull the typed values out of those cells (durations, scales and other transform
     functions, cubic-bezier curves, spring parameters, pixel and fraction lengths,
     bare decimals) and require each one to appear literally in at least one of the
     files the row cites.
  4. Check the K6 relation separately: where a component enters and leaves the screen,
     the exit duration must be 50% to 70% of the entrance.

One line per mismatch on stdout, exit 1 if there is any. `--selftest` proves the
checker can fail: it runs the real file (expecting clean), then a copy with two
values corrupted (expecting those two to be reported).

stdlib only, python3.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL_ROOT = HERE.parent
REFERENCES = SKILL_ROOT / "references"
SPEC = REFERENCES / "26-motion-spec.md"

# Rows whose component enters and then leaves the screen. Only these are subject to
# the "exit is about 60% of the entrance" relation (timing-exit-faster / K6).
# Excluded on purpose: press feedback and tab indicator never leave the screen;
# stagger, hold-to-confirm, scroll reveal and swipe-to-dismiss have no paired
# enter/exit duration at all.
EXIT_RATIO_ROWS = (
    "Dropdown / popover",
    "Tooltip",
    "Modal / dialog",
    "Drawer / sheet",
    "Toast",
    "Accordion / disclosure",
)
EXIT_RATIO_MIN = 0.50
EXIT_RATIO_MAX = 0.70

HEADING_RE = re.compile(r"^#{2,4}\s+`?([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`?\s*(?:[:—–-]|$)")
RULE_ID_RE = re.compile(r"`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`")

# Ordered: each pattern is applied to the cell, its matches are recorded, then the
# matched text is masked out so a later pattern cannot count the same digits twice.
TOKEN_PATTERNS = (
    ("curve", re.compile(r"cubic-bezier\([^)]*\)", re.I)),
    ("func", re.compile(r"(?:scale|translateX|translateY|translate|inset|blur|rotate)\([^)]*\)", re.I)),
    ("param", re.compile(r"\b(duration|bounce|stiffness|damping|velocity)\s*[:=>]\s*(\d+(?:\.\d+)?)")),
    ("range", re.compile(r"(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)\s*ms")),
    ("ms", re.compile(r"\d+(?:\.\d+)?\s*ms")),
    ("sec", re.compile(r"\d+(?:\.\d+)?s(?![a-z])", re.I)),
    ("px", re.compile(r"\d+(?:\.\d+)?px")),
    ("fr", re.compile(r"\d+(?:\.\d+)?fr")),
    ("decimal", re.compile(r"(?<![\w.])\d*\.\d+(?![\w.%])")),
)


def squash(text: str) -> str:
    """Collapse every run of whitespace so spacing differences never fail a match."""
    return re.sub(r"\s+", "", text)


def build_rule_index() -> dict[str, list[Path]]:
    index: dict[str, list[Path]] = {}
    for path in sorted(REFERENCES.glob("*.md")):
        for line in path.read_text(encoding="utf-8").splitlines():
            match = HEADING_RE.match(line)
            if match:
                index.setdefault(match.group(1), []).append(path)
    return index


def split_row(line: str) -> list[str]:
    body = line.strip()
    if body.startswith("|"):
        body = body[1:]
    if body.endswith("|"):
        body = body[:-1]
    return [cell.strip() for cell in body.split("|")]


def is_separator(cells: list[str]) -> bool:
    return bool(cells) and all(re.fullmatch(r":?-{2,}:?", cell) for cell in cells)


def parse_tables(text: str) -> list[dict]:
    """Return the markdown tables as {header, rows:[{line_no, cells}]}."""
    tables: list[dict] = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        if lines[i].lstrip().startswith("|") and i + 1 < len(lines) and is_separator(split_row(lines[i + 1])):
            header = split_row(lines[i])
            rows = []
            j = i + 2
            while j < len(lines) and lines[j].lstrip().startswith("|"):
                rows.append({"line_no": j + 1, "cells": split_row(lines[j])})
                j += 1
            tables.append({"header": header, "rows": rows})
            i = j
        else:
            i += 1
    return tables


def extract_tokens(cell: str) -> list[tuple[str, str]]:
    """Typed values in one cell, as (kind, text). Masks each match after taking it."""
    tokens: list[tuple[str, str]] = []
    working = cell
    for kind, pattern in TOKEN_PATTERNS:
        for match in pattern.finditer(working):
            if kind == "param":
                tokens.append(("param", f"{match.group(1)}={match.group(2)}"))
            elif kind == "range":
                tokens.append(("ms", f"{match.group(1)}ms"))
                tokens.append(("ms", f"{match.group(2)}ms"))
            else:
                tokens.append((kind, match.group(0)))
        working = pattern.sub(lambda m: " " * len(m.group(0)), working)
    return tokens


def token_found(kind: str, token: str, raw: str, squashed: str) -> bool:
    if kind in ("curve", "func"):
        return squash(token).lower() in squashed.lower()
    if kind == "param":
        name, value = token.split("=", 1)
        pattern = re.compile(rf"\b{name}\s*[:=>]\s*{re.escape(value)}(?!\d)")
        return bool(pattern.search(raw))
    number = re.match(r"[\d.]+", squash(token)).group(0)
    unit = squash(token)[len(number):]
    # A value written as a range in the rule file ("60-120ms") still states both ends.
    pattern = re.compile(
        rf"(?<![\d.]){re.escape(number)}\s*(?:{re.escape(unit)}"
        rf"|[–—-]\s*[\d.]+\s*{re.escape(unit)})" if unit else
        rf"(?<![\d.]){re.escape(number)}(?![\d.])"
    )
    if pattern.search(raw):
        return True
    # ...and the other end of such a range.
    if unit:
        other = re.compile(rf"[\d.]+\s*[–—-]\s*{re.escape(number)}\s*{re.escape(unit)}")
        return bool(other.search(raw))
    return False


def duration_ms(cell: str) -> float | None:
    """The cell's single duration in ms, or None if it is not exactly one duration."""
    tokens = extract_tokens(cell)
    durations = [t for t in tokens if t[0] in ("ms", "sec")]
    if len(durations) != 1 or len(tokens) != 1:
        return None
    kind, text = durations[0]
    value = float(re.match(r"[\d.]+", squash(text)).group(0))
    return value if kind == "ms" else value * 1000


def check(spec_path: Path) -> tuple[list[str], int, int]:
    mismatches: list[str] = []
    rule_index = build_rule_index()
    text = spec_path.read_text(encoding="utf-8")
    file_cache: dict[Path, tuple[str, str]] = {}
    checked_values = 0
    checked_rows = 0
    seen_ratio_rows: set[str] = set()

    for table in parse_tables(text):
        header = table["header"]
        if not header or header[-1].lower() != "source":
            continue
        enter_idx = header.index("Enter") if "Enter" in header else None
        exit_idx = header.index("Exit") if "Exit" in header else None

        for row in table["rows"]:
            cells = row["cells"]
            if len(cells) != len(header):
                mismatches.append(
                    f"{spec_path.name}:{row['line_no']}  row has {len(cells)} cells, header has {len(header)}"
                )
                continue
            label = re.sub(r"[`*]", "", cells[0]).strip()
            rule_ids = RULE_ID_RE.findall(cells[-1])
            if not rule_ids:
                mismatches.append(f"{spec_path.name}:{row['line_no']}  {label}: no rule-id cited")
                continue

            sources: list[Path] = []
            for rule_id in rule_ids:
                paths = rule_index.get(rule_id)
                if not paths:
                    mismatches.append(
                        f"{spec_path.name}:{row['line_no']}  {label}: cited rule-id '{rule_id}' "
                        f"is not declared by any file in references/"
                    )
                    continue
                for path in paths:
                    if path not in sources:
                        sources.append(path)
            if not sources:
                continue
            for path in sources:
                if path not in file_cache:
                    raw = path.read_text(encoding="utf-8")
                    file_cache[path] = (raw, squash(raw))

            checked_rows += 1
            for cell in cells[1:-1]:
                for kind, token in extract_tokens(cell):
                    checked_values += 1
                    if not any(token_found(kind, token, *file_cache[path]) for path in sources):
                        where = ", ".join(p.name for p in sources)
                        mismatches.append(
                            f"{spec_path.name}:{row['line_no']}  {label}: {kind} '{token}' "
                            f"not found in {where} (cited: {', '.join(rule_ids)})"
                        )

            if label in EXIT_RATIO_ROWS and enter_idx is not None and exit_idx is not None:
                seen_ratio_rows.add(label)
                enter = duration_ms(cells[enter_idx])
                exit_ = duration_ms(cells[exit_idx])
                if enter is None or exit_ is None:
                    mismatches.append(
                        f"{spec_path.name}:{row['line_no']}  {label}: enter/exit must each be one "
                        f"plain duration for the 60% exit relation (got '{cells[enter_idx]}' / '{cells[exit_idx]}')"
                    )
                else:
                    ratio = exit_ / enter
                    if not EXIT_RATIO_MIN <= ratio <= EXIT_RATIO_MAX:
                        mismatches.append(
                            f"{spec_path.name}:{row['line_no']}  {label}: exit is {ratio:.0%} of the "
                            f"entrance ({exit_:.0f}ms / {enter:.0f}ms); timing-exit-faster wants about 60%"
                        )

    for label in EXIT_RATIO_ROWS:
        if label not in seen_ratio_rows:
            mismatches.append(f"{spec_path.name}: row '{label}' is missing, so its exit relation was never checked")

    return mismatches, checked_values, checked_rows


def run(spec_path: Path, quiet: bool = False) -> int:
    mismatches, values, rows = check(spec_path)
    for line in mismatches:
        print(line)
    if not quiet:
        if mismatches:
            print(f"{len(mismatches)} mismatch(es) across {rows} rows / {values} values checked")
        else:
            print(f"OK: {values} values across {rows} rows all trace to their cited rule")
    return 1 if mismatches else 0


def inject(text: str, pattern: str, replacement: str) -> tuple[str, bool]:
    """Corrupt the first TABLE row that matches, so the probe lands inside a checked cell."""
    lines = text.splitlines(keepends=True)
    for i, line in enumerate(lines):
        if line.lstrip().startswith("|") and re.search(pattern, line):
            lines[i] = re.sub(pattern, replacement, line, count=1)
            return "".join(lines), True
    return text, False


def selftest() -> int:
    import tempfile

    print("[1/2] real file, expecting no mismatch")
    clean, values, rows = check(SPEC)
    for line in clean:
        print("  " + line)
    print(f"  {len(clean)} mismatch(es), {values} values / {rows} rows")

    print("[2/2] corrupted copy, expecting all three injected faults to be caught")
    text = SPEC.read_text(encoding="utf-8")
    probes = [
        (r"\b160ms\b", "999ms", "999ms", "duration with no rule behind it"),
        (r"scale\(0\.95\)", "scale(0.80)", "scale(0.80)", "entrance scale below the 0.95 floor"),
        (r"\| 150ms \| center", "| 240ms | center", "96%", "exit no longer about 60% of the entrance"),
    ]
    corrupted = text
    for pattern, replacement, _marker, what in probes:
        corrupted, done = inject(corrupted, pattern, replacement)
        if not done:
            print(f"  FAIL: could not inject the {what} probe (pattern {pattern!r} is no longer in a table row)")
            return 1
    with tempfile.TemporaryDirectory() as tmp:
        broken = Path(tmp) / SPEC.name
        broken.write_text(corrupted, encoding="utf-8")
        found, _, _ = check(broken)
    for line in found:
        print("  " + line)

    caught = []
    for _pattern, _replacement, marker, what in probes:
        hit = any(marker in line for line in found)
        caught.append(hit)
        print(f"  {what}: {'caught' if hit else 'MISSED'}")

    ok = not clean and all(caught)
    print("SELFTEST PASS" if ok else "SELFTEST FAIL")
    return 0 if ok else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("spec", nargs="?", default=str(SPEC), help="path to 26-motion-spec.md")
    parser.add_argument("--selftest", action="store_true", help="prove the checker can fail")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    return run(Path(args.spec))


if __name__ == "__main__":
    sys.exit(main())
