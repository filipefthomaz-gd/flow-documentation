# Sequences

Flow has four ways to automatically pick from a set of branches — no player input, no explicit condition. Together they cover most of the variation patterns writers need.

| Keyword | Picks | Memory |
|---------|-------|--------|
| `RANDOM` | At random, can repeat | None |
| `SHUFFLE` | At random, non-repeating | Deck state per node |
| `CYCLE` | In order, round-robin | Counter per node |
| `ONCE` | First visit only, then skip | Visited flag per node |

::: info State persistence
`CYCLE`, `SHUFFLE`, and `ONCE` store their state in the runtime's variable storage, keyed to the node's unique ID. They persist for the lifetime of the storage object — typically a single play session.
:::

---

## RANDOM

Picks one branch at random each time it is reached. Can repeat — the same branch may play twice in a row.

```flow
RANDOM:
  - Rita: Careful out there.
  - Rita: Stay sharp.
  - Rita: Don't do anything I wouldn't do.
```

### Weighted RANDOM

Append `|N` to a branch label to give it a higher probability. Default weight is `1`.

```flow
RANDOM:
  - Common|3:
    Rita: Careful out there.
  - Uncommon:
    Rita: Stay sharp.
  - Rare:
    Rita: Don't do anything I wouldn't do.
```

In this example `Common` has a 3-in-5 chance, the other two have 1-in-5 each. The label itself is internal — it's never shown to the player. Using simple names like `1`, `2`, `3` is fine.

::: tip When to use RANDOM
Use RANDOM when you want variety and don't mind repetition — ambient barks, crowd chatter, incidental dialogue where hearing the same line twice is fine.
:::

---

## SHUFFLE

Like RANDOM, but non-repeating. Draws from a shuffled deck of all branches. Once all branches have played, the deck reshuffles and starts again.

```flow
SHUFFLE:
  - John: I heard something in the east wing last night.
  - John: The generator's been acting up again.
  - John: Don't trust the new arrivals.
  - John: Have you spoken to Rita lately?
```

The player will hear all four lines before any repeats.

::: tip When to use SHUFFLE
Use SHUFFLE when you have a pool of ambient or flavour lines and want to maximise variety — NPC ambient dialogue, random tips, environmental flavour.
:::

---

## CYCLE

Cycles through its branches in order, round-robin. The first visit plays branch 1, the second plays branch 2, and so on. After the last branch, it wraps back to branch 1.

```flow
CYCLE:
  - Rita: Morning.
  - Rita: Good afternoon.
  - Rita: Evening again already?
```

::: tip When to use CYCLE
Use CYCLE when you want predictable progression — a character's greeting changes meaningfully each time you visit, or a sequence of hints that build on each other.
:::

---

## ONCE

Plays its content block on the first visit. On every subsequent visit, the block is silently skipped and execution continues to the next line.

```flow
<<RITA_SHOP>>:
  ONCE:
    Rita: First time here? Let me show you what we have.
    Rita: I get new stock in every few days, so check back.
  Rita: What are you looking for today?
  EOD
```

On the first visit, Rita gives the introduction and then asks what you want. On every visit after, she goes straight to the question.

::: tip When to use ONCE
Use ONCE for first-meeting lines, tutorial prompts, world-building observations — anything that should only happen once but sits naturally inside a looping conversation.
:::

### ONCE with choices

The content inside `ONCE` can be anything, including choices:

```flow
ONCE:
  John: One last thing — do you know how the vault works?
  OPTIONS:
    - Yes, I've done this before:
      John: Good. Then you know what to expect.
    - No, explain it to me:
      John: Alright, listen carefully...
      ->VAULT_TUTORIAL
```

---

## Combining sequences

Sequences can be nested or combined in a single conversation:

```flow
<<GUARD_IDLE>>:
  ONCE:
    John: New around here?
  SHUFFLE:
    - John: Quiet day.
    - John: Eyes open.
    - John: Move along.
  EOD
```

On the first visit: "New around here?" plays, then one SHUFFLE line.
On subsequent visits: ONCE is skipped, only the SHUFFLE line plays.
