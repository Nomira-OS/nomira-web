---
title: Prepare the image
lead: Build a complete system from an example, and load it on the machine you install from.
weight: 10
untested: true
---

## Build

Start from the [`uki` example](https://github.com/Nomira-OS/arch-base/blob/main/examples/uki/recipe.yml): firmware, network,
SSH, an editor, all languages, the recipe itself in `/etc/nomira`, and a
[unified kernel image](../../../base-image/booting/#unified-kernel-image).
Its [README](https://github.com/Nomira-OS/arch-base/blob/main/examples/README.md) says what to adapt; the firmware first, since
a machine without its network firmware cannot go online to fix that.

```sh
mkdir ~/recipe && cd ~/recipe
curl -fLO https://raw.githubusercontent.com/Nomira-OS/arch-base/main/examples/uki/recipe.yml
export NOMIRA_RECIPE="$PWD/recipe.yml"
nomira build
```

## Load

Copy the directory `.nomira/mysystem.oci` to the machine you install from, then:

```sh
sudo skopeo copy oci:mysystem.oci containers-storage:localhost/mysystem:latest
```
