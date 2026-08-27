# The rack

Apparatus held in the studio until an instrument reaches the rung that wants it.

**Grafted by copy.** Each unit's README lists what to copy and what conventions come with it. Copying is cheap, and it lets the instrument tune what it copied — a render harness wants per-instrument thresholds, a publishing script wants per-instrument trim values. A shared copy would hold one instrument's configuration and be wrong for every other.

The cost is that improvements here do not propagate on their own. That is what the changelog directives are for (`CONTRIBUTING.md`).

| Unit | Rung | Graft when |
|---|---|---|
| `R1-spec` | Spec and panel | Shaping the idea, and again once it plays |
| `R2-core` | Shared core library | Real audio code is being written |
| `R3-measure` | Offline render and metrics | Something makes sound and needs verifying |
| `R4-release` | Publishing and release gate | Heading for a page someone else will read |
| `R5-fx` | Effects | A delay, a reverb, a mixer, a master bus |
| `R6-voices` | Sound sources | Synthesised or sampled voices, rather than fresh ones |

The rungs are an order of arrival, not gates. Nothing stops an instrument grafting R3 on its first afternoon; most want R2 first because there is nothing to measure yet.

R5 and R6 have prerequisites the others do not, because their modules reach sideways: `R5-fx/dsp/` resolves `../core/`, and `R6-voices/voices/persistent.js` resolves both `../core/` and `../dsp/`. Grafted into `<instrument>/core/`, `<instrument>/dsp/` and `<instrument>/voices/`, those paths already point where they should.

`checks/` grafts R2, R5 and R6 together and proves the result resolves, plays, and reports the determinism each contract actually has. `cd rack/checks && npm install && npm run check`.
