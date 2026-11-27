---
title: Build and deploy
lead: nomira build builds and publishes an image; bootc takes it from there.
weight: 20
untested: true
---

## nomira build

1. **Find buildkitd**, in this order: `BUILDKIT_HOST` if set; a
   buildkitd running locally (first the user's own at
   `$XDG_RUNTIME_DIR/buildkit/buildkitd.sock`, then the system-wide one
   at `/run/buildkit/buildkitd.sock`); otherwise a podman container
   `nomira-buildkitd`, which the CLI creates when needed.
2. **Build** the recipe with `buildctl` into a work directory. The
   conflict check of the groups and every check the recipe runs itself
   happen during the build, see below. BuildKit only writes layers that
   are not there yet.
3. **Compare versions**: the frontend's, from the label it wrote into
   the image, with the CLI's.
4. **Publish** it to the output directory,
   [see where](../commands/#where-the-result-goes). That directory only
   ever holds an image of a build that succeeded.

`build` never touches the running system. It passes the files that
`--secret` or `nomira.conf` names to the steps that mount them as
secrets; a step that requires a secret nobody gives fails, and BuildKit
says which.

## Deploying is bootc's

nomira has no command that changes the running system. The output
directory is an image source, like a registry, and bootc follows it:

```sh
sudo nomira build      # build and publish
sudo bootc upgrade     # take the new image; --apply reboots right away
```

A system installed as in
[Installation](../../getting-started/installation/) follows the output
directory from the start. Any other one is pointed at it once:

```sh
sudo bootc switch --transport oci /var/lib/nomira/mysystem.oci
```

`bootc status`, `bootc rollback` and bootc's automatic update timer work
as with any other image source.

## As root or not

On a nomira system, run `nomira build` with `sudo`. It then uses the
system-wide buildkitd, which the base image starts on demand. Without
root, nomira falls back to a buildkitd in a podman container, on a
machine that has podman; this is meant for developing recipes on another
machine. The base image has no container runtime.

## Checks

Checks of the image are steps of the recipe, so they run on every build,
are cached like any other step, and a failing one stops the build before
anything is published. The base image's
[recipe part `lint.yml`](https://github.com/Nomira-OS/arch-base/tree/main/recipes)
adds `bootc container lint` as the last phase:

```yaml
build:
  # … the other phases …
  lint:
    bootc: ["run bootc container lint --fatal-warnings"]
```

To boot an image before switching to it, see
[Try it in a VM](../../getting-started/vm/).
