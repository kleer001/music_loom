# Machinedrum p-lock decode — parked research note

Reference notes for a possible future upgrade to `plockGen()` / `lockSet()`: replacing the
estimated p-lock **value** distributions with ones measured from Autechre's released Machinedrum
sysex.

This is **parked, not blocked**. The path is known and fully offline; the cost/benefit just does
not justify it yet.

Nothing of Autechre's would ship. The output is a statistical fingerprint — how often a lock lands,
on which parameters, over what value spread. The values in the instrument stay original.

---

## Status

**Not a blocker: network or data availability.** The `.syx` dumps are public. Autechre released the
Monomachine and Machinedrum sysex from their 2008 Quaristice-era live rig, distributed through their
[Bleep store page](https://bleep.com) (bottom of the page, the four dashes) alongside Nord G2
presets and MPC programs.

**The actual blocker: nobody has published a decoded Machinedrum parameter-lock table.** Elektron's
Rytm and Digitone formats have community reverse-engineering; the Machinedrum lock format does not.
Every tool that touches it stops at the same place:

- `carrierdown/elektron-sysex-to-midi` extracts the lock blocks and then ignores them — the decoded
  bytes are assigned to locals and never read. It ships only its MIDI **output** (128 `.mid` files,
  one per pattern), not the raw dumps.
- `rmoetwil/elektron-sysex-processor` has `internal/elektron/machinedrum/pattern.go` and `kit.go` as
  one-line stubs — a `package machinedrum` declaration and nothing else. Its README notes it tests
  against the Autechre 2008 files but does not include them.

So finishing this means **original reverse engineering** (the byte-diff method below). That work
needs no network and no hardware once the dumps are on disk — only patience.

## Why it is low priority

The half of `plockGen()` that matters most is already real. Lock **placement** is weighted by
`STEP_W = [16,2,4,2,14,2,5,3,11,5,7,3,13,3,5,4]`, the measured 16th-note trigger histogram from the
128 released Machinedrum patterns. That is the part that gives the grooves their gait, and it is
already measured data.

A decode would only upgrade `lockSet()`'s lock **values** — the per-parameter ranges and target
weights — from documented-technique estimates to measured ones. That is a subtle refinement to a
distribution, not a new capability, and it changes nothing structural in the audio engine.

## Sysex format

Pattern message header (9 bytes): `F0 00 20 3C 02 00 67 03 01`. Offsets below are relative to the
start of the message, and the lengths are raw (pre-unpack) byte counts.

| field | offset | length | notes |
|---|---|---|---|
| trigs, steps 1–32 | `0x0A` | 74 | 4 bytes/track = 32 bits/track |
| **lock placement** | **`0x54`** | **74** | same shape as the trig bitmask — which steps carry locks |
| accent pattern | `0x9E` | 19 | |
| accent amount | `0xB1` | 1 | |
| pattern length | `0xB2` | 1 | |
| tempo multiplier | `0xB3` | 1 | |
| scale | `0xB4` | 1 | |
| kit # | `0xB5` | 1 | which kit this pattern uses |
| **lock data** | **`0xB7`** | **2341** | **the p-lock values** |
| extra pattern | `0x9DC` | 234 | |
| trigs, steps 33–64 | `0xAC6` | 2647 | extra block |
| terminator | `0x1521` | 1 | `0xF7` — sanity check on the whole message |

### 7-bit unpacking

Elektron packs 8-bit data into MIDI's 7-bit bytes: each group of 8 transmitted bytes is one MSB
byte carrying the high bits of the 7 that follow. Decoded length is
`((len / 8) * 7) + (len % 8 > 0 ? (len % 8) - 1 : 0)`. `carrierdown`'s `ProcessEncodedChunk()` and
`DataLengthToByteLength()` already implement this correctly, so the `0xB7` blob comes out
extracted — just uninterpreted.

## Decode method

1. **Unpack** the `0x54` and `0xB7` blocks with the routine above.
2. **Decode the lock table** — the open work. Expect per-track parameter-lock lanes: for each locked
   parameter, a per-step value table with a sentinel meaning "not locked here." Undocumented, so use
   the **diff test** — take two dumps that differ by one known lock, compare the `0xB7` block
   byte-for-byte, and watch which bytes track which lock. Fully offline; no Machinedrum required.
   The `0x54` placement bitmask is the cross-check: whatever the table decodes to must agree with it
   about which steps are locked.
3. **Map parameter index → meaning** — needs the **kit** dump. Which machine (SID/TRX/EFM/RAM/…)
   sits on each track determines what "param #12" is. Cross-reference the Machinedrum param/CC map
   in the manual's Appendix B.

## References

- `carrierdown/elektron-sysex-to-midi` — the unpacker and every offset in the table above
  (`MDSysExToMidi/Program.cs`); also the source of the 128 pattern MIDI files.
- `bsp2/libanalogrytm` — `pattern.h` is the most thoroughly analyzed Elektron lock format. Rytm, not
  Machinedrum, but the same philosophy: per-track parameter arrays plus a sentinel.
- `rmoetwil/elektron-sysex-processor` — confirms Machinedrum and Monomachine share message framing;
  its `internal/elektron/common/unpack.go` is a second reading of the 7-bit scheme.
- [Elektronauts thread on the Autechre MD/MnM sysex files](https://www.elektronauts.com/t/autechre-md-mnm-sysex-files-mpc-nord/67208)

## Where the fingerprint would land

`index.html` → `plockGen()` / `lockSet()`. Today:

- **placement** — `STEP_W`, measured.
- **values and targets** — hand-tuned estimates from documented technique. `lockSet()` picks 1–2
  keys per bass lock from `cut`/`dec`/`pit`/`tim`/`vow`, one of `tune`/`dec`/`lvl` per drum lock,
  and pushes ~15% of them to a rail.

A decode would replace the second bullet with measured per-parameter lock frequency, value
distributions, and per-track density. Structural only — no change to the audio engine.
