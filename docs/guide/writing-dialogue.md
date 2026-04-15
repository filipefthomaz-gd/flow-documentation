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

Cross-file jumps use dot notation. By default the prefix is the filename without extension:

```flow
#INCLUDE npcs/john.flow

<<START>>:
  ->john.JOHN_INTRO
```

Use `AS` to give the included file a shorter or more readable prefix:

```flow
#INCLUDE characters/npc_john_westbrook.flow AS john

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
| `<` | Nearest enclosing `OPTIONS` block — resumes the choice list |
| `<-` or `RETURN` | Parent scope — returns from a tunnel or ends a branch |
| `^-` or `END_INTERRUPTION` | Same as `<-` — preferred inside interruption branches |

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

Conditions use standard comparison and logical operators: `==`, `!=`, `<`, `>`, `<=`, `>=`, `&&`, `||`, `!`. You can chain as many `ELSE IF` branches as needed. The `ELSE` is optional.

---

## Parallel tracks

Flow has two ways to run content alongside the main dialogue.

### PARALLEL and KILL

`PARALLEL` starts a root section in a genuinely independent track — the master dialogue continues immediately without waiting. `KILL` stops a running parallel track by name.

```flow
<<INTRO>>:
  PARALLEL: AMBIENT_MUSIC
  Rita: Let's move.
  John: Right behind you.
  KILL: AMBIENT_MUSIC
  EOD

<<AMBIENT_MUSIC>>:
  > [[audio music_tension_loop]]
  EOD
```

Use `PARALLEL` for background loops, fire-and-forget sequences, and anything that should run independently over time.

### SIMULTANEOUS

`SIMULTANEOUS` plays multiple branches in sequence with the first branch driving player progression. It is useful for layering narration or ambient lines alongside dialogue within a single flow:

```flow
SIMULTANEOUS:
  - MainTrack:
    Rita: Keep moving, we're almost there.
    John: I can hear them behind us.
  - Ambience:
    > Rain hammers the rooftop.
    > Somewhere below, glass breaks.
```

::: warning SIMULTANEOUS is sequential, not concurrent
All branches are processed one after another in a single pass. For a track that advances independently over real time, use `PARALLEL`.
:::

### AWAIT

`AWAIT` suspends the current dialogue until something resolves — a parallel track finishing, an external event, or a function returning `true`:

```flow
<<SCENE>>:
  PARALLEL: CUTSCENE_ANIM
  AWAIT: CUTSCENE_ANIM      // resumes automatically when CUTSCENE_ANIM hits EOD
  Rita: Now let's talk.
  EOD
```

See [Parallel Tracks](/guide/parallel-tracks) for the full picture including event and function await variants.

---

## PAUSE

`PAUSE` inserts a timed beat into the dialogue. The runner delivers it like a normal line; your platform handles the actual delay.

```flow
<<REVEAL>>:
  John: I know who did it.
  PAUSE: 1.0
  John: It was you.
  EOD
```

The value is a float in seconds. Advance the dialogue as normal once the delay elapses.

---

## Variables

Flow has three kinds of variables: compile-time constants, persistent variables, and temporaries.

### CONST — compile-time substitution

`CONST` defines a value that is replaced literally in the script text at parse time. Reference it with `$Name` (bare dollar sign, no braces):

```flow
CONST PlayerName = "Alex"
CONST QuestTitle = "The Last Signal"

Rita: Welcome, $PlayerName. Your mission is $QuestTitle.
```

Constants are substituted before the file is parsed — they are not available at runtime.

### VAR — persistent variables

`VAR` declares a persistent variable stored in the runtime's variable storage. Declare at the top level of the file:

```flow
VAR reputation = 0
VAR has_key = false
VAR player_name = "Unknown"
```

Reference at runtime inside `{braces}`:

```flow
Rita: Your reputation is {reputation}.
John: Good to meet you, {player_name}.
```

Variables persist across scenes for the lifetime of the storage object.

### TEMP — session variables

`TEMP` at the top level works like `VAR` but is reset each session. Inside a block, it creates a node that sets a temporary value mid-dialogue:

```flow
TEMP visit_count = 0

<<SHOP>>:
  TEMP visit_count = 1
  Rita: Welcome back.
  EOD
```

### Inline expressions

Inside `{braces}`, you can use more than just a variable name:

```flow
// Variable substitution
Rita: You have {gold} coins.

// Ternary: {condition ? trueValue | falseValue}
Rita: You look {reputation > 5 ? "trustworthy" | "suspicious"}.

// Random pick: {A | B | C}
John: {Morning|Afternoon|Evening}, traveller.
```

---

## Constants

See [Variables](#variables) above. The short form:

```flow
CONST Key = "value"       // define
$Key                       // reference in text (bare dollar, no braces)
```

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

### Shorthands

For common operations there are shorter forms that expand to `[[...]]` at parse time:

```flow
SET reputation = 1           // expands to [[set reputation = 1]]
#audio footsteps_run         // expands to [[audio footsteps_run]]
#vfx explosion 1.5           // expands to [[vfx explosion 1.5]]
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
