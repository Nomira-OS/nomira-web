---
weight: 50
title: Frontend
lead: "How the BuildKit frontend works: phases, groups and the check that groups are independent."
---

## What it does

A Containerfile is a chain: change one step, and all that follow run
again. The nomira frontend describes a build in **phases** and
**groups** instead.

- **Phases** run one after another.
- **Groups** of a phase are independent of each other. They all start
  from the same state, run at the same time and are cached one by one.
- At the end of the phase their results are merged.

When a group changes, only that group is rebuilt, not its siblings.

## Independence is verified

The recipe only claims that groups are independent. The frontend checks
it on every build: it determines which files each group has written or
deleted. If two groups overlap, the build aborts and names the groups
and the path.

```text
phase "configs": declared-independent groups are not disjoint (policy: strict):
  groups "a" and "b": /etc/a (both write)
```

## Groups that do not depend on what came before

A group without `run` only copies files. It never sees the state before
it, so the frontend builds it apart from that state and merges the
result, the way `COPY --link` works in a Dockerfile. Neither a new base
image nor a change in an earlier phase rebuilds such a group.

This is done only where it provably gives the same tree. A check on
every build compares the group with the state before it and falls back
to building on that state otherwise, with a warning in the build output. See
[What gets rebuilt](../recipes/rebuilds/).

## Collectors

A phase can also be a single command that receives a list: every group
may contribute words to it. That is how packages are installed in one
transaction while each feature still names its own. The frontend knows
nothing about package managers; a collector is any command. See
[Collectors](../recipes/collectors/).

## How it is tested

Besides unit tests, every change builds a set of small recipes with a
real BuildKit and checks the results: conflicts between writes and
deletions, collectors, imports, that a group without `run` comes from
the cache after the base image changed, and that symbolic links and
directory modes survive. No image of the frontend is published unless
these pass.

## What it deliberately is not

- **Not a collection of modules.** There are three commands: `run`,
  `copy` and `env`, and collectors that pass a list to a command of your
  choice. Everything else is shell.
- **Not declarative.** A recipe lists commands that run in order. What
  the frontend adds is structure: which steps are independent, and the
  proof that they are.
- **Not a replacement for a Containerfile in every case.** It pays off
  where a build has many independent parts.
- **Not stable yet.** The schema may change, hence the tag `1-alpha`.

Source: [github.com/Nomira-OS/nomira](https://github.com/Nomira-OS/nomira)
