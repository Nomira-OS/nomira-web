---
weight: 30
title: Client
lead: What the client decides, how nomira.conf sets it, and how CLI and frontend find out whether they fit.
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

`nomira build` is one buildctl call between steps of its own:

1. Find a buildkitd: `BUILDKIT_HOST`, a local socket, or a podman
   container it manages.
2. `buildctl build` into a work directory, an OCI layout, with
   `rewrite-timestamp=true` and the client options. The image name comes
   from `--name`, else `system` for the recipe in `/etc`, else the recipe
   directory's name. Secrets a step requires but nobody gives fail that
   step in BuildKit.
3. Read the image config from the work directory and compare the label
   `org.nomira.frontend.version` with the CLI's version.
4. Publish: link the blobs into the output directory and replace its
   `index.json` in one step.

Checks of the image are steps of the recipe (`run bootc container lint`),
so a build that fails one never publishes. `nomira lint` and resolving a
recipe for `nomira recipe` go through BuildKit as well, with the build
option `mode`; the CLI needs no container runtime but for a buildkitd it
manages.

bootc then follows the output directory like a registry; see
[Deployment](../deployment/). Commands and flags:
[CLI](../../cli/commands/).

## nomira.conf

Flags for repeated runs, one `flag = value` per line, next to the recipe
(`/etc/nomira/nomira.conf` for the machine's own recipe). The command line
and a flag's environment variable win. Unknown names are errors; flags of
other commands are skipped. Relative paths are relative to the file. The
frontend never reads it.

```ini
name = laptop
secret = id=db.key,src=keys/db.key
pull = always
```

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

Every commit on `main` is published as `sha-<commit>` and moves `latest`,
for the frontend and the base image. `latest` is for trying things out:
a recipe that should build the same tomorrow names a `sha-…` tag or a
release. BuildKit resolves the tag of `# syntax=` against the registry on
every build; `pull = always` makes BuildKit fetch moved tags of base
images and stages as well (`image-resolve-mode=pull`).
