# Writing Dialogue

## Speaker lines

A dialogue line is `SpeakerName: text`. The speaker name can be any word or phrase — spaces are fine.

```flow
Rita: Hello there.
Old Man Jones: Come inside, it's cold out.
The Voice: You shouldn't be here.
```

::: tip Speaker names
Speaker names are freeform text before the first `:`. They're used for display and for completions in VS Code — there's no registration step.
:::

---

## Root nodes

Root nodes are named sections of dialogue. They act as jump targets and appear in the VS Code outline panel.

```flow
<<INTRO>>:
  Rita: Welcome to town.

<<CHAPTER_2>>:
  John: Things have changed since you left.

<<EPILOGUE>>:
  > The war was over. Not everyone came home.
  EOD
```

Root names are uppercase by convention, but not required.

---

## Jumping between roots

Use `->` to jump to another root node in the same file:

```flow
<<MENU>>:
  Rita: What now?
  OPTIONS:
    - Continue:
      ->CHAPTER_2
    - Quit:
      EOD
```

Cross-file jumps use dot notation after `#INCLUDE`:

```flow
#INCLUDE npcs/john.flow

<<START>>:
  ->john.JOHN_INTRO
```

You can also use the block syntax as a jump: `<<ROOT_NAME>>` on its own line.

### Tunnel — jump and return

To jump to a section and automatically return when it ends, use `TUNNEL:`:

```flow
<<ARRIVAL>>:
  Rita: Let me introduce you.
  TUNNEL: JOHN_INTRO
  Rita: Anyway. Follow me.
  EOD

<<JOHN_INTRO>>:
  John: Hey. Name's John.
  EOD
```

Arrow shorthand: `-> ROOT_NAME <-`

See [Tunnel](/guide/tunnel) for full details including cross-file tunnels and nesting.

---

## Choices

Present the player with a set of options using `OPTIONS:` (also: `CHOICES:`, `BRANCHING:`, `?:`):

```flow
OPTIONS:
  - Ask about the mission:
    Rita: It's dangerous, but necessary.
    <
  - Ask about herself:
    Rita: That's none of your business.
    <
  - Leave:
    EOD
```

### Option modifiers

| Prefix | Behaviour |
|--------|-----------|
| *(none)* | Normal selectable option |
| `*` | **Locked** — visible but not selectable |
| `#` | **Hidden** — not shown in the list |
| `SILENCE` | A silent hidden option (selected when player says nothing) |

```flow
OPTIONS:
  - Tell the truth:
    Rita: I appreciate the honesty.
  - *Lie:
    Rita: I know you're lying.
  - #SecretPath:
    Rita: How did you know about that?
  - SILENCE:
    Rita: Nothing to say?
```

### Timed choices

Add a time limit in seconds with `|`:

```flow
OPTIONS|5.0:
  - Grab the key:
    Rita: Just in time!
  - Run:
    John: Smart move.
  - SILENCE:
    Rita: You froze. The moment passed.
```

::: tip Timed choice flags
- `OPTIONS|5.0` — 5 second window, SILENCE branch selected on timeout
- `OPTIONS|5.0|C` — continue main dialogue while the timer runs
- `OPTIONS|5.0|C|I` — continue and interrupt abruptly when chosen
:::

### Returning from a branch

```flow
OPTIONS:
  - Ask about the weather:
    Rita: Terrible, as usual.
    <
  - Ask about the war:
    John: I don't talk about that.
    <
  - Leave:
    EOD
```

| Token | Returns to |
|-------|-----------|
| `<` | Nearest enclosing choice list |
| `<-` or `RETURN` | Parent scope |
| `END_INTERRUPTION` | Same as `<-` |

---

## Conditions

```flow
IF reputation >= 3:
  Rita: I trust you. Here's what I know.
ELSE IF reputation >= 1:
  Rita: You've proven yourself, somewhat.
ELSE:
  John: We don't know you well enough for this.
```

Conditions use the `[[if ...]]` command syntax under the hood, so any expression your runtime evaluates is valid. You can chain as many `ELSE IF` branches as needed. The `ELSE` is optional.

---

## Simultaneous tracks

`SIMULTANEOUS` runs multiple branches at the same time. The first branch drives the player's progression:

```flow
SIMULTANEOUS:
  - MainTrack:
    Rita: Keep moving, we're almost there.
    John: I can hear them behind us.
  - Ambience:
    > Rain hammers the rooftop.
    > Somewhere below, glass breaks.
```

Useful for overlaid narration, ambient sound cues, or characters speaking at the same time.

---

## Constants

Define a compile-time constant with `CONST` and reference it with `{$Name}`:

```flow
CONST PlayerName = "Alex"
CONST QuestTitle = "The Last Signal"

Rita: Welcome, {$PlayerName}. The mission is called {$QuestTitle}.
```

Constants are substituted during parsing — they are not runtime variables.

---

## Including other files

```flow
#INCLUDE npcs/shopkeeper.flow
#INCLUDE quests/main_quest.flow
#INCLUDE shared/barks.flow
```

All root nodes from included files become available for jumps. Include order doesn't matter.

---

## Inline commands

Embed commands in a line using `[[KEY value]]`. Commands are stripped from the displayed text and passed to the runtime:

```flow
Rita: Let's move. [[audio footsteps_run]] [[tag urgent]]
John: Get down! [[vfx explosion 1.5]] [[camera_shake 0.3]]
[[audio ambient_rain]]
Rita: Did you hear that?
```

Commands can appear anywhere in the line — before, after, or inline with text. Standalone `[[...]]` lines are processed without a speaker. See [Inline Commands](/reference/commands) for details.

---

## Comments and ignored blocks

```flow
// This line is ignored entirely

IGNORE:
  Rita: This whole block is skipped.
  OPTIONS:
    - This too:
      John: All of it.
```

Use `//` for line comments. Use `IGNORE:` to skip a block of dialogue during development without deleting it.

---

## End of dialogue

```flow
EOD
```

Terminates the dialogue. Any node that reaches `EOD` stops execution and fires the `OnDialogueCompleted` event in the runner.
