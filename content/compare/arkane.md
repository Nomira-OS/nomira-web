---
title: nomira and Arkane Linux
lead: Both are immutable systems built from Arch packages. Arkane Linux is a complete distribution you can install today; nomira is a set of building blocks.
layout: comparison
weight: 30
axes:
  - title: What do you get?
    left: A complete desktop system
    right: Building blocks
    marks:
      - {name: Arkane, at: 10}
      - {name: nomira, at: 90}
    text: Arkane Linux is a complete desktop system. nomira provides building blocks and a minimal base image.
  - title: How do you describe your own variant?
    left: Package lists and an overlay
    right: Commands in phases and groups
    marks:
      - {name: Arkane, at: 14}
      - {name: nomira, at: 84}
    text: An Arkane variant is described by package lists and an overlay directory. A nomira system is described by commands in phases and groups.
  - title: What carries the system?
    left: Tooling of its own (arkdep, btrfs)
    right: Container images and bootc
    marks:
      - {name: Arkane, at: 12}
      - {name: nomira, at: 86}
    text: Arkane Linux uses its own tool, arkdep, on btrfs. nomira uses container images and bootc.
---

## In short

**Arkane Linux** is an immutable, Arch-based distribution with a GNOME
desktop and an installer. Its tool, arkdep, builds a system image from a
small configuration (lists of packages, an overlay directory, services
to enable) and deploys it as a btrfs subvolume. Updates replace the
whole system; the previous deployment stays as a way back.

**nomira** is not a distribution. It consists of a build frontend, a
command line and a minimal base image without a desktop. You describe
your system as a recipe of commands, it is built as a container image,
and bootc switches to it.

The two are closest in what they are for: an immutable Arch that you
shape yourself.

## In detail

| Topic | Arkane Linux | nomira |
|---|---|---|
| What it is | A distribution with installer and desktop, plus the toolkit arkdep | Build frontend, CLI and a minimal base image |
| Packages | Arch Linux | Arch Linux |
| Describing your variant | A directory with package lists, an overlay and a list of services | A YAML recipe with commands in phases and groups |
| How declarative | More: you list packages and files, the tool does the steps | Less: you write the steps yourself |
| Arbitrary build steps | Through the overlay and the hooks arkdep-build offers | Any shell command, anywhere in the recipe |
| Building | arkdep-build installs the packages into a fresh tree and packs it | BuildKit builds layers; unchanged parts come from the cache |
| Rebuild after a change | The whole image | The changed group and later steps that run commands |
| Image format | An archive, published on a web server with a small database file | An OCI container image, in any container registry |
| Deployment | arkdep unpacks the image into a btrfs subvolume | bootc switches to the container image |
| Requirements on the machine | btrfs and systemd-boot | What bootc supports; the boot loader for the Arch image is still an open point |
| Way back | Earlier deployments stay selectable at boot | The previous image, through bootc |
| Checks before switching | Not built in, as far as we know | Checks as steps of the recipe, `bootc container lint` for one; an image that fails is not published |
| Pinned package set | Not built in, as far as we know | The base image fixes a day of the Arch archive |
| Maturity | A working distribution; arkdep describes itself as still in active development | Alpha, not installed on hardware yet |

The statements about Arkane Linux reflect what we know and may be out of
date. The Arkane Linux documentation is authoritative.

## When Arkane Linux is the better choice

- You want an immutable Arch with a desktop that you can install today.
- A list of packages and a few files describe what you need.
- You are happy with btrfs and systemd-boot.
- You do not want to deal with container tooling.

## When nomira may fit

- You want to start from a minimal system and choose every part.
- Your setup needs real build steps, not only packages and files.
- You want the system as a container image: to keep in a registry, to
  inspect, to test in a VM before switching.
- You like trying something early and can live with breakage.

## Sources

- [Arkane Linux](https://arkanelinux.org/)
- [arkdep on GitHub](https://github.com/arkanelinux/arkdep)
