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
| Recipe (frontend) | base image, args, phases, groups, stages, labels, description, env, `source_date_epoch`, `volatile`, `record` |
| Frontend → exporter | image config (labels, `created`, entrypoint, env), the epoch, the base config |
| Client (CLI flags, `nomira.conf`) | output format and place, layer compression, `rewrite-timestamp`, secret files, pull policy, image name |

The rule: what has to be a client option does not belong in the recipe.
Any BuildKit client can build a recipe; `buildctl` with the
[options in the frontend's README](https://github.com/Nomira-OS/nomira#building-a-recipe)
is enough.

## The nomira CLI

`nomira build` is one buildctl call between two steps of its own:

1. Find a buildkitd: `BUILDKIT_HOST`, a local socket, or a podman
   container it manages.
2. `inspect` the recipe through the frontend image (podman): name, secret
   ids, frontend version.
3. `buildctl build` into a work directory, an OCI layout, with
   `rewrite-timestamp=true` and the client options.
4. Run the checks (`validation.d`, `bcvk`), then publish: link the blobs
   into the output directory and replace its `index.json` in one step.

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
`sha-<commit>` for other builds. Before a build the CLI compares
`major.minor`; patches do not matter. A mismatch, or a version that is
not a release, is a warning, never an error. CLI and frontend are
therefore released together whenever `major.minor` changes; no table of
compatible versions is kept anywhere.

## Tags and pull policy

Every commit on `main` is published as `sha-<commit>` and moves `latest`,
for the frontend and the base image. `latest` is for trying things out:
a recipe that should build the same tomorrow names a `sha-…` tag or a
release. BuildKit resolves the tag of `# syntax=` against the registry on
every build; `pull = always` makes podman (for `inspect`, `lint`,
`resolve`) and BuildKit (base images, `image-resolve-mode=pull`) fetch a
moved tag as well.
