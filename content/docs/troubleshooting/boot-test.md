---
title: The boot test times out
lead: nomira switch or nomira validate waits for the VM and gives up.
weight: 20
---

## Why

The boot test uses `bcvk ephemeral test-basic`. It boots the image in a
VM and then connects to it over SSH. An image without a running network
service and `sshd` boots fine but never answers, so the test runs into
its timeout.

We have seen this with the bare base image: it reached the end of the
boot process, and the test still failed.

## What to do

- Add network and SSH to the image, as the recipe in the
  [quick start](../../getting-started/quickstart/) does.
- Or skip the test for this run:

```sh
nomira switch --no-boot-test
```

- To look at the boot yourself, start the image with
  `bcvk ephemeral run --console -it`.
