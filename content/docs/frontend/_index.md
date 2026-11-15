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

## What it deliberately is not

- **Not a collection of modules.** There are three commands: `run`,
  `copy` and `env`. Everything else is shell.
- **Not declarative.** A recipe lists commands that run in order. What
  the frontend adds is structure: which steps are independent, and the
  proof that they are.
- **Not a replacement for a Containerfile in every case.** It pays off
  where a build has many independent parts.
- **Not stable yet.** The schema may change, hence the tag `1-alpha`.

Source: [github.com/Nomira-OS/nomira](https://github.com/Nomira-OS/nomira)
