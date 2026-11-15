---
title: Installation
lead: How nomira gets onto a machine. Please try it in a VM first.
weight: 20
untested: true
---

> Installation on real hardware has not been tried yet. Do not run it on
> a machine whose data you need.

## The intended way

nomira is not set up with an installer of its own but with bootc. The
image brings bootc along; the machine only needs Podman.

1. Boot any Linux with Podman, such as an Arch live system or an
   existing Arch.
2. Let the image install itself. bootc knows two ways: onto an empty
   disk (`bootc install to-disk`) or alongside an existing system
   (`bootc install to-existing-root`).
3. Reboot. On the first boot the system asks for locale, keymap, time
   zone and root password.

The exact calls are described in the
[bootc documentation](https://bootc-dev.github.io/bootc/bootc-install.html).
Once we have gone through the installation with the nomira image, the
commands will be here.

## Open points

- Which boot loader works with the Arch image has not been settled.
- The base image contains no firmware. For Wi-Fi or some graphics cards
  a recipe has to add it before the system is useful on real hardware.

## Afterwards

The installed system is the base image: deliberately small. You describe
your own system in a [recipe](../recipes/) and switch to it with
`sudo nomira switch`.
