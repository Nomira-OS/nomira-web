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
phases:
  - name: app
    groups:
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

The frontend image has helper modes that only read the recipe:

```sh
podman run --rm -i ghcr.io/nomira-os/nomira:1-alpha lint - < recipe.yml
```

`lint` checks the structure, `graph` prints the pipeline as a Mermaid
flowchart, and `inspect` prints name, base, phases and groups as JSON.

## Tags of the frontend image

| Tag | Meaning |
|---|---|
| `1-alpha` | Moves with every release while the schema is unstable |
| `sha-<commit>` | One immutable build per commit on `main` |

No release has been published yet; until the first one, use a
`sha-<commit>` tag from
[Packages at Nomira-OS](https://github.com/orgs/Nomira-OS/packages).
