# Narration

Narration lines are non-voiced lines used for stage directions, scene descriptions, internal monologue, or any text that doesn't belong to a character.

They are first-class nodes in the graph — not a workaround using a dummy speaker. The runtime receives them with `isNarration = true` and no speaker, so the display layer can render them differently without any actor lookup.

---

## Syntax

There are two equivalent forms:

```flow
> The lights flicker out.

NARRATION: A cold wind moves through the room.
```

Both produce the same node. Use whichever reads more naturally in context — `>` is compact and good inline, `NARRATION:` is explicit and easier to grep.

---

## Examples

### Scene setting

```flow
<<ARRIVAL>>:
  > The train pulls into a station that isn't on any map.
  > The platform is empty. It shouldn't be.
  Rita: This is the place.
  John: Are you sure?
  Rita: No.
  NARRATION: A cold wind moves through the room.
  EOD: EOD
```

### Guard post scene with combined features

```flow
<<GUARD_POST>>:
  ONCE:
    > A guard steps out of the shadows.
    John: New face. State your business.
    OPTIONS:
      I'm here to see Rita:
        John: She's expecting you?
        IF hasInvite:
          John: Go ahead.
          ->INSIDE
        ELSE:
          John: Wait here.
          ->WAIT
      Just passing through:
        John: Sure you are.
        <
      SILENCE:
        John: No answer. Interesting.
  SHUFFLE:
    Patrol1:
      John: Eyes open, $PlayerName.
    Patrol2:
      John: Quiet night.
    Patrol3:
      John: Don't cause trouble.
  EOD: EOD

<<WAIT>>:
  > The minutes stretch on.
  CYCLE:
    Wait1:
      John: She'll be out soon.
    Wait2:
      John: Any minute now.
    Wait3:
      John: These things take time.
  EOD: EOD

<<INSIDE>>:
  > The door opens onto a dimly lit room.
  Rita: $PlayerName. You actually came.
  Rita: [[emotion relieved]] I wasn't sure you would.
  OPTIONS:
    Of course I came:
      Rita: Good. We have a lot to discuss.
    I almost didn't:
      Rita: I know. Sit down anyway.
  EOD: EOD
```

### Internal monologue

```flow
Rita: I'll look into it.
> She won't. She already knows the answer.
John: Thank you, Rita.
```

### Stage directions mixed with dialogue

```flow
<<CONFRONTATION>>:
  > John turns slowly. He doesn't look surprised.
  John: I wondered when you'd show up.
  > He gestures to a chair. You don't sit.
  John: Still stubborn. Good.
```

### With choices

```flow
OPTIONS:
  Open the door:
    > The hinges groan. Whatever was in here hasn't moved in years.
    Rita: Hello?
  Walk away:
    > You tell yourself you'll come back. You won't.
    ->STREET
```

### Internal monologue

```flow
Rita: I'll look into it.
> She won't. She already knows the answer.
John: Thank you, Rita.
```

### Stage directions mixed with dialogue

```flow
<<CONFRONTATION>>:
  > John turns slowly. He doesn't look surprised.
  John: I wondered when you'd show up.
  > He gestures to a chair. You don't sit.
  John: Still stubborn. Good.
```

### With choices

Narration works anywhere in the flow, including inside choice branches:

```flow
OPTIONS:
  Open the door:
    > The hinges groan. Whatever was in here hasn't moved in years.
    Rita: Hello?
  Walk away:
    > You tell yourself you'll come back. You won't.
    ->STREET
```

---

## In the runtime

Narration nodes carry `isNarration = true` on `DialogueLine`. The speaker is `null`.

```csharp
void OnNodeReady(DialogueNodeData data)
{
    if (data.dialogueLine.isNarration)
    {
        ShowNarration(data.dialogueLine.line);
    }
    else
    {
        ShowSpeakerLine(data.dialogueLine.speaker, data.dialogueLine.line);
    }
}
```

No actor lookup, no `IsNarrator` flag on an actor object — just a bool on the line data.

---

## Inline commands with narration

Commands work on narration lines just like speaker lines:

```flow
> [[audio thunder_crack]] The sky splits open.
> The signal goes dead. [[audio radio_static_end]]
```
