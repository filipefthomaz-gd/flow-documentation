# VS Code Features

Flow's editor support ships as two parts: a language server (completions, diagnostics, navigation) and an extension host (the player, graph view, and sidebar panels). Everything below reflects what's actually wired up in the extension — not aspirational features.

## Dialogue Player

Click the **▶** button in the editor toolbar (or run **Flow: Play Dialogue** from the Command Palette) to open an interactive player in a side panel.

- Navigate lines with **Continue**, pick choices with the option buttons
- The active line is highlighted in the editor while the player is open
- The panel auto-refreshes when you save the file
- **Play from Here**: right-click a root node in the **Files** sidebar to start the player at that specific section instead of the file's first root

::: tip
The player won't launch if the file has parse errors — fix any red squiggly diagnostics first.
:::

---

## Flow Graph

Run **Flow: Show Graph** (or use the toolbar icon) to open a visual node graph of the current file in a side panel. It opens automatically when you switch to a `.flow`/`.flo` file, and refreshes on save. You can trigger playback from a node in the graph, which opens the Dialogue Player at that point.

---

## Flow sidebar

A dedicated **Flow** icon in the activity bar holds two panels:

- **Files** — every `.flow`/`.flo` file in the workspace, expandable to its root nodes, expandable to their waypoints. Click any item to jump straight to it. Right-click a root node for **Play from Here**.
- **Stats** — for the active file: variable list (with live values once a player session is running), sections, waypoints, speakers, and a dialogue word count.

---

## Syntax highlighting

Highlighted via a TextMate grammar, plus live editor decorations for speaker names (each speaker gets a consistent color, keyed by name) and root node declarations:

| Element | Examples |
|---------|---------|
| Root nodes | `<<INTRO>>:` |
| Keywords | `OPTIONS`, `IF`, `RANDOM`, `CYCLE`, `SHUFFLE`, `ONCE`, `VISITS`, `SIMULTANEOUS`, `TUNNEL`, `PARALLEL`, `KILL`, `AWAIT`, ... |
| Speaker names | `Alice:`, `Old Man Jones:` — each speaker rendered in its own color |
| Narration | `>` lines and `NARRATION:` |
| Inline commands | `[[audio sfx]]`, `[[set var = true]]` |
| Constants | `CONST`, `$Name` |
| Jumps | `->ROOT`, `<<ROOT>>`, `::waypoint` |
| Node metadata | `@key: value` |
| Comments | `// line comments` and `/* block comments */` |

---

## Completions

Suggestions appear as you type, triggered after `>`, `<`, space, or `:`:

| Context | Suggestion |
|---------|-----------|
| Start of line | Speaker names already used elsewhere in the file |
| Start of line | Keywords (`OPTIONS`, `IF`, `RANDOM`, etc.) |
| After `->` | Root node names |
| After `<<` | Root node names |

---

## Diagnostics

Errors and warnings appear as squiggly underlines, from two sources:

- **Parser diagnostics** — everything the language library itself detects: syntax errors, duplicate `VAR`/constant declarations, empty blocks, a `RETURN` with nowhere to go, a branch option with no content, and more.
- **Editor-level checks** — duplicate root node names in the same file, and jump/tunnel targets (`->`, `TUNNEL`, `PARALLEL`, `KILL`, `AWAIT`) that don't match any declared root in the file.

::: warning AWAIT targets
The "undefined root" check also runs against `AWAIT:` targets. Since `AWAIT` can legitimately point at an event name, a function call, or a delay in seconds rather than a root node, an `AWAIT: some_event_name` line can trigger a spurious warning if `some_event_name` isn't also a root. This is a rough edge in the current checker, not a language restriction — the dialogue still runs correctly.
:::

---

## Hover

Hovering over a jump (`->NAME`), a tunnel (`->NAME<-`), a root declaration or reference (`<<NAME>>`), a waypoint (`::name`), a converge/return token (`<-`, `<`), or a recognized keyword shows a short explanation of what it does.

## Go to Definition

`Cmd+Click` (or `F12`) on a jump target:

| Where you click | Where it jumps |
|-----------------|---------------|
| `->ROOT_NAME` | `<<ROOT_NAME>>:` in the current file |
| `->file.ROOT_NAME` | Opens that file and jumps to `<<ROOT_NAME>>` |

---

## Find All References

`Shift+F12` on a root name lists every place it's referenced — its declaration, every `->`/`TUNNEL` jump to it, and every inline `<<NAME>>` reference. This is scoped to the current file only; it does not follow `#INCLUDE`s into other files.

## Rename Symbol

`F2` on a root name renames the declaration and every reference to it in the current file in one edit. The new name is automatically upper-cased. Like Find References, this does not rename usages in other included files.

## Document Highlight

Click anywhere on a root name and every other occurrence of it in the current file is subtly highlighted — a lighter-weight version of Find References for quick visual scanning.

## Quick Fix

When a diagnostic reports an undefined root (e.g. `->MISSING` with no matching `<<MISSING>>`), a lightbulb quick fix **Create section «MISSING»** appends a stub `<<MISSING>>` block to the end of the file.

## Workspace Symbol Search

`Cmd+T` ("Go to Symbol in Workspace") searches root node names across every Flow file VS Code has open or indexed — unlike References/Rename, this one does span files.

---

## Outline & navigation

- **Outline panel** (Explorer sidebar) lists all `<<ROOT>>` nodes as a tree, each spanning from its declaration to the line before the next root
- **`Cmd+Shift+O`** — fuzzy-search and jump to any root node in the current file
- **Breadcrumbs** update as you move through the file

---

## Comments

```flow
// Line comment — ignored by the runtime and stripped anywhere it appears on a line,
// including after real content on the same line.

/*
  Block comment — can span multiple lines.
*/
```

Both forms are recognized by the parser and syntax-highlighted. Note that `Cmd+/` (Toggle Line Comment) only knows about `//` — there's no keybinding for toggling `/* */` block comments.
