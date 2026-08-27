#!/usr/bin/env python3
"""Start a new instrument on the bench from the studio template.

    python3 scripts/new_instrument.py dub-echo-study
    python3 scripts/new_instrument.py dub-echo-study --graft core,measure

Copies `template/` to `bench/<slug>/`, substitutes the slug, and optionally
grafts rack units. Refuses to overwrite an existing instrument.

Grafts:
  core     rack/R2-core/core/  ->  core/         (+ node-web-audio-api devDep)
  measure  rack/R3-measure/    ->  render.mjs, test/regression.test.js, src/graph.js
  release  rack/R4-release/    ->  RELEASE-CHECKLIST.md, PROVENANCE.md
"""

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

STUDIO = Path(__file__).resolve().parent.parent
TEMPLATE = STUDIO / "template"
BENCH = STUDIO / "bench"
PLACEHOLDER = "INSTRUMENT_SLUG"

GRAFT_SEED = '''// The graph. Built by the page to play and by the render harness to measure —
// one builder, so what you measure is what you hear.
//
// It must run against a plain AudioContext and an OfflineAudioContext alike.
// That is why no browser-only node may sit in a required path: an
// OfflineAudioContext has no audioWorklet.

import { makeRng } from "../core/rng.js";
import { degreeToMidi, midiToFreq, MODES } from "../core/music.js";

export const SAMPLE_RATE = 48000;

// Sequences hold scale degrees, never absolute pitch, so key and mode stay free
// to change and everything already written retunes with them.
const FIGURE = [0, 2, 4, 2, 5, 4, 2, 0];
const BPM = 96;

export async function build(ctx, { seed = 1, seconds = 8 } = {}) {
  const rng = makeRng(seed);

  const out = ctx.createGain();
  out.gain.value = 0.25;
  out.connect(ctx.destination);

  const beat = 60 / BPM / 2;
  const root = 48;

  for (let i = 0; i * beat < seconds; i++) {
    const t = i * beat;
    const degree = FIGURE[i % FIGURE.length];
    const freq = midiToFreq(degreeToMidi(root, MODES.dorian, degree));

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const env = ctx.createGain();
    // Envelopes return to zero. One that does not leaves a DC step the
    // regression test will catch.
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.6 + rng.next() * 0.3, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9);
    env.gain.setValueAtTime(0, t + beat * 0.92);

    osc.connect(env).connect(out);
    osc.start(t);
    osc.stop(t + beat);
  }

  return { output: out };
}
'''


def slugify(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not s:
        raise SystemExit(f"cannot make a slug from {name!r}")
    return s


def graft_core(dest):
    shutil.copytree(STUDIO / "rack" / "R2-core" / "core", dest / "core")
    pkg_path = dest / "package.json"
    pkg = json.loads(pkg_path.read_text())
    pkg.setdefault("devDependencies", {})["node-web-audio-api"] = "^2.0.0"
    pkg_path.write_text(json.dumps(pkg, indent=2) + "\n")
    return ["core/", "node-web-audio-api devDependency"]


def graft_measure(dest):
    shutil.copy2(STUDIO / "rack" / "R3-measure" / "render.mjs", dest / "render.mjs")
    shutil.copy2(STUDIO / "rack" / "R3-measure" / "regression.test.js", dest / "test" / "regression.test.js")
    (dest / "src" / "graph.js").write_text(GRAFT_SEED)
    pkg_path = dest / "package.json"
    pkg = json.loads(pkg_path.read_text())
    pkg["scripts"]["render"] = "node render.mjs"
    pkg_path.write_text(json.dumps(pkg, indent=2) + "\n")
    return ["render.mjs", "test/regression.test.js", "src/graph.js (seed figure — replace it)"]


def graft_release(dest):
    src = STUDIO / "rack" / "R4-release"
    shutil.copy2(src / "RELEASE-CHECKLIST.md", dest / "RELEASE-CHECKLIST.md")
    shutil.copy2(src / "PROVENANCE.md", dest / "PROVENANCE.md")
    return ["RELEASE-CHECKLIST.md", "PROVENANCE.md"]


GRAFTS = {"core": graft_core, "measure": graft_measure, "release": graft_release}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("name", help="instrument name; becomes the bench directory slug")
    ap.add_argument("--graft", default="", help=f"comma-separated rack units: {','.join(GRAFTS)}")
    ap.add_argument("--dest", help="parent directory (default: bench/)")
    args = ap.parse_args()

    units = [u.strip() for u in args.graft.split(",") if u.strip()]
    unknown = [u for u in units if u not in GRAFTS]
    if unknown:
        raise SystemExit(f"unknown rack unit(s): {', '.join(unknown)}. Known: {', '.join(GRAFTS)}")
    if "measure" in units and "core" not in units:
        raise SystemExit("`measure` needs `core` — the render harness imports core/metrics.js")

    slug = slugify(args.name)
    parent = Path(args.dest).resolve() if args.dest else BENCH
    dest = parent / slug
    if dest.exists():
        raise SystemExit(f"{dest} already exists")

    parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(TEMPLATE, dest)

    # Substitute the slug through every text file the template carries.
    for path in dest.rglob("*"):
        if not path.is_file():
            continue
        try:
            text = path.read_text()
        except UnicodeDecodeError:
            continue
        if PLACEHOLDER in text:
            path.write_text(text.replace(PLACEHOLDER, slug))

    grafted = []
    # Ordered, so `measure` sees `core` regardless of how they were listed.
    for unit in ("core", "measure", "release"):
        if unit in units:
            grafted += GRAFTS[unit](dest)

    rel = dest.relative_to(Path.cwd()) if dest.is_relative_to(Path.cwd()) else dest
    print(f"{rel}")
    for item in grafted:
        print(f"  grafted  {item}")
    print()
    print("Next:")
    print(f"  1. Fill in {rel}/SPEC-SHEET.md — the digest it rests on, and how you")
    print("     will know it worked. Delete the file once the instrument plays.")
    if "core" in units:
        print(f"  2. cd {rel} && npm install")
        print("  3. ./run.sh          serve and listen")
        if "measure" in units:
            print("     npm run render    bounce and measure")
            print("     npm test          regression gates")
    else:
        print(f"  2. cd {rel} && ./run.sh")
        print(f"  3. Graft the rack when you need it — see {STUDIO.name}/rack/README.md")


if __name__ == "__main__":
    sys.exit(main())
