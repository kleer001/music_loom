# The rack

Apparatus, kept here until an instrument wants it.

A rack unit is not a dependency and not a generator. It is a directory you copy, whole, into the instrument that needs it — and from that moment it belongs to that instrument, to tune and cut and rewrite as its own. A render harness wants thresholds particular to the thing it is measuring. A publishing script wants trim values nobody else's instrument would recognise. Shared, those would be one instrument's settings imposed on all the others; copied, they are just the instrument's own code.

Each unit's README says what to copy and what it expects to find beside it. The rungs are an order of arrival rather than a sequence of gates — nothing stops an instrument taking the measurement harness on its first afternoon, though most reach for the core library first, having nothing to measure yet.

Improvements made here do not chase the copies that already left. That is what the changelog directives are for; `CONTRIBUTING.md` explains the tie.

`checks/` grafts the code units together the way an instrument would and proves the result resolves, plays, and reports the determinism each contract actually has.

```sh
cd rack/checks && npm install && npm run check
```
