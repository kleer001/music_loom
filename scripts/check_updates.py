#!/usr/bin/env python3
"""Report music_loom convention changes a budded instrument has not seen yet.

An instrument stamps the studio version it descends from in `.music_loom.toml`.
This reads that stamp, reads the studio's VERSION, and prints every CHANGELOG
directive logged strictly between them. The instrument's session acts on those
directives by proposing changes to the user; it never applies them silently.

    python3 <music_loom>/scripts/check_updates.py .
    python3 <music_loom>/scripts/check_updates.py . --mark-read
    python3 <music_loom>/scripts/check_updates.py --validate

--mark-read advances the stamp to the studio's current VERSION. Run it only
after the directives are actually resolved; running it first loses them.

--validate checks the studio's own delivery mechanism and takes no instrument
argument. It is what CI runs.

One path, no fallbacks. A missing stamp, a missing VERSION or a malformed
CHANGELOG raises rather than guessing.
"""

import argparse
import re
import sys
from pathlib import Path

STUDIO = Path(__file__).resolve().parent.parent
STAMP_NAME = ".music_loom.toml"

# Release headings are machine-read: exactly three numeric fields in brackets,
# nothing else on the line before an optional date. `## Severity tiers` and the
# like are prose and are skipped. A bracketed non-semver heading is an error,
# because it would silently swallow the directives filed under it.
RELEASE_RE = re.compile(r"^##\s+\[(\d+)\.(\d+)\.(\d+)\]\s*(.*)$")
BRACKET_HEADING_RE = re.compile(r"^##\s+\[(.*?)\]")
VERSION_RE = re.compile(r"^(\d+)\.(\d+)\.(\d+)$")


def parse_version(text, where):
    m = VERSION_RE.match(text.strip())
    if not m:
        raise SystemExit(f"{where}: not a semver version: {text.strip()!r}")
    return tuple(int(g) for g in m.groups())


def studio_version():
    path = STUDIO / "VERSION"
    if not path.is_file():
        raise SystemExit(f"missing {path} — the studio has no version to compare against")
    return parse_version(path.read_text(), path)


def read_stamp(instrument):
    path = instrument / STAMP_NAME
    if not path.is_file():
        raise SystemExit(
            f"missing {path}\n"
            f"{instrument} does not look like an instrument budded from music_loom."
        )
    text = path.read_text()
    m = re.search(r'^\s*version\s*=\s*"([^"]+)"\s*$', text, re.M)
    if not m:
        raise SystemExit(f'{path}: no `version = "X.Y.Z"` line')
    return parse_version(m.group(1), path), path


def parse_changelog():
    """Return [(version_tuple, heading_line, body_text)], newest first."""
    path = STUDIO / "CHANGELOG.md"
    if not path.is_file():
        raise SystemExit(f"missing {path}")

    lines = path.read_text().splitlines()
    starts = []
    for i, line in enumerate(lines):
        m = RELEASE_RE.match(line)
        if m:
            starts.append((i, tuple(int(g) for g in m.groups()[:3])))
            continue
        # A bracketed heading that is not semver would hide everything under it.
        b = BRACKET_HEADING_RE.match(line)
        if b:
            raise SystemExit(
                f"{path}:{i + 1}: bracketed heading {b.group(1)!r} is not a semver "
                f"release. Use `## [X.Y.Z]` or drop the brackets."
            )

    if not starts:
        raise SystemExit(f"{path}: no `## [X.Y.Z]` release headings found")

    entries = []
    for n, (i, ver) in enumerate(starts):
        end = starts[n + 1][0] if n + 1 < len(starts) else len(lines)
        entries.append((ver, lines[i], "\n".join(lines[i + 1 : end]).strip("\n")))
    return entries


def fmt(v):
    return ".".join(str(x) for x in v)


def cmd_validate():
    version = studio_version()
    entries = parse_changelog()
    versions = [v for v, _, _ in entries]

    if versions != sorted(versions, reverse=True):
        raise SystemExit("CHANGELOG.md: releases are not in descending order")
    if len(set(versions)) != len(versions):
        raise SystemExit("CHANGELOG.md: duplicate release heading")
    if version not in versions:
        raise SystemExit(
            f"VERSION is {fmt(version)} but CHANGELOG.md has no `## [{fmt(version)}]` entry"
        )

    stamp = STUDIO / "template" / STAMP_NAME
    if not stamp.is_file():
        raise SystemExit(f"missing {stamp} — new instruments would be born unstamped")
    tmpl, _ = read_stamp(STUDIO / "template")
    if tmpl != version:
        raise SystemExit(
            f"template/{STAMP_NAME} is {fmt(tmpl)} but VERSION is {fmt(version)}. "
            f"An instrument born now would immediately report itself out of date."
        )

    # Every directive names files to read; a path that does not exist sends the
    # daughter's session looking for something that is not there.
    missing = []
    for ver, _, body in entries:
        for path in re.findall(r"\*\*Read:\*\*\s*(.+)", body):
            for token in re.findall(r"`([^`]+)`", path):
                target = token.split("§")[0].strip().rstrip("/")
                if target and not (STUDIO / target).exists():
                    missing.append(f"  [{fmt(ver)}] {target}")
    if missing:
        raise SystemExit("CHANGELOG.md directives cite paths that do not exist:\n" + "\n".join(missing))

    print(f"delivery mechanism OK — VERSION {fmt(version)}, {len(entries)} release(s)")
    return 0


def cmd_check(instrument_arg, mark_read):
    instrument = Path(instrument_arg).resolve()
    if not instrument.is_dir():
        raise SystemExit(f"not a directory: {instrument}")

    version = studio_version()
    stamp, stamp_path = read_stamp(instrument)

    if stamp == version:
        print(f"up to date at v{fmt(version)}")
        return 0
    if stamp > version:
        raise SystemExit(
            f"{stamp_path} is stamped v{fmt(stamp)} but the studio is v{fmt(version)}. "
            f"This instrument descends from a newer music_loom than the one at {STUDIO}."
        )

    pending = [e for e in parse_changelog() if stamp < e[0] <= version]

    if mark_read:
        text = stamp_path.read_text()
        new = re.sub(r'^(\s*version\s*=\s*)"[^"]+"', rf'\g<1>"{fmt(version)}"', text, count=1, flags=re.M)
        if new == text:
            raise SystemExit(f"{stamp_path}: could not rewrite the version line")
        stamp_path.write_text(new)
        print(f"stamped v{fmt(version)} (was v{fmt(stamp)}, {len(pending)} directive block(s) marked read)")
        return 0

    print(f"music_loom v{fmt(version)} — this instrument is stamped v{fmt(stamp)}")
    print(f"{len(pending)} release(s) with directives to consider.\n")
    for ver, heading, body in reversed(pending):
        print(heading)
        print(body)
        print()
    print("Propose these to the user; do not apply them silently.")
    print(f"Once resolved: python3 {Path(__file__).resolve()} {instrument_arg} --mark-read")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("instrument", nargs="?", help="path to a budded instrument")
    ap.add_argument("--mark-read", action="store_true", help="advance the stamp after resolving directives")
    ap.add_argument("--validate", action="store_true", help="check the studio's own delivery mechanism")
    args = ap.parse_args()

    if args.validate:
        if args.instrument:
            raise SystemExit("--validate takes no instrument argument")
        return cmd_validate()
    if not args.instrument:
        ap.error("give an instrument path, or --validate")
    return cmd_check(args.instrument, args.mark_read)


if __name__ == "__main__":
    sys.exit(main())
