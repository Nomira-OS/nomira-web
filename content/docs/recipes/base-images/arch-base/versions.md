---
title: Tags and package set
lead: The tag of the base image is the package set.
weight: 10
aliases: [/docs/base-image/versions/]
---

## Tags

| Tag | Meaning |
|---|---|
| `<version>` | A release, for example `0.2.0` |
| `<version>-<snapshot date>` | The same release with the date of its package set, for example `0.2.0-2026.11.13` |
| `sha-<commit>` | A development build of one commit on `main` |
| `latest` | The newest build of `main`, for trying things out |

A recipe that should build the same tomorrow names a release or a
`sha-…` tag, not `latest`. No release has been published yet; until the
first one only `sha-<commit>` and `latest` exist, see
[Packages at Nomira-OS](https://github.com/orgs/Nomira-OS/packages).

## Where the packages come from

Every image is built from one day of the
[Arch Linux Archive](https://archive.archlinux.org/). The mirrorlist in
the image points to the same day. A `pacman -S` in your recipe therefore
installs from the same package set as the base image, and the recipe
does not have to know a date.

To get newer packages, refer to a newer base image.

## Layers

The image is split into layers by package: each layer holds one package
or a few that change at a similar rate, 64 layers at most. A new base
image that updates a few packages changes only their layers, so an
update downloads little. The layers are built reproducibly from the
date of the image, so a package that did not change keeps its layer.

## How exact this is

Tags can be moved. To be sure that a rebuild starts from the same bytes,
refer to the digest of the image:

```yaml
settings:
  base: ghcr.io/nomira-os/arch-base@sha256:…
```

The package set is then fixed. The tag stays readable if you keep it in
front of the digest: `arch-base:TAG@sha256:…`.

## Verifying an image

The images are signed with cosign and carry a provenance attestation
from the build in GitHub Actions.
