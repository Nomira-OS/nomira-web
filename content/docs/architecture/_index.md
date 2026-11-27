---
weight: 65
title: Architecture
lead: How the parts of nomira fit together, in brief. Each page names the core points and links to the documentation of the projects nomira builds on.
---

## Components

```text
 recipe.yml ──┐                                   ┌── nomira.conf
 imports      │ read by                  read by  │   flags
 copied files │                                   │
              ▼                                   ▼
        ┌──────────┐   LLB, solved by       ┌───────────┐
        │ frontend │◄──────────────────────►│ BuildKit  │◄── buildctl ◄── nomira CLI
        └──────────┘   gateway API          └───────────┘    (client)
                                                  │ OCI image (layers, config, label)
                                                  ▼
                                   OCI layout directory /var/lib/nomira/<name>.oci
                                                  │ bootc upgrade / switch / install
                                                  ▼
                                   composefs deployment, booted by systemd-boot
```

The arrows are the only interfaces: the recipe for the frontend, the
[gateway API](https://github.com/moby/buildkit/blob/master/frontend/gateway/pb/gateway.proto)
between frontend and BuildKit, buildctl's options for the client, and
an OCI image for bootc.

## Maxims

| Part | Maxim |
|---|---|
| Recipe | Describes the system completely, as far as a frontend can act on it. Whatever only a BuildKit client can set is not in it. |
| Frontend | Independent, modular, and fast through one rule of thumb: `run` in stages and collectors, copies in groups. It knows no package manager, no CLI and no distribution. |
| BuildKit | Used unchanged: it executes, caches and exports. nomira adds no daemon, plugin or patch. |
| CLI | A thin client that finds a buildkitd, passes the client options and publishes only images that passed their checks. It never changes the running system. |
| Base image | The smallest Arch Linux that bootc boots, reproducible to the byte. Everything specific to Arch lives here and nowhere else. |
| bootc | Deploys. nomira builds, bootc deploys: updates, rollbacks and installation are bootc's. |

## Rules that hold across all parts

- **Client options are not recipe settings.** What has to be an option of
  the BuildKit client (platform, exporter, compression, image names,
  sources of secrets, pull policy) is a flag or a line in
  [nomira.conf](client/#nomiraconf), never a recipe setting.
- **Loose coupling.** The CLI knows the frontend only as an image with
  helper modes (`inspect`, `resolve`); the frontend never reads anything
  of the CLI. Versions are compared, never required: see
  [Versions](client/#versions).
- **Builds are reproducible.** The same recipe on the same base image
  gives the same layers: see [Reproducibility](build/#reproducibility).
- **The image holds no machine state.** Nothing written to `/run`, `/tmp`,
  `/var/log`, `/var/cache` or `/var/tmp` during a build ends up in a layer:
  see [Mounts](mounts/).

## Pages

- [The build](build/): from the recipe to layers.
- [Mounts](mounts/): what is mounted where, at build time and at runtime.
- [Client](client/): CLI, buildctl and nomira.conf.
- [Deployment](deployment/): from an OCI image to a booted system.
