---
title: Compare
lead: Where nomira stands next to NixOS, BlueBuild and Arkane Linux. It is not better than any of them; it has different goals and is far younger.
axes:
  - title: What do you write?
    left: The result you want
    right: The steps that lead to it
    marks:
      - {name: NixOS, at: 7}
      - {name: Arkane, at: 32}
      - {name: BlueBuild, at: 60}
      - {name: nomira, at: 91}
    text: "From describing the result to writing the steps: NixOS (a declarative language), Arkane Linux (package lists and an overlay), BlueBuild (modules that run in order), nomira (plain commands)."
  - title: How much is ready-made?
    left: A complete system
    right: Building blocks
    marks:
      - {name: Arkane, at: 8}
      - {name: NixOS, at: 32}
      - {name: BlueBuild, at: 57}
      - {name: nomira, at: 91}
    text: "From a complete system to building blocks: Arkane Linux (a desktop distribution), NixOS (a distribution with an option for almost everything), BlueBuild (modules on top of finished desktop images), nomira (three commands and a minimal base image)."
  - title: How mature is it?
    left: Proven over many years
    right: Early stage of development
    marks:
      - {name: NixOS, at: 6}
      - {name: BlueBuild, at: 36}
      - {name: Arkane, at: 61}
      - {name: nomira, at: 92}
    text: "From proven to early: NixOS, BlueBuild, Arkane Linux, nomira."
---

## In one sentence each

- **NixOS** describes the whole system in a declarative language and
  checks a great deal before it builds anything.
- **BlueBuild** assembles a system image from ready-made modules, mainly
  on top of atomic Fedora.
- **Arkane Linux** is an immutable Arch desktop, built from package
  lists with its own deployment tool.
- **nomira** builds an immutable Arch from a recipe of plain commands,
  as a container image, and builds independent parts in parallel.

## Side by side

| Topic | nomira | NixOS | BlueBuild | Arkane Linux |
|---|---|---|---|---|
| Packages from | Arch Linux | nixpkgs | Mainly Fedora | Arch Linux |
| You write | Commands in a YAML recipe | The Nix language | Modules in a YAML recipe | Package lists and an overlay |
| Declarative | In part | Yes | Largely, through modules | Largely, through lists |
| Checked before the build | Structure of the recipe | Options and types | Structure of the recipe | Little, as far as we know |
| The system is | A container image, switched with bootc | Generations in the Nix store | A container image, switched with bootc | An image in a btrfs subvolume |
| Immutable, with a way back | Yes | Yes | Yes | Yes |
| Usual paths (`/usr`, `/etc`) | Yes | No, the Nix store | Yes | Yes |
| Independent parts built in parallel | Yes, verified on every build | Yes, by design | No | No |
| Ready-made desktop | No | Yes | Yes | Yes |
| Maturity | Alpha | Proven | Established | In active development |

The statements about the other projects reflect what we know and may be
out of date. Their own documentation is authoritative; the pages below
name our sources.

## Which one, roughly

- You want the strongest guarantees and accept a language of its own:
  **NixOS**.
- You want a Fedora-based desktop image with little effort:
  **BlueBuild**.
- You want an immutable Arch desktop to install today: **Arkane Linux**.
- You want an immutable Arch that you assemble yourself from plain
  commands, and you can live with alpha software: **nomira**.
