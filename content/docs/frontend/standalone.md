---
title: Using it on its own
lead: The frontend builds any container image. It needs neither the nomira CLI nor the base image, and no bootc.
weight: 10
---

One line at the top of the file selects the frontend:

```yaml
# syntax=ghcr.io/nomira-os/nomira:1-alpha
settings:
  base: docker.io/library/alpine:3.22
build:
  app:
    config:
      - copy files/app.conf /etc/app.conf
    assets:
      - run mkdir -p /srv/www && echo hello > /srv/www/index.html
```

BuildKit itself does the build:

```sh
buildctl build --frontend gateway.v0 \
  --opt source=ghcr.io/nomira-os/nomira:1-alpha \
  --local context=. --local dockerfile=. --opt filename=recipe.yml \
  --output type=oci,dest=image.tar
```

This way has been tried. Tools that use BuildKit and honour the
`# syntax=` line, such as `docker buildx`, should build the recipe as
well; we have not tried that yet.


## Checking a recipe without building

The build option `mode` makes the frontend stop after reading the recipe
and its imports, local and by URL, the same way as for a build:

```sh
buildctl build --frontend gateway.v0 \
  --opt source=ghcr.io/nomira-os/nomira:1-alpha \
  --local context=. --local dockerfile=. --opt filename=recipe.yml \
  --opt mode=resolve --output type=local,dest=out
```

`mode=lint` only checks the recipe; `mode=resolve` also writes
`out/recipe.yml`, the recipe with all imports merged, as the image
records it. Both write `out/version`, the frontend's version. All
options: [Build options](../schema/#build-options).

## Tags of the frontend image

| Tag | Meaning |
|---|---|
| `1-alpha` | Moves with every release while the schema is unstable |
| `sha-<commit>` | One immutable build per commit on `main` |

No release has been published yet; until the first one, use a
`sha-<commit>` tag from
[Packages at Nomira-OS](https://github.com/orgs/Nomira-OS/packages).
