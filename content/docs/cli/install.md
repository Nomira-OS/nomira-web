---
title: Install the CLI
lead: Build the nomira command line, or run it from the base image.
weight: 5
---

There is no release and no package yet. Until there is, you have two
ways.

## Build it from source

This is the way we have tried. You need Go and git.

```sh
git clone https://github.com/Nomira-OS/nomira-cli
cd nomira-cli
go build -o nomira .
sudo install -m 0755 nomira /usr/local/bin/nomira
nomira version
```

The CLI is a single file without dependencies of its own. It calls
other tools, so install those too. On Arch Linux:

```sh
sudo pacman -S --needed podman buildkit skopeo
```

| Tool | Needed for |
|---|---|
| `podman` | `lint`, `graph`, and the BuildKit service the CLI starts when none is running |
| `buildctl` (package `buildkit`) | `build` |
| `skopeo` | loading a built image into container storage |

## Run it from the base image

> **Not tried yet.** This should work, but nobody has run it so far.

The base image contains the CLI together with
Podman, BuildKit and skopeo. You download that image anyway, because
recipes build on it. So the machine needs nothing but Podman:

```sh
nomira() {
  sudo podman run --rm -it --privileged \
    -v "$PWD":/work -w /work \
    -v nomira-buildkit:/var/lib/buildkit \
    -v nomira-containers:/var/lib/containers \
    ghcr.io/nomira-os/nomira-image:TAG \
    sh -c 'buildkitd >/var/log/buildkitd.log 2>&1 & sleep 2; exec nomira "$@"' nomira "$@"
}

nomira version
```

Put the function into your shell profile to keep it. What the options
do:

| Option | Meaning |
|---|---|
| `--privileged` | BuildKit and the Podman inside the container need it to run builds and containers |
| `-v "$PWD":/work -w /work` | The recipe directory; results land in `.nomira/` there |
| `-v nomira-buildkit:…` | Keeps the build cache between runs |
| `-v nomira-containers:…` | Keeps pulled images between runs |
| `buildkitd … &` | Starts BuildKit inside the container; the CLI finds its socket |

Limits of this way:

- `bootc upgrade` runs on the host, not in the container. On an installed nomira system the CLI is on the host anyway.
- Files in `.nomira/` belong to root.

