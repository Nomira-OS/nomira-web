---
title: What switch does
lead: nomira switch builds, checks and only then touches the running system.
weight: 20
untested: true
---

## The steps

1. **Find buildkitd**, in this order: `BUILDKIT_HOST` if set; a
   buildkitd running locally (first the user's own at
   `$XDG_RUNTIME_DIR/buildkit/buildkitd.sock`, then the system-wide one
   at `/run/buildkit/buildkitd.sock`); otherwise a podman container
   `nomira-buildkitd`, which the CLI creates when needed.
2. **Build** the recipe with `buildctl`. The check of the groups runs in
   the frontend. The result is an OCI directory,
   [see where](../commands/#where-the-result-goes).
   BuildKit only writes layers that are not there yet.
3. **Build the unified kernel image** (UKI), unless `--no-uki`. The image
   builds it itself: podman runs it with its own file system mounted,
   and its bootc puts kernel, initramfs and a command line with the
   composefs digest into one file. The CLI adds that file as one more
   layer; all other layers stay as they are. See
   [Boot loader and storage](../../base-image/booting/#unified-kernel-image).
4. **Check** the image, see below.
5. **Switch**: only when everything has passed,
   `bootc switch --transport oci` with that directory. bootc reads the
   directory and imports only the layers it does not have yet.

Nothing on the running system changes before step 5.
`nomira switch --dry-run` shows the exact sequence of commands.

## As root or not

On a nomira system, run `sudo nomira switch`. The CLI then uses the
system-wide buildkitd, which the base image starts on demand.

Without root, the CLI falls back to the podman container and calls
`sudo` only for the last step. This is meant for developing recipes on
another machine.

## Checks before the switch

**Your own hooks.** Every `validation.d/*.sh` next to the recipe runs in
sorted order, with the image name in `$IMG`. A hook that fails stops the
switch. Example, `validation.d/10-lint.sh`:

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

`nomira validate` runs the same checks without building or switching.
