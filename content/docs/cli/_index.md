---
title: CLI
lead: The nomira command line builds a recipe, checks the result and switches the running system to it.
weight: 30
---

The CLI is a thin layer. It knows the frontend only as a container image
and calls the tools that do the work: `buildctl` builds, `skopeo` moves
the image, `bootc` switches. The frontend stays usable without it.

## What has been tried

`lint` and `build` have been run for real. `switch` and `validate` are
covered by tests of the command sequence only; a real switch on a nomira
system is still outstanding.

Source: [github.com/Nomira-OS/nomira-cli](https://github.com/Nomira-OS/nomira-cli)
