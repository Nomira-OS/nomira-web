---
title: Frequently asked questions
lead: Short answers. The details are in the docs.
layout: faq
questions:
  - q: 'Is nomira declarative?'
    a: |
      Only in part. A recipe is a list of ordinary commands that run in order,
      so you describe the steps, not the result. What nomira shares with
      declarative systems is the effect: every build starts over from the base
      image, and the running system is read-only. The system is therefore what
      the recipe produces, and nothing lingers from earlier. If you want a
      truly declarative system, look at NixOS.
  - q: 'Is nomira better than NixOS?'
    a: |
      No. NixOS checks more, repeats a state more exactly and is far more
      mature. nomira has different goals: Arch packages and ordinary
      configuration files instead of a language of its own. See the
      [comparison with NixOS](../compare/nixos/).
  - q: 'How does nomira differ from BlueBuild?'
    a: |
      Both build an immutable system from a YAML file and boot it with bootc.
      BlueBuild offers many ready-made modules, is made for atomic Fedora and
      is the more mature project. nomira has three plain commands, is made for
      Arch Linux and builds independent parts in parallel. See the
      [comparison with BlueBuild](../compare/bluebuild/).
  - q: 'How does nomira differ from Arkane Linux?'
    a: |
      Both are immutable systems built from Arch packages. Arkane Linux is a
      complete desktop distribution with its own deployment tool on btrfs.
      nomira is a set of building blocks: you assemble the system yourself, as
      a container image that bootc boots. See the
      [comparison with Arkane Linux](../compare/arkane/).
  - q: 'Can I use the frontend without the rest?'
    a: |
      Yes. The frontend builds any container image and needs neither the CLI
      nor the base image. See [the frontend](../frontend/) and
      [using it on its own](../docs/frontend/standalone/).
  - q: 'Does nomira only run with Arch Linux?'
    a: |
      The frontend is not tied to a distribution. In principle any system that
      bootc supports can serve as the base. At present only Arch Linux is
      supported and tried, and a base image exists only for Arch.
  - q: 'Can I use nomira for everyday work already?'
    a: |
      We advise against it. The project is in alpha: the recipe schema may
      change, and installation on real hardware has not been tried yet. A
      virtual machine is the place to try it.
  - q: 'What does "verified parallel" mean?'
    a: |
      It is a property of the frontend, that is, of the build. The groups of a
      phase run at the same time. Every build determines which files each
      group has changed. If two groups overlap, the build aborts. The
      independence is therefore not merely claimed but verified on every
      build.
  - q: 'How do I pin a state?'
    a: |
      Through the base image. Every release contains the package set of one
      particular day from the Arch archive, and packages that your recipe
      installs come from the same set. To be entirely sure, refer to the
      digest of the base image instead of a tag.
  - q: 'Is there SELinux?'
    a: |
      No. Arch Linux does not ship the library it needs. The base image relies
      on AppArmor instead.
---
