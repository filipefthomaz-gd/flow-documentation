# Inline Commands

Commands are embedded in dialogue lines using `[[KEY expression]]` syntax. They are stripped from the displayed text and passed to the runtime for processing.

## Placement

Commands can appear **anywhere** in a line — before the text, after it, or inline:

```flow
Rita: [[emotion angry]] I told you not to come back.
Rita: Let's move. [[audio footsteps_run]] [[tag urgent]]
John: I [[audio heartbeat]] can't breathe.
[[audio ambient_rain]]
Rita: Did you hear that?
```

A standalone `[[...]]` line (no speaker) is processed as a command event with no associated text.

Multiple commands on the same line are all processed in order.

---

## Shorthands

Two shorthand forms expand to `[[...]]` at parse time:

### SET shorthand

```flow
SET reputation = 1           // same as [[set reputation = 1]]
SET has_key = true
SET player_name = "Alex"
```

`SET` followed by anything on the same line becomes `[[set ...]]`. Useful for setting variables without embedding them inside a speaker line.

Compound assignment operators are also supported:

```flow
SET reputation += 1          // add
SET gold -= cost             // subtract, RHS can be a variable or expression
SET damage *= 2              // multiply
SET health /= 2              // divide
```

### # shorthand

```flow
#audio footsteps_run         // same as [[audio footsteps_run]]
#vfx explosion 1.5           // same as [[vfx explosion 1.5]]
#camera_shake 0.3            // same as [[camera_shake 0.3]]
#tag cutscene                // same as [[tag cutscene]]
```

Any line starting with `#WORD` (other than `#INCLUDE`) is treated as a command shorthand. The word after `#` becomes the command key; the rest of the line becomes the argument.

::: tip When to use shorthands
Use `SET` and `#` for standalone commands that aren't part of spoken text. They read more cleanly than a bare `[[...]]` line when the intent is obvious.
:::

---

## Built-in commands

The Flow library itself ships exactly two commands — everything else is bring-your-own:

| Command | Example | When it runs |
|---------|---------|-------------|
| `set` | `[[set reputation = 1]]` | When its line is reached (or its option picked) |
| `if` | `[[if reputation >= 2]]` | Condition — decides whether the line or option happens at all |

::: info `if` and canBeParsed
The `[[if ...]]` command controls whether a line or choice option is shown. If the condition is false, `canBeParsed` is set to `false` and the node is skipped. This is how conditional choices work internally.
:::

---

## Custom commands

Any other `[[KEY value]]` pair is valid syntax — Flow strips it from the displayed text and hands it to your game as a `DialogueLineCommand` with `key` and `data` fields. What happens next (playing audio, triggering an animation, shaking the camera) is entirely up to your integration:

```flow
Rita: Let's move. [[audio footsteps_run]] [[tag urgent]]
John: Watch out! [[vfx explosion]] [[camera_shake 0.3]]
Rita: The door is locked. [[highlight door_object]]
```

`audio`, `tag`, `vfx`, `camera_shake`, `emotion`, and similar are not part of Flow — they're conventions an integration defines by implementing `IDialogueCommand` for each key it wants to handle. Unrecognized commands are simply passed through; nothing breaks if your runtime doesn't implement a given key.

---

## When commands run

Each handler declares a `Timing` (`DialogueCommandTiming`):

| Timing | Runs |
|--------|------|
| `OnReach` | As soon as its host happens — a line when reached, a standalone command when reached, an option when picked. |
| `Condition` | Whenever its host is considered — a line when reached, an option while the choices are shown. No side effects. |
| `Inline` | Where it sits in the line's text, as delivery reaches it. |
| `OnLoad` | Once, when the dialogue file loads — for every place it is written, and never while the dialogue plays. |

Two rules hold for all of them:

- **Conditions come first.** Effects never run when a condition gates their host out: `Rita: Hi. [[if met]] [[set greeted = true]]` only sets `greeted` if the line is actually shown.
- **Effects run before the text is resolved**, so `[[set coins = 3]] You have {coins} coins.` reads `3`.

### Inline commands

For presentation — sounds, animation, staging — placement is timing:

```flow
Rita: [[sfx door]] Who's there?            // plays as the line starts
Rita: I told you [[sfx slam]] not to come. // plays as the text reaches "not"
Rita: Fine. Leave. [[anim storm_off]]      // plays once the whole line is out
```

- Commands before the text fire when the line starts.
- The platform reports delivery progress with `DialogueRunner.ReportDeliveryProgress(nodeData, position)`. `InlineCommandMarkers` helps track positions through display formatting (speaker prefixes, rich text).
- Anything not reported yet fires when the platform calls `OnLineDeliveryCompleted` — so skipping, voice-only delivery and platforms that never report progress still fire every command.
- With no text to deliver — standalone commands, `PAUSE:` lines, choice options — `Inline` behaves like `OnReach`.

Keep state changes (`set`, inventory, quest flags) `OnReach`: changing state halfway through a line is rarely what you want.

```csharp
public class SfxCommand : IDialogueCommand
{
    public string Key => "sfx";
    public DialogueCommandTiming Timing => DialogueCommandTiming.Inline;

    public void Execute(DialogueLine line, DialogueLineCommand command)
    {
        AudioManager.Play(command.data);
    }
}
```

### Waiting for a command

Nothing waits for a command unless the script says so. Some commands keep running after they start — a character walking in, a fade, an animation — and you can hold the dialogue until one is done:

```flow
AWAIT: #enter tavis                               // run it, wait until Tavis is in
[[enter tavis]].await() [[sfx door]]              // the door plays once he's in
[[enter tavis]] [[sfx door]].await()              // both start together; waits for the sound
Rita: I told you [[sfx slam]].await() not to.     // typing pauses at "not" until the slam ends
Rita: Fine. Leave. [[anim storm_off]].await()     // won't advance until she's gone
"Come in" [[enter tavis]].await():                // the branch starts once he's in
```

`.await()` means: **nothing after it happens until that command is done** — the rest of the text, the next commands on the same line, the next line. Without it, the command runs and the dialogue carries on. Skipping stops waiting (the command itself keeps running).

A command reports that it keeps running by calling `Hold()` on its `DialogueLineCommand` and invoking the returned action once finished. Commands that never hold are done as soon as `Execute` returns, so awaiting them doesn't wait.

```csharp
public void Execute(DialogueLine line, DialogueLineCommand command)
{
    var done = command.Hold();
    Characters.Enter(command.data, onFinished: done);
}
```

Platforms pause delivery while `DialogueLine.IsHeld()` is true, and call `DialogueRunner.ReleaseHolds()` when the player skips.

### On load

`OnLoad` commands run when the platform calls `DialogueGraph.LoadCommands()` after building a file's graph, before anything plays — like `[[tag]]`, which is picked up while the graph is built. Use them to prepare assets or register metadata:

```flow
[[preload_audio gunshot]]
Rita: Get down! [[sfx gunshot]]
```

They run for every occurrence, including ones behind conditions that never pass, so they must not depend on dialogue state. They are never run during validation, and never while the dialogue plays.
