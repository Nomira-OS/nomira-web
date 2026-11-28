---
weight: 30
title: Client
lead: What only the client decides, and how CLI and frontend find out whether they fit.
---

## Who decides what

BuildKit takes the exporter and its options, the platform, the image
names, secrets and the pull policy only from its client. A frontend
cannot set them; it can only hand the exporter metadata. Hence the split:

| Decided by | What |
|---|---|
| Recipe (frontend) | base image, imports, phases, groups, stages, labels, env, mounts, `source_date_epoch`, `record` |
| Frontend → exporter | image config (labels, among them `org.nomira.frontend.version`, `created`, entrypoint, env), the epoch, the base config |
| Client (CLI flags, `nomira.conf`) | output format and place, layer compression, `rewrite-timestamp`, secret files, pull policy, image name |

The rule: what has to be a client option does not belong in the recipe.
Any BuildKit client can build a recipe; `buildctl` with the
[options in the frontend's README](https://github.com/Nomira-OS/nomira#building-a-recipe)
is enough.

## The nomira CLI

`nomira build` is one buildctl call between steps of its own: it finds a
buildkitd, builds into a work directory, compares the frontend's version
with its own and publishes the image only when the build, with every
check the recipe runs, succeeded. The steps in detail: [Build and
deploy](../../operating/build-and-deploy/#nomira-build). Its flags can
also come from [nomira.conf](../../cli/commands/#nomiraconf), which the
frontend never reads.

`nomira lint` and resolving a recipe for `nomira recipe` go through
BuildKit as well, with the build option `mode`; the CLI needs no
container runtime but for a buildkitd it manages. bootc then follows the
output directory like a registry, see [Deployment](../deployment/).

## Versions

Frontend and CLI report their versions: semver for releases,
`sha-<commit>` for other builds. The frontend writes its version into
every image (`org.nomira.frontend.version`) and into the answer of lint
and resolve; the CLI compares `major.minor` after each of them; patches
do not matter. A mismatch, or a version that is
not a release, is a warning, never an error. CLI and frontend are
therefore released together whenever `major.minor` changes; no table of
compatible versions is kept anywhere.

## Tags and pull policy

Every commit on `main` is published as `sha-<commit>` and moves
`latest`, for the frontend and the base image. A recipe that should
build the same tomorrow names a `sha-…` tag or a release, never
`latest`. BuildKit resolves the tag of `# syntax=` against the registry
on every build; `pull = always` makes BuildKit fetch moved tags of base
images and stages as well (`image-resolve-mode=pull`).
