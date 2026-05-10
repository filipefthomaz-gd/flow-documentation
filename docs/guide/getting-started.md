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
    Just passing through:
      Rita: Sure you are. Everyone says that.
      ->INTRO
    I'm looking for someone:
      Rita: Aren't we all.
      ->SEARCH
    Goodbye:
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
    Rita: Morning.
    Rita: Good to see you again.
    Rita: Back already?
  Rita: What can I do for you?
  EOD
```

The `ONCE` block plays only on the first visit. The `CYCLE` block rotates through its lines on subsequent visits. See [Sequences](/guide/sequences) for the full picture.

## Variables and inline expressions

Flow supports variables and inline expressions for dynamic content:

```flow
VAR playerName = "Stranger"
VAR gold = 0
VAR reputation = 0

<<MARKET>>:
  Rita: Welcome, {playerName}. Good to see you.
  Rita: You're carrying {gold} gold pieces.
  Rita: Around here, you're known as {reputation > 5 ? "a friend" | "an outsider"}.
  Rita: I've got {Apples | Bread | Dried Meat} fresh in today.
  -> REPUTATION_CHECK
  EOD

<<REPUTATION_CHECK>>:
  Guard: You look like {reputation >= 3 ? "someone I can trust" | "trouble"}, {playerName}.
  EOD
```

::: tip Inline expressions
- `{varName}` — replaced with the variable's value at display time
- `{condition ? trueVal | falseVal}` — inline ternary
- `{A | B | C}` — inline random pick from the options
:::

## Parallel tracks and await

Run dialogue in parallel and synchronize with await:

```flow
<<STAKEOUT>>:
  Rita: Watch the door. I'll be on comms.
  PARALLEL: GUARD_PATROL
  Rita: Stay low.
  John: Copy that.
  // Block here until GUARD_PATROL finishes its route.
  AWAIT: GUARD_PATROL
  Rita: He's gone. Move now.
  EOD

<<GUARD_PATROL>>:
  Guard: Sector one, clear.
  Guard: Sector two, clear.
  Guard: All quiet. Returning to post.
  EOD
```

::: tip Await variants
- `AWAIT: TrackName` — wait until the named PARALLEL track reaches EOD
- `AWAIT: 2.5` — wait N seconds (no platform event needed)
- `AWAIT: EventName` — suspend until the platform calls ResumeFromAwait()
- `AWAIT: IsReady()` — suspend until platform function returns true
:::

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

For files with long paths, use `AS` to give them a short alias:
```flow
#INCLUDE characters/npc_rita_vasquez.flow AS rita
```
Then reference with the alias: `->rita.RITA_INTRO`
:::

## Next steps

- [Writing Dialogue](/guide/writing-dialogue) — the full language guide
- [Sequences](/guide/sequences) — ONCE, CYCLE, SHUFFLE, weighted RANDOM
- [Parallel Tracks](/guide/parallel-tracks) — PARALLEL, AWAIT, KILL, SIMULTANEOUS
- [Narration](/guide/narration) — stage directions and narrator lines
- [Syntax Reference](/reference/syntax) — complete syntax listing
