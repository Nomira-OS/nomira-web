---
title: Quick start
weight: 10
lead: Build a first recipe, on any Linux and without changing anything on your own system.
---

> **Tried.** These steps have been run on Arch Linux: the build with two
> groups and the abort on a conflict.

## Requirements

You need `go`, `podman`, `buildctl` and `skopeo`. On Arch Linux:

```sh
sudo pacman -S --needed go buildkit podman skopeo
```

## Build the command line

```sh
git clone https://github.com/Nomira-OS/nomira-cli
cd nomira-cli && go build -o nomira . && cd ..
```

## Write a recipe

Create a directory and in it the file `recipe.yml`:

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
settings:
  name: test
  base: docker.io/library/alpine:3.22
phases:
  - name: content
    groups:
      a: ["run echo a > /etc/a"]
      b: ["run echo b > /etc/b"]
```

## Check and build

```sh
../nomira-cli/nomira lint
../nomira-cli/nomira build
```

The command line starts a BuildKit service in a container if needed. The
result is the archive `.nomira/test.oci.tar`.

## Trigger a conflict

Make both groups write the same file, that is, `/etc/a` in group `b` as
well, and build again. The build aborts and names the two groups and the
file:

```text
phase "content": declared-independent groups are not disjoint (policy: strict):
  groups "a" and "b": /etc/a (both write)
```

Continue with [Writing recipes](../../recipes/writing/) or read what the [CLI](../../cli/) does.
