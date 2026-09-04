# Audio pre-flight checklist

Measurement targets for a render, and the failure each one catches. Distilled from psytrance and house deconstructions, where "hot" — slammed, over-saturated, crest crushed — was the recurring way a take went wrong without anyone hearing it go wrong on the pass that produced it.

The targets below are one working set. They are not derived from a loudness standard; they are what held up in practice on that material.

## 1. The hard gate

| Check | Threshold | Why |
|---|---|---|
| **true-peak** | ≤ −1 dBFS | inter-sample clipping |
| **clipped samples** | 0 | hard clipping |
| **crest factor** (peak − RMS) | **≥ 9 dB**, fail below 7 | **the "too hot" detector** — slammed audio has low crest; a healthy mix is 9–13 |
| **DC offset** | < 0.003 | a render bug, or asymmetric drive |
| **width** (side/mid) | full mix around −10 to −20 dB | near-mono reads thin; above −2 is phasey. A solo mono stem such as a bass reading near-mono is expected |

Worth running on every stem and every full take. A warning that has an explanation — a mono bass stem — is different from a failure.

## 2. Don't out-slam the reference

Measure the reference track too and match its crest rather than beating it. A real commercial master often sits around 10.5 dB crest; a render at 7 is louder and worse.

## 3. Mastering as glue, not a brickwall

A tanh master around **0.6** keeps a healthy crest. At **2.0** it slams crest to roughly 5 dB, which ships hot on every take. Genuinely saturated genres can push higher, but the crest reading has to be checked again after. Keeping a pre-limiter trim on the master preserves the headroom that makes this adjustable at all.

## 4. Offline-render caveats — absolute levels lie

`node-web-audio-api` under-limits, and a gated-reverb convolver can run away, so absolute peaks read hot offline. **Relative A/B deltas are faithful; an absolute level needs a browser confirmation** or the limiter bypassed. An offline peak is not a final number.

## 5. Level-match before A/B

Normalise compared takes to the same peak, around −3 dBFS, so that "louder" cannot masquerade as "better".

## Spectral and sound-design sanity

- **Kick owns the sub; the bass sits above it.** High-pass the bass above the kick's sub band, around 55 Hz, or the mix reads as a kick at full sustain. Measure the bass at an **exposed section** where the drums drop out — a whole-track separated stem carries kick bleed into the bass stem.
- **One energy-weighted metric is blind to low-energy harmonic shifts.** A filter change can be inaudible to a spectral centroid and very audible to a listener. Read a band table — sub, low, low-mid, high-mid — rather than a single number.
- **Width lives in the synth and stab layers, not the bass.** Bass stays mono and centred.

## Process discipline

- After **one** failed tuning attempt, instrument and measure rather than iterating blind. Blind iteration on a mix costs passes and produces mud.
- **Verify the parameter reaches the render** before concluding a knob is dead. Check the merged config, and check the value survives the merge chain. An edit that silently failed to apply looks exactly like a parameter that does nothing.
