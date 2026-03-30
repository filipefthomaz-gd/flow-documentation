# Getting Started

## Installation

Install the **Flow** extension from the VS Code marketplace, or clone the repository and build locally.

Files with `.flow` or `.flo` extensions are automatically recognised.

## Your first file

Create a file called `intro.flow`:

```flow
<<INTRO>>:
  Rita: Hey. Haven't seen you around here before.
  OPTIONS:
    - Just passing through:
      Rita: Sure you are. Everyone says that.
      ->INTRO
    - I'm looking for someone:
      Rita: Aren't we all.
      ->SEARCH
    - Goodbye:
      Rita: Take care of yourself.
      EOD

<<SEARCH>>:
  Rita: Who are you looking for?
  John: There aren't many people left in this part of town.
  EOD
```

Open the file in VS Code and click the **▶ Play** button in the editor toolbar to run the dialogue interactively.

::: tip Root nodes
`<<NAME>>:` blocks are named sections. Execution begins at the first root in the file. Use `->NAME` to jump between them.
:::

## Adding variation

Flow has built-in sequence types so you can write natural-feeling variation without managing flags yourself:

```flow
<<GREETING>>:
  ONCE:
    Rita: First time here? Let me show you around.
  CYCLE:
    - Rita: Morning.
    - Rita: Good to see you again.
    - Rita: Back already?
  Rita: What can I do for you?
  EOD
```

The `ONCE` block plays only on the first visit. The `CYCLE` block rotates through its lines on subsequent visits. See [Sequences](/guide/sequences) for the full picture.

## Project structure

Flow files can be split across multiple files using `#INCLUDE`:

```
dialogue/
  main.flow
  characters/
    rita.flow
    john.flow
  quests/
    main_quest.flow
```

```flow
// main.flow
#INCLUDE characters/rita.flow
#INCLUDE characters/john.flow
#INCLUDE quests/main_quest.flow

<<START>>:
  ->RITA_INTRO
```

::: info Cross-file jumps
Use dot notation to jump to a root in an included file: `->rita.RITA_INTRO`
:::

## Next steps

- [Writing Dialogue](/guide/writing-dialogue) — the full language guide
- [Sequences](/guide/sequences) — ONCE, CYCLE, SHUFFLE, weighted RANDOM
- [Narration](/guide/narration) — stage directions and narrator lines
- [Syntax Reference](/reference/syntax) — complete syntax listing
