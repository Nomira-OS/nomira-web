---
title: The frontend
lead: The core of nomira is a BuildKit frontend. It is developed in this project, but it stands on its own and builds any container image.
---

## What it does

A Containerfile is a chain: change one step, and all that follow run
again. The nomira frontend describes a build in **phases** and
**groups** instead.

- **Phases** run one after another.
- **Groups** of a phase are independent of each other. They all start
  from the same state, run at the same time and are cached one by one.
- At the end of the phase their results are merged.

When a group changes, only that group is rebuilt, not its siblings.

## Independence is verified

The recipe only claims that groups are independent. The frontend checks
it on every build: it determines which files each group has written or
deleted. If two groups overlap, the build aborts and names the groups
and the path.

```text
phase "configs": declared-independent groups are not disjoint (policy: strict):
  groups "a" and "b": /etc/a (both write)
```

## Using it without the rest of nomira

The frontend needs neither the nomira CLI nor the base image, and no
bootc either. One line at the top of the file is enough:

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

## What it deliberately is not

- **Not a collection of modules.** There are three commands: `run`,
  `copy` and `env`. Everything else is shell.
- **Not declarative.** A recipe lists commands that run in order. What
  the frontend adds is structure: which steps are independent, and the
  proof that they are.
- **Not a replacement for a Containerfile in every case.** It pays off
  where a build has many independent parts.
- **Not stable yet.** The schema may change, hence the tag `1-alpha`.

Source and the full description of the schema:
[github.com/Nomira-OS/nomira](https://github.com/Nomira-OS/nomira)
