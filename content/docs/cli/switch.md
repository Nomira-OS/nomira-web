---
title: Build, switch, upgrade
lead: nomira build builds, checks and publishes an image; switch and upgrade mean what they mean in bootc.
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

`build` never touches the running system. `--secret id=ID,src=PATH`
passes a file to steps that mount it as a secret.

## nomira switch and nomira upgrade

As in bootc, `switch` changes which image the system follows, and
`upgrade` takes a new version of it:

| | Does |
|---|---|
| `nomira switch` | `bootc switch --transport oci` with the output directory. Once; from then on the system follows the recipe's images |
| `nomira upgrade` | `nomira build`, then `bootc upgrade`. For every change |

`sudo nomira build` followed by `sudo bootc upgrade` is the same as
`sudo nomira upgrade`. `--apply` reboots right away. Staging, the boot
entry, `bootc rollback` and `bootc status` are bootc's.

A system installed as in [Installation](../../getting-started/installation/)
follows the output directory from the start and needs no `switch`.

## As root or not

On a nomira system, run them with `sudo`. `build` then uses the
system-wide buildkitd, which the base image starts on demand.

Without root, `build` falls back to the podman container, and `switch`
and `upgrade` call `sudo` for bootc. This is meant for developing
recipes on another machine.

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
