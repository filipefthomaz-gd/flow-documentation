# Parallel Tracks

Flow can run more than one thread of dialogue at the same time. This is used for background music loops, ambient characters talking while a scene plays out, or waiting for an independent sequence to finish before continuing.

There are two mechanisms:

| | `PARALLEL` | `SIMULTANEOUS` |
|---|---|---|
| Execution | True non-blocking — slave runs on its own | Sequential — branches run one after another |
| Blocks master? | No | No |
| Use for | Background loops, ambient tracks, fire-and-forget sequences | Layered narration, overlaid stage directions |

::: tip Prefer PARALLEL for real concurrency
`SIMULTANEOUS` processes its branches in a single traversal pass, which makes it effectively sequential. Use `PARALLEL` when you need a genuinely independent track that runs alongside the main dialogue.
:::

---

## PARALLEL

`PARALLEL` starts a root section in a separate track without pausing the current dialogue. The master track continues immediately; the slave runs independently.

```flow
<<SCENE>>:
  PARALLEL: AMBIENT_MUSIC
  Rita: Let's move.
  John: Right behind you.
  Rita: Through here.
  KILL: AMBIENT_MUSIC
  EOD

<<AMBIENT_MUSIC>>:
  > [[audio music_tension_loop]]
  EOD
```

The slave track starts when `PARALLEL` is reached and keeps running while the master plays through Rita and John's lines. `KILL` stops it.

### How it works in the runtime

When the runner encounters `PARALLEL`, it fires `OnParallelStarted`. Your platform layer is responsible for spinning up a second `DialogueRunner` pointing at the target root, and starting it:

```csharp
runner.OnParallelStarted += node =>
{
    var slave = new DialogueRunner(dialogueFile, node.TargetNode.NodeID);
    slave.Start();
    _activeTracks[node.TargetRootNode] = slave;
};
```

The master runner continues without waiting.

---

## KILL

`KILL` stops a running parallel track by name.

```flow
KILL: AMBIENT_MUSIC
```

When the runner encounters `KILL`, it fires `OnKillRequested` with the track name. Your platform layer calls `Abort()` on the corresponding slave runner:

```csharp
runner.OnKillRequested += trackName =>
{
    if (_activeTracks.TryGetValue(trackName, out var slave))
    {
        slave.Abort();
        _activeTracks.Remove(trackName);
    }
};
```

If a parallel track reaches `EOD` naturally before `KILL` is called, it completes on its own — no cleanup needed.

---

## AWAIT

`AWAIT` suspends the current dialogue until a condition is met. There are three variants:

### AWAIT: track name

Waits for a parallel track to finish. The runner suspends and resumes automatically when the named track hits `EOD` — no platform code required beyond what `PARALLEL` already sets up.

```flow
<<SCENE>>:
  PARALLEL: CUTSCENE_ANIM
  AWAIT: CUTSCENE_ANIM
  Rita: Now that's done — let's talk.
  EOD

<<CUTSCENE_ANIM>>:
  > [[anim door_open]]
  > [[anim character_enter]]
  EOD
```

`AWAIT: CUTSCENE_ANIM` suspends the master until `CUTSCENE_ANIM` completes. This is race-condition safe — if the slave finishes before `AWAIT` is reached, the master resumes immediately.

### AWAIT: event name

Waits for your game to signal an external event. The runner fires `OnAwaitReached`; your platform calls `ResumeFromAwait()` when the event occurs.

```flow
<<ARRIVAL>>:
  > The train doors open.
  AWAIT: player_exits_train
  John: You made it.
  EOD
```

```csharp
runner.OnAwaitReached += awaitNode =>
{
    // Subscribe to your game event
    GameEvents.On(awaitNode.Value, () => runner.ResumeFromAwait());
};
```

### AWAIT: function name

Waits until a function you supply returns `true`. The runner fires `OnAwaitReached`; your platform polls the function and calls `ResumeFromAwait()` when it returns `true`.

```flow
<<SCENE>>:
  PARALLEL: GUARD_PATROL
  AWAIT: IsGuardAtDoor()
  Rita: Now — while he's at the door.
  EOD
```

```csharp
runner.OnAwaitReached += awaitNode =>
{
    // Poll each frame until true, then resume
    StartCoroutine(PollUntilTrue(
        () => EvaluateFunction(awaitNode.Value),
        () => runner.ResumeFromAwait()
    ));
};
```

::: info AWAIT: float is a PAUSE
`AWAIT: 2.5` is parsed as a timed pause, not an event await — the float is passed directly to the delivery layer. See [PAUSE](#pause) below.
:::

---

## PAUSE

`PAUSE` inserts a timed delay into the dialogue. The runner delivers it as a line node with the float value — your platform layer handles the actual timing.

```flow
<<ENTRANCE>>:
  > The door swings open.
  PAUSE: 1.5
  John: Finally.
  EOD
```

The runtime receives a `DialogueNodeData` with `type == Pause` and `dialogueLine.line` set to the float string. Advance after the pause exactly as you would for a normal line — call `OnLineDeliveryCompleted` once the delay elapses.

::: tip AWAIT vs PAUSE
Use `PAUSE` for a simple timed beat. Use `AWAIT` when the delay depends on something happening in your game — an animation finishing, a player input, a game state change.
:::

---

## SIMULTANEOUS

`SIMULTANEOUS` plays multiple branches in sequence, with the first branch driving player progression. It is useful for layering narration or ambient lines alongside a main dialogue track within a single linear flow.

```flow
SIMULTANEOUS:
  - MainTrack:
    Rita: Keep moving — we're almost there.
    John: I can hear them behind us.
  - Ambience:
    > Rain hammers the rooftop.
    > Somewhere below, glass breaks.
```

Both branches run to completion in a single pass. The first branch (`MainTrack`) is what the player sees for pacing; `Ambience` provides parallel descriptive content.

::: warning Not truly concurrent
`SIMULTANEOUS` processes all branches one after another in the same traversal step. It is not the same as `PARALLEL`. If you need a slave track that advances independently over time, use `PARALLEL` instead.
:::

---

## Patterns

### Fire-and-forget background track

```flow
<<COMBAT_INTRO>>:
  PARALLEL: TENSION_MUSIC
  Rita: They know we're here.
  John: How many?
  Rita: Too many.
  KILL: TENSION_MUSIC
  EOD

<<TENSION_MUSIC>>:
  > [[audio music_combat_loop]]
  EOD
```

### Wait for animation before continuing

```flow
<<CUTSCENE>>:
  PARALLEL: DOOR_ANIM
  > The lock clicks.
  AWAIT: DOOR_ANIM
  > The vault swings open.
  Rita: There it is.
  EOD

<<DOOR_ANIM>>:
  > [[anim vault_door_open 2.0]]
  EOD
```

### Beat pause between lines

```flow
<<REVEAL>>:
  John: I know who did it.
  PAUSE: 1.0
  John: It was you.
  EOD
```

### Ambient narration alongside dialogue

```flow
<<RAID>>:
  SIMULTANEOUS:
    - Dialogue:
      Rita: Breach on three.
      John: Ready.
      Rita: Three.
    - Scene:
      > Smoke drifts through the corridor.
      > Somewhere a fire alarm begins to wail.
```
