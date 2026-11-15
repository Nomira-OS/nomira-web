---
title: Splitting recipes
lead: With include a recipe spreads over several files and directories.
weight: 40
---

A recipe has one entry file. Everything else can be moved out:

```yaml
# recipe.yml
settings:
  base: ghcr.io/nomira-os/nomira-image:TAG

phases:
  - include: phases/packages.yml
  - name: configuration
    groups:
      terminal: {include: groups/terminal.yml}
      network:
        - copy files/nm/ /etc/NetworkManager/system-connections/
```

```yaml
# groups/terminal.yml
- copy files/kmscon/ /etc/kmscon/
```

## Rules

- Wherever a list of commands is expected, `include: <file>` works
  instead.
- In the list of phases, `- include: <file>` pulls in one phase or
  several.
- Paths are relative to the including file and must stay inside the
  recipe directory.
- Included files may include further files. A cycle is an error.
- `settings` exists only in the entry file.
- The sources of `copy` always refer to the recipe directory, not to the
  included file.

Includes are covered by the parser tests; a real build with them has not
been run yet.
