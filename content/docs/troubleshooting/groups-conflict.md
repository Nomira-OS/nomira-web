---
title: Groups conflict
lead: The build stops with "its groups are not independent".
weight: 10
---

## The message

```text
phase "configuration": its groups are not independent:
  groups "a" and "b": /etc/a (both write, with different content, mode or owner)
  fix: make it one group, or move one of them into a phase of its own
```

Two groups of the same phase changed the same file differently. Groups
of a phase build at the same time from the same state, so neither result
could include the other's change, and the outcome would depend on an
order the recipe does not give. The build stops before anything is
merged.

Other reasons in the message: `write vs delete` (one group writes what
the other deletes), `group "x" deletes directory /…` (a write below a
directory another group removes).

## Seeing it for yourself

```yaml
build:
  content:
    a: ["run echo a > /etc/a"]
    b: ["run echo b > /etc/a"]
```

With `echo same` in both groups the build passes: the same content,
mode and owner from two groups is what either order gives.

## What to do

**The steps belong together.** Put them into one group. They then run
one after another.

**One has to come after the other.** Put them into different phases.
The later phase sees the result of the earlier one.

There is no switch to allow a conflict: two groups that write a file
differently need an order, and the order belongs in the recipe. How the
check decides is described in
[The conflict check](../../architecture/conflict-check/).

## The usual suspect: packages

Two groups that both install packages always conflict, because both
write the package database. Let the groups name their packages and
install them in one step with a [collector](../../recipes/collectors/).

A file that a step rewrites with unchanged content counts as written as
well: its layer would still cover what the other group writes there. A
group that edits a file in place (`sed -i`) is such a case.
