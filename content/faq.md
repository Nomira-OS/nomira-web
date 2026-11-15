---
title: Frequently asked questions
lead: Short answers. The details are in the docs.
---

## Is nomira declarative?

Only in part. A recipe is a list of ordinary commands that run in order,
so you describe the steps, not the result. What nomira shares with
declarative systems is the effect: every build starts over from the base
image, and the running system is read-only. The system is therefore what
the recipe produces, and nothing lingers from earlier. If you want a
truly declarative system, look at NixOS.

## Is nomira better than NixOS?

No. NixOS checks more, repeats a state more exactly and is far more
mature. nomira has different goals: Arch packages and ordinary
configuration files instead of a language of its own. See the
[comparison with NixOS](../compare/nixos/).

## How does nomira differ from BlueBuild?

Both build an immutable system from a YAML file and boot it with bootc.
BlueBuild offers many ready-made modules, is made for atomic Fedora and
is the more mature project. nomira has three plain commands, is made for
Arch Linux and builds independent parts in parallel. See the
[comparison with BlueBuild](../compare/bluebuild/).

## How does nomira differ from Arkane Linux?

Both are immutable systems built from Arch packages. Arkane Linux is a
complete desktop distribution with its own deployment tool on btrfs.
nomira is a set of building blocks: you assemble the system yourself, as
a container image that bootc boots. See the
[comparison with Arkane Linux](../compare/arkane/).

## Can I use the frontend without the rest?

Yes. The frontend builds any container image and needs neither the CLI
nor the base image. See [the frontend](../frontend/) and
[using it on its own](../docs/frontend/standalone/).

## Does nomira only run with Arch Linux?

The frontend is not tied to a distribution. In principle any system that
bootc supports can serve as the base. At present only Arch Linux is
supported and tried, and a base image exists only for Arch.

## Can I use nomira for everyday work already?

We advise against it. The project is in alpha: the recipe schema may
change, and installation on real hardware has not been tried yet. A
virtual machine is the place to try it.

## What does "verified parallel" mean?

It is a property of the frontend, that is, of the build. The groups of a
phase run at the same time. Every build determines which files each
group has changed. If two groups overlap, the build aborts. The
independence is therefore not merely claimed but verified on every
build.

## How do I pin a state?

Through the base image. Every release contains the package set of one
particular day from the Arch archive, and packages that your recipe
installs come from the same set. To be entirely sure, refer to the
digest of the base image instead of a tag.

## Is there SELinux?

No. Arch Linux does not ship the library it needs. The base image relies
on AppArmor instead.
