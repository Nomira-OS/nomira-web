---
title: Compare
lead: nomira next to NixOS, BlueBuild and Arkane Linux. It is not better than any of them. It has different goals, and it is far younger.
projects:
  - name: nomira
    icon: '<path d="M3 12h4M17 12h4M7 12c3 0 2-6 5-6s2 6 5 6M7 12c3 0 2 6 5 6s2-6 5-6M7 12h10"/>'
    text: An immutable Arch from a recipe of plain commands, built as a container image.
    pick: Pick it to assemble an Arch system yourself, if you can live with alpha software.
  - name: NixOS
    page: /compare/nixos
    icon: '<path d="M12 3l8 4.500v9L12 21l-8-4.500v-9z"/><path d="M12 12l8-4.500M12 12v9M12 12L4 7.500"/>'
    text: The whole system in a declarative language, checked before anything is built.
    pick: Pick it for the strongest guarantees, if you accept a language of its own.
  - name: BlueBuild
    page: /compare/bluebuild
    icon: '<rect x="3" y="3" width="7" height="7" rx="1.500"/><rect x="14" y="3" width="7" height="7" rx="1.500"/><rect x="3" y="14" width="7" height="7" rx="1.500"/><rect x="14" y="14" width="7" height="7" rx="1.500"/>'
    text: A system image from ready-made modules, mainly on top of atomic Fedora.
    pick: Pick it for a Fedora-based desktop image with little effort.
  - name: Arkane Linux
    page: /compare/arkane
    icon: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'
    text: An immutable Arch desktop, built from package lists with its own deployment tool.
    pick: Pick it for an immutable Arch desktop you can install today.
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
