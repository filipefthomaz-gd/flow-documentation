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
  - Open the door:
    > The hinges groan. Whatever was in here hasn't moved in years.
    Rita: Hello?
  - Walk away:
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
