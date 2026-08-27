#!/usr/bin/env python3
"""Tests for the delivery mechanism.

The update tie is the one piece of machinery every budded instrument depends on,
and it fails silently when it fails: a malformed CHANGELOG heading swallows the
directives under it, and a stamp advanced too early loses them. These tests pin
the parsing so that cannot happen unnoticed.

    python3 scripts/test_check_updates.py
"""

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

STUDIO = Path(__file__).resolve().parent.parent
SCRIPT = STUDIO / "scripts" / "check_updates.py"

failures = []


def check(name, cond, detail=""):
    if cond:
        print(f"  ok   {name}")
    else:
        print(f"  FAIL {name}{'  ' + detail if detail else ''}")
        failures.append(name)


def run(*args, cwd=None):
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        capture_output=True, text=True, cwd=cwd or STUDIO,
    )


def make_instrument(tmp, version):
    d = Path(tmp) / "inst"
    d.mkdir()
    (d / ".music_loom.toml").write_text(
        f'version = "{version}"\nmother = "https://example.invalid/music_loom.git"\n'
    )
    return d


def main():
    print("delivery mechanism")

    r = run("--validate")
    check("validate passes on the studio as it stands", r.returncode == 0, r.stderr.strip())

    r = run("--validate", "some/path")
    check("--validate refuses an instrument argument", r.returncode != 0)

    r = run()
    check("no argument is an error", r.returncode != 0)

    current = (STUDIO / "VERSION").read_text().strip()

    with tempfile.TemporaryDirectory() as tmp:
        d = make_instrument(tmp, current)
        r = run(str(d))
        check("current stamp reports up to date", "up to date" in r.stdout, r.stdout.strip())

    with tempfile.TemporaryDirectory() as tmp:
        d = make_instrument(tmp, "0.0.1")
        r = run(str(d))
        check("older stamp prints directives", r.returncode == 0 and "Propose these" in r.stdout)
        check("directives are not auto-applied", "do not apply them silently" in r.stdout)

        r = run(str(d), "--mark-read")
        stamped = (d / ".music_loom.toml").read_text()
        check("--mark-read advances the stamp", f'version = "{current}"' in stamped, stamped.strip())
        check("--mark-read keeps the mother line", "mother =" in stamped)

    with tempfile.TemporaryDirectory() as tmp:
        d = make_instrument(tmp, "99.0.0")
        r = run(str(d))
        check("a stamp newer than the studio raises", r.returncode != 0)

    with tempfile.TemporaryDirectory() as tmp:
        d = Path(tmp) / "bare"
        d.mkdir()
        r = run(str(d))
        check("a directory with no stamp raises", r.returncode != 0)

    with tempfile.TemporaryDirectory() as tmp:
        d = make_instrument(tmp, "not.a.version")
        r = run(str(d))
        check("a malformed stamp raises", r.returncode != 0)

    # A bracketed heading that is not semver would hide every directive filed
    # under it from every instrument that checks. It must be an error, not a skip.
    with tempfile.TemporaryDirectory() as tmp:
        fake = Path(tmp) / "studio"
        shutil.copytree(STUDIO, fake, ignore=shutil.ignore_patterns(
            "bench", "node_modules", ".git", "tmp", "__pycache__"))
        cl = fake / "CHANGELOG.md"
        cl.write_text(cl.read_text().replace("## [0.1.0]", "## [Unreleased]\n\n## [0.1.0]", 1))
        r = subprocess.run(
            [sys.executable, str(fake / "scripts" / "check_updates.py"), "--validate"],
            capture_output=True, text=True,
        )
        check("a non-semver bracketed heading raises", r.returncode != 0)

    # The template stamp must track VERSION, or every instrument born after a
    # bump immediately reports itself out of date.
    with tempfile.TemporaryDirectory() as tmp:
        fake = Path(tmp) / "studio"
        shutil.copytree(STUDIO, fake, ignore=shutil.ignore_patterns(
            "bench", "node_modules", ".git", "tmp", "__pycache__"))
        stamp = fake / "template" / ".music_loom.toml"
        stamp.write_text(stamp.read_text().replace(current, "0.0.1"))
        r = subprocess.run(
            [sys.executable, str(fake / "scripts" / "check_updates.py"), "--validate"],
            capture_output=True, text=True,
        )
        check("a stale template stamp raises", r.returncode != 0)

    print()
    if failures:
        print(f"{len(failures)} failed: {', '.join(failures)}")
        return 1
    print("all passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
