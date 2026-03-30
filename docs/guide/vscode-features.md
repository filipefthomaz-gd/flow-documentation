# VS Code Features

## Dialogue Player

Click the **▶** button in the editor toolbar (or run **Flow: Play Dialogue** from the Command Palette) to open an interactive dialogue player in a side panel.

- Navigate lines with **Continue**
- Select choices with the option buttons
- Jump to any root node from the **Section** dropdown
- Restart at any time with **↺ Restart**
- The player auto-refreshes when you save the file

::: tip
The dialogue player is useful for quickly testing branching logic and verifying that conditions, jumps, and sequences behave as expected — without leaving VS Code.
:::

---

## Syntax highlighting

All Flow constructs are highlighted:

| Element | Examples |
|---------|---------|
| Root nodes | `<<INTRO>>:` |
| Keywords | `OPTIONS`, `IF`, `RANDOM`, `CYCLE`, `SHUFFLE`, `ONCE`, `SIMULTANEOUS` |
| Speaker names | `Alice:`, `Old Man Jones:` |
| Narration | `>` lines and `NARRATION:` |
| Inline commands | `[[audio sfx]]`, `[[set var = true]]` |
| Constants | `CONST`, `{$Name}` |
| Jumps | `->ROOT`, `<<ROOT>>` |
| Comments | `// ...` |

---

## Completions

The editor suggests completions as you type:

| Context | Suggestion |
|---------|-----------|
| Start of line | Speaker names used elsewhere in the file |
| Start of line | Keywords: `OPTIONS`, `IF`, `RANDOM`, `CYCLE`, `SHUFFLE`, `ONCE`, `NARRATION`, `CONST`, etc. |
| After `->` | All root node names in the file |
| After `<<` | All root node names (inserts `NAME>>`) |

---

## Diagnostics

Errors and warnings appear as squiggly underlines:

- **Syntax errors** — invalid indentation, unexpected structure
- **Undefined root** — `->MISSING` when no `<<MISSING>>` exists in the file or its includes

---

## Go to Definition

`Cmd+Click` (or `F12`) on any of these jumps to its declaration:

| Where you click | Where it jumps |
|-----------------|---------------|
| `->ROOT_NAME` | `<<ROOT_NAME>>:` in the current file |
| `->file.ROOT_NAME` | Opens that file and jumps to `<<ROOT_NAME>>` |
| `#INCLUDE filename.flow` | Opens the included file |

---

## Outline & navigation

- **Outline panel** (Explorer sidebar) lists all `<<ROOT>>` nodes as a tree
- **`Cmd+Shift+O`** — fuzzy-search and jump to any root node in the file
- **Breadcrumbs** update as you move through the file

---

## Comments

```flow
// This is a comment — ignored by the runtime and the player
```

Comments can appear on their own line anywhere in the file. Inline comments (after a line) are not supported.
