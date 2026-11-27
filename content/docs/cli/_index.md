---
title: CLI
lead: The nomira command line builds a recipe into a directory that bootc follows.
weight: 30
---

The CLI is a thin layer around `buildctl`. It knows the frontend only as
a container image that BuildKit runs, and reads the labels the frontend
writes into images. Deploying is bootc's. The frontend stays usable
without the CLI.

## What has been tried

`lint`, `build` and `recipe export`/`diff` have been run against a real
BuildKit. `bootc upgrade` from the published directory on a nomira
system is still outstanding.

Source: [github.com/Nomira-OS/nomira-cli](https://github.com/Nomira-OS/nomira-cli)
