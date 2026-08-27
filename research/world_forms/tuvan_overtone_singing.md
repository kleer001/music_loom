# Tuvan overtone singing (khoomei)

## 1. Tuning

The sung fundamental is a drone; the melodic content is a **selection among its harmonics**, so the available pitches are the harmonic series over that fundamental rather than a scale. Intervals are therefore just by construction.

## 2. Instrumentation

The voice, and the finding here is unusually well established. *Overtone focusing in biphonic Tuvan throat singing* ([eLife](https://elifesciences.org/articles/50476); [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7064340/)) is peer-reviewed, open-access, and directly implementable.

The mechanism:

- A **low fundamental** sounds continuously — the source.
- The singer shapes the vocal tract to **merge two formants** into a single narrow, high-gain filter state centred at **1–2 kHz**.
- That focused filter selects one harmonic of the source and greatly amplifies it, producing the whistle-like upper voice over the drone.

The paper's load-bearing conclusion for anyone building this: **the biphonation arises from linear filtering, not from a nonlinear source.** A source/filter model captures the behaviour, including the sudden transitions into the focused state. Nonlinearities are not required.

That maps onto Web Audio almost directly — a harmonically rich source into two closely-spaced high-Q bandpass filters whose centres converge, with the melody carried by sweeping the merged centre frequency across successive harmonics. No worklet needed.

Styles differ in where the emphasis sits: **sygyt** is the high, flute-like focused whistle; **kargyraa** is a low chest-resonant style; **khoomei** the mid-range between them ([Tuvan throat singing](https://en.wikipedia.org/wiki/Tuvan_throat_singing)).

## 3. Performance structure

Not surveyed. The drone-plus-selected-harmonic texture is the structural fact: one continuous fundamental, melody in the filter rather than in the source.
