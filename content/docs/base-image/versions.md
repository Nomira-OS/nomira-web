---
title: Tags and package set
lead: The tag of the base image is the package set.
weight: 10
---

## Tags

| Tag | Meaning |
|---|---|
| `<version>` | A release, for example `0.2.0` |
| `<version>-<snapshot date>` | The same release with the date of its package set, for example `0.2.0-2026.11.13` |
| `sha-<commit>` | A development build of one commit on `main` |

There is deliberately no `latest` tag. No release has been published
yet; until the first one only `sha-<commit>` tags exist, see
[Packages at Nomira-OS](https://github.com/orgs/Nomira-OS/packages).

## Where the packages come from

Every image is built from one day of the
[Arch Linux Archive](https://archive.archlinux.org/). The mirrorlist in
the image points to the same day. A `pacman -S` in your recipe therefore
installs from the same package set as the base image, and the recipe
does not have to know a date.

To get newer packages, refer to a newer base image.

## How exact this is

Tags can be moved. To be sure that a rebuild starts from the same bytes,
refer to the digest of the image:

```yaml
settings:
  base: ghcr.io/nomira-os/nomira-image@sha256:…
```

The package set is then fixed. A rebuild of your recipe is still not
bit-for-bit identical, because build steps may write timestamps and the
like.

## Verifying an image

The images are signed with cosign and carry a provenance attestation
from the build in GitHub Actions.
