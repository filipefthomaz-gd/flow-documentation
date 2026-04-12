# Syntax Reference

## File structure

A Flow file is a plain text file (`.flow` or `.flo`) made up of indented blocks. Indentation uses **2 spaces per level** — tabs are converted automatically.

```flow
<<ROOT_NAME>>:
  SpeakerName: dialogue text
  KEYWORD:
    - Option A:
      ...
    - Option B:
      ...
```

---

## Root nodes

```flow
<<INTRO>>:
  Rita: Welcome.

<<CHAPTER_2>>:
  John: Things have changed.
```

Named sections. A file can have one or many. Execution begins at the first root.

---

## Speaker lines

```flow
Rita: This is what she says.
Old Man Jones: Speakers can contain spaces.
```

Anything before the first `:` is the speaker name.

---

## Narration

```flow
> Stage direction or scene description.

NARRATION: An alternative form — identical result.
```

Non-voiced lines with no speaker. `isNarration = true` in the node data. Both forms are equivalent.

---

## Jumps

```flow
->ROOT_NAME              // jump to root in this file
->filename.ROOT_NAME     // jump to root in an included file
<<ROOT_NAME>>            // alternative jump syntax
```

---

## Tunnel

Jump to a root section and automatically return when it ends:

```flow
TUNNEL: ROOT_NAME        // keyword form
-> ROOT_NAME <-          // arrow form — spaces optional
```

Cross-file:

```flow
TUNNEL: filename.ROOT_NAME
```

See [Tunnel](/guide/tunnel) for full details.

---

## Parallel tracks

```flow
PARALLEL: ROOT_NAME      // start a root section in a parallel track
KILL: ROOT_NAME          // stop a running parallel track
```

```flow
<<SCENE>>:
  PARALLEL: MUSIC_LOOP
  Rita: Let's go.
  John: Right behind you.
  KILL: MUSIC_LOOP
  EOD
```

---

## Choices

```flow
OPTIONS:
  - Ask about the mission:
    Rita: It's dangerous, but necessary.
    <
  - *Locked option:
    Rita: You can't ask that yet.
  - #HiddenOption:
    Rita: How did you know to ask that?
  - SILENCE:
    John: Nothing to say, huh.
```

Also accepted: `CHOICES:`, `BRANCHING:`, `?:`

### Option modifiers

| Prefix | Behaviour |
|--------|-----------|
| *(none)* | Normal selectable option |
| `*` | Locked — visible but not selectable |
| `#` | Hidden — not shown in the list |
| `SILENCE` | Silent hidden option — selected when player doesn't choose |

### Timed choices

```flow
OPTIONS|5.0:
  - Grab the key:
    Rita: Just in time.
  - SILENCE:
    John: Too slow.
```

```flow
OPTIONS|5.0|C:      // continue main dialogue while timer runs
OPTIONS|5.0|C|I:    // continue and interrupt abruptly on selection
```

---

## Sequences

### RANDOM

```flow
RANDOM:
  - Rita: Careful out there.
  - Rita: Stay sharp.
  - Rita: Eyes open.
```

Picks at random each time. Can repeat. Append `|N` to a branch label for weighted probability:

```flow
RANDOM:
  - Common|3:
    Rita: Careful out there.
  - Rare:
    Rita: Stay sharp.
```

### SHUFFLE

```flow
SHUFFLE:
  - John: I heard something last night.
  - John: The generator's acting up again.
  - John: Don't trust the new arrivals.
```

Non-repeating random. Draws from a shuffled deck; reshuffles when exhausted.

### CYCLE

```flow
CYCLE:
  - Rita: Morning.
  - Rita: Good afternoon.
  - Rita: Evening again already?
```

Cycles in order, round-robin.

### ONCE

```flow
ONCE:
  Rita: First time here? Let me show you around.
```

Plays the block on first visit. Silently skipped on all subsequent visits.

---

## Simultaneous

```flow
SIMULTANEOUS:
  - MainTrack:
    Rita: Keep moving.
    John: I can hear them.
  - Ambience:
    > Rain hammers the rooftop.
```

Runs all branches at the same time. First branch drives player progression.

---

## Conditionals

```flow
IF reputation >= 3:
  Rita: I trust you.
ELSE IF reputation >= 1:
  Rita: You've proven yourself, somewhat.
ELSE:
  John: We don't know you.
```

`ELSE IF` and `ELSE` are optional. Operators: `==`, `!=`, `<`, `>`, `<=`, `>=`, `&&`, `||`, `!`.

---

## Returning

| Token | Returns to |
|-------|-----------|
| `<` | Nearest enclosing choice list |
| `<-` or `RETURN` | Parent scope |
| `^-` or `END_INTERRUPTION` | Same as `<-` |

---

## End of dialogue

```flow
EOD
```

---

## Variables

### CONST — compile-time

```flow
CONST PlayerName = "Alex"

Rita: Welcome, $PlayerName.      // $Name — bare dollar, substituted at parse time
```

Not available at runtime. Replaced literally in the file text before parsing.

### VAR — persistent

```flow
VAR reputation = 0
VAR has_key = false
```

Declare at the top level. Reference in dialogue with `{braces}`:

```flow
Rita: Your reputation is {reputation}.
```

### TEMP — session

```flow
TEMP visit_count = 0
```

Like `VAR` but reset each session. Can also appear inside a block to set a value mid-dialogue:

```flow
<<SHOP>>:
  TEMP visit_count = 1
  Rita: Welcome.
```

### Inline expressions

Inside `{braces}` in any line of text:

```flow
// Variable
Rita: You have {gold} coins.

// Ternary: {condition ? trueVal | falseVal}
Rita: You look {reputation > 5 ? "trusted" | "suspicious"}.

// Random pick: {A | B | C}
John: {Morning|Afternoon|Evening}, traveller.
```

---

## Includes

```flow
#INCLUDE characters/rita.flow
#INCLUDE quests/main_quest.flow
```

---

## Inline commands

```flow
Rita: Let's go. [[audio footsteps_run]] [[tag urgent]]
[[audio ambient_rain]]
John: Did you hear that?
```

`[[KEY expression]]` pairs — before, after, inline, or standalone. See [Commands](/reference/commands).

### SET shorthand

```flow
SET reputation = 1           // expands to [[set reputation = 1]]
SET has_key = true
```

### # shorthand

```flow
#audio footsteps_run         // expands to [[audio footsteps_run]]
#vfx explosion 1.5           // expands to [[vfx explosion 1.5]]
```

Any `#WORD` line (other than `#INCLUDE`) is treated as a command shorthand.

---

## Comments

```flow
// This line is ignored
```

---

## Ignored blocks

```flow
IGNORE:
  Rita: This whole block is skipped during development.
```
