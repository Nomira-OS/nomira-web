---
weight: 10
title: The build
lead: From the recipe to layers.
---

## Recipe to LLB

The frontend runs as a BuildKit
[gateway frontend](https://docs.docker.com/build/buildkit/frontend/):
BuildKit starts its image (`# syntax=` or `--frontend gateway.v0`), the
frontend reads the recipe through the gateway, builds an
[LLB](https://github.com/moby/buildkit#exploring-llb) graph and asks
BuildKit to solve it.

1. **Load.** The entry file, then every file it imports, one by one; an
   import by URL BuildKit fetches itself. From the build context only
   the paths `copy` names. Nothing else leaves the client.
2. **Merge.** [Imports](../../recipes/imports/) are merged as JSON Merge
   Patch into one document, the resolved recipe.
3. **Parse.** Strict: unknown keys are errors, with file and line.
   Collectors get their items. With the build option `mode=lint` or
   `mode=resolve` the frontend stops here and answers.
4. **Compile.** Phase by phase, with real results in between (see below).
5. **Export.** BuildKit's exporter writes the image. Its options come
   from the client; the frontend contributes the image config, the epoch
   and the base config (see [Client](../client/)).

## Phases, groups, collectors

| Element | LLB | Cache key depends on |
|---|---|---|
| Phase | the state `S` all its groups start from | everything before it |
| Group with `run` | `Exec` on `S`, then `Diff(S, result)` | `S` and the group's commands |
| Group without `run` | built on `scratch`, merged as is | only the group's commands and copied files |
| Merge of a phase | `Merge(S, Δ₁ … Δₙ)` ([MergeOp](https://github.com/moby/buildkit/blob/master/docs/dev/merge-diff.md)) | the layers merged |
| Collector | a group with one `Exec` on `S` with `${items}` | `S` and the sorted items |
| Collector that fans out | see below | per bucket: `S` and the bucket's files |
| Stage | its own `Image` | its base and commands |

A phase with a single group that runs is serial: no diff, no merge, no
check.

## Checks during the build

- **Conflicts.** For a phase with several groups, small execs list what
  each group wrote and deleted and hash what several groups wrote; the
  frontend compares the groups. A conflict stops the build before
  anything is merged on top of it. See
  [The conflict check](../conflict-check/).
- **Guard.** A group without `run` is only built on `scratch` when merging
  provably gives the same tree as building it on `S` (no symbolic links,
  modes or types in the way). Otherwise it falls back, with a warning in
  the step names.
These execs mount whole systems read-only and are named `[check …]` in
the output.

- **Buckets.** For a collector that fans out, pass 1 of the conflict
  check runs between its buckets, strictly: a file in two buckets is a
  conflict.

The build option `check=off` (`nomira build --no-check`) skips the
conflict checks between groups and between buckets; the guard stays.

## A collector that fans out

What runs in which order, and what runs side by side. Every box on one
level runs in parallel; a level starts when what it needs is done.

```text
S  (the state the phase starts from)
│
├─ resolve ──────────────────────────────── 1 exec on S, solved at once:
│    prints: name  URL  sha256:<hex>  [key]   the frontend reads the list
│                                             before it builds the rest
├─ fetch file 1 │ fetch file 2 │ … │ file n   BuildKit, by checksum, parallel,
│                                             cached across all builds
├─ each bucket 03 │ each bucket 17 │ …        1 exec per bucket on S, parallel;
│    /nomira/in: the bucket's files            an unchanged bucket is cached
│    /nomira/out → the bucket's layer          and its layer exported as before
│
├─ check: no file in two buckets ─────────── pass 1 per bucket, parallel
│                                             (skipped with check=off)
├─ Merge(S, bucket layers…) ──────────────── order fixed, decides nothing
│
└─ then ─────────────────────────────────── 1 exec on the merged result,
     /nomira/in: all files                    reruns when any bucket changed
     → the collector's result, merged with the other groups of the phase
```

A file's bucket depends on its key alone, by rendezvous hashing over 64
buckets: adding or removing a file changes only its own bucket, and
every bucket is built on `S` on its own, so no bucket waits for another.
The later phases wait for `then`, as they wait for any phase.

## Cache keys

BuildKit keys a step by its definition and its inputs. For read-only
bind mounts it would by default checksum every file of the mounted tree
([content-based cache](https://github.com/moby/buildkit/blob/master/solver/llbsolver/ops/exec.go));
the frontend turns that off for bind mounts and checks, since the
definition of the mounted phase identifies it as well and a whole system
takes seconds to checksum. Cache mounts, tmpfs and secrets never enter a
key.

## Reproducibility

| Source of difference | Handled by |
|---|---|
| File times in layers | client: `rewrite-timestamp=true` clamps them to the epoch |
| Image creation time | frontend: config `created` is the epoch |
| Tools reading the time (dracut, …) | frontend: `SOURCE_DATE_EPOCH` in every `run` |
| Logs, caches, temp files | recipe: `settings.mounts`, a tmpfs there |
| pacman install dates | base image: a pacman hook sets them to the epoch |
| Package versions | base image: the mirrorlist points to a dated archive snapshot |

The epoch is `settings.source_date_epoch`, by default the creation time
of the base image. The base image itself is checked by building it twice
without cache and comparing all layers.

## The record

The resolved recipe is written to the image's label `org.nomira.recipe`.
A label belongs to the config, so it is covered by the image digest and
its signature but is no layer: a change to the recipe alone rebuilds no
step. `nomira recipe export` and `diff` read it.
