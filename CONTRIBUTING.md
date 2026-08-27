# Contributing — changing a studio convention

Read this when changing something instruments inherit. Ordinary work inside one
instrument does not need it.

## The tie

Every budded instrument carries `.music_loom.toml`:

```toml
version = "0.1.0"
mother = "https://github.com/kleer001/music_loom.git"
```

It records the studio version the instrument descends from, and where to fetch
the studio. When a convention here improves, the instrument pulls it forward as
a **proposal**, never as an automatically applied patch.

From the instrument's root:

```sh
python3 /path/to/music_loom/scripts/check_updates.py .
```

Every directive logged between the instrument's stamp and the current `VERSION`
prints into the session. The session reads them, consults the referenced files,
and proposes changes to the user. After the directives are actually resolved:

```sh
python3 /path/to/music_loom/scripts/check_updates.py . --mark-read
```

which advances the stamp. Advancing it before resolving the directives loses
them silently.

Do not hand-edit `.music_loom.toml`. The stamp is the state the update mechanism
reasons from.

## What moves together

Every convention change is one commit carrying four things:

1. The payload — the changed file in `template/`, `rack/`, a persona, a gate, a
   section of `CLAUDE.md`.
2. A `VERSION` bump.
3. A `CHANGELOG.md` directive at the right tier.
4. `template/.music_loom.toml` set to the new version, so a newly born
   instrument starts current.

Miss the fourth and every instrument born after the change immediately reports
itself out of date.

## Versioning

`VERSION` is semver and the single source of truth. Bump it whenever a
convention changes. The tier in the changelog carries the severity; the version
number carries the ordering.

## Directives are written for a reader who was not here

A daughter's session reads the directive with no memory of the discussion that
produced it. Name paths that exist. State the trigger as a condition that can be
checked against the daughter. Give a skip condition. Do not write "as discussed",
"now that X is fixed", or a count that will be wrong next month.

## Rack units are grafted by copy

A rack unit is copied into an instrument, not linked or depended on. Copying is
cheap and it lets the instrument tune what it copied — a render harness gets
per-instrument thresholds, a publishing script gets per-instrument trim values.
A shared copy would hold one instrument's configuration and be wrong for the
rest.

The cost is that improvements do not propagate on their own. That is what the
changelog directives are for.

## Upstream

An instrument that finds something worth having here writes it into
`please_add_me.md` at this repo's root — what it found, why, and what it would
change. Adopted proposals land as a changelog directive and a version bump.
Declined ones get a line saying why. Either way the instrument learns the
outcome on its next update check.
