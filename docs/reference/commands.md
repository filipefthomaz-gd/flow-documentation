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
| `set` | `[[set reputation = 1]]` | Parse time |
| `if` | `[[if reputation >= 2]]` | Parse time — controls `canBeParsed` |

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

## Execution timing

Commands can run at different points in the dialogue lifecycle:

| Timing | Constant | When |
|--------|----------|------|
| `OnParse` | `DialogueCommandExecution.OnParse` | When the node is first parsed (before display) |
| `OnDeliveryStart` | `DialogueCommandExecution.OnDeliveryStart` | When the line starts playing |
| `OnDeliveryEnd` | `DialogueCommandExecution.OnDeliveryEnd` | When the line finishes |

Implement `IDialogueCommand` in your runtime to handle commands with specific timing:

```csharp
public class AudioCommand : IDialogueCommand
{
    public string Key => "audio";
    public DialogueCommandExecution Execution => DialogueCommandExecution.OnDeliveryStart;

    public void Execute(DialogueLine line, DialogueLineCommand command)
    {
        AudioManager.Play(command.data);
    }
}
```
