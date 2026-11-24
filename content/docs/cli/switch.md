---
title: Build and switch
lead: nomira build builds and checks the image; nomira switch hands it to bootc.
weight: 20
untested: true
---

## nomira build

1. **Find buildkitd**, in this order: `BUILDKIT_HOST` if set; a
   buildkitd running locally (first the user's own at
   `$XDG_RUNTIME_DIR/buildkit/buildkitd.sock`, then the system-wide one
   at `/run/buildkit/buildkitd.sock`); otherwise a podman container
   `nomira-buildkitd`, which the CLI creates when needed.
2. **Build** the recipe with `buildctl`. The check of the groups runs in
   the frontend. The result is an OCI directory,
   [see where](../commands/#where-the-result-goes).
   BuildKit only writes layers that are not there yet.
3. **Check** the image, see below. The checks run it from
   containers-storage, so only for them is it copied there.
4. **Record** that the image passed: `<name>.oci.checked` next to the
   directory holds its digest.

`build` never touches the running system.

## nomira switch

`bootc switch --transport oci` with that directory, nothing else. bootc
reads the directory and imports only the layers it does not have yet.
Staging, the boot entry, `bootc rollback` and `bootc status` are bootc's.
`switch` refuses an image that has not passed the checks of
`nomira build`, or that has changed since.

```sh
sudo nomira build
sudo nomira switch          # --apply reboots right away
```

## As root or not

On a nomira system, run both with `sudo`. `build` then uses the
system-wide buildkitd, which the base image starts on demand.

Without root, `build` falls back to the podman container, and `switch`
calls `sudo` for bootc. This is meant for developing recipes on another
machine.

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
