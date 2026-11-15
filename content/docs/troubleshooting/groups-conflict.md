---
title: Groups conflict
lead: The build stops with "declared-independent groups are not disjoint".
weight: 10
---

## The message

```text
phase "configuration": declared-independent groups are not disjoint (policy: strict):
  groups "a" and "b": /etc/a (both write)
```

Two groups of the same phase changed the same file. Groups of a phase
build at the same time from the same state, so neither result could
include the other's change. The build stops before anything is merged.

This has been tried: two groups that both write `/etc/a` produce exactly
this message.

## Seeing it for yourself

```yaml
phases:
  - name: content
    groups:
      a: ["run echo a > /etc/a"]
      b: ["run echo b > /etc/a"]
```

## What to do

**The steps belong together.** Put them into one group. They then run
one after another.

**One has to come after the other.** Put them into different phases.
The later phase sees the result of the earlier one.

**Both write the same content.** Two tools that each create the same
file with identical content are harmless. Allow that for the phase:

```yaml
  - name: configuration
    validation: allow-identical
```

**The overlap is intended.** Exempt the path from the check. A trailing
`/` exempts everything below it:

```yaml
  - name: configuration
    shared: [/usr/lib/tmpfiles.d/]
```

For an exempted path, the result is whatever the merge produces. Use
this only when you know that the order does not matter.

## The usual suspect: packages

Two groups that both install packages always conflict, because both
write the package database. Put all package installations of a phase
into one group.
