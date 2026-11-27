---
title: Build and deploy
lead: nomira build builds, checks and publishes an image; bootc takes it from there.
weight: 20
untested: true
---

## nomira build

1. **Find buildkitd**, in this order: `BUILDKIT_HOST` if set; a
   buildkitd running locally (first the user's own at
   `$XDG_RUNTIME_DIR/buildkit/buildkitd.sock`, then the system-wide one
   at `/run/buildkit/buildkitd.sock`); otherwise a podman container
   `nomira-buildkitd`, which the CLI creates when needed.
2. **Build** the recipe with `buildctl` into a work directory. The check
   of the groups runs in the frontend. BuildKit only writes layers that
   are not there yet.
3. **Check** the image, see below. The checks run it from
   containers-storage, so only for them is it copied there.
4. **Publish** it to the output directory,
   [see where](../commands/#where-the-result-goes). That directory only
   ever holds an image that passed its checks.

`build` never touches the running system. It passes the files that
`--secret` or `nomira.conf` names to the steps that mount them as
secrets; a secret the recipe requires but nobody gives stops the build
before it starts.

## Deploying is bootc's

nomira has no command that changes the running system. The output
directory is an image source, like a registry, and bootc follows it:

```sh
sudo nomira build      # build, check, publish
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
root, it falls back to the podman container; this is meant for
developing recipes on another machine.

## The checks

**Your own hooks.** Every `validation.d/*.sh` next to the recipe runs in
sorted order, with the image name in `$IMG`. A hook that fails fails the
build. Example, `validation.d/10-lint.sh`:

```sh
podman run --rm "$IMG" bootc container lint --fatal-warnings
```

**The boot test.** If `bcvk` is installed, `bcvk ephemeral test-basic`
boots the image in a throwaway VM. The VM starts with
`systemd.firstboot=off` so that it does not wait for the first-boot
prompts. Without `bcvk` the test is skipped with a note;
`--no-boot-test` skips it on purpose.

The boot test connects over SSH. It therefore needs a network service
and `sshd` to be active in the tested image; otherwise it runs into a
timeout. The bare base image has neither.

`nomira validate` runs the same checks without building.
