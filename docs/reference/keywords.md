# Keywords

## Control flow

| Keyword | Purpose |
|---------|---------|
| `OPTIONS` / `CHOICES` / `BRANCHING` / `?` | Present a set of choices to the player |
| `SIMULTANEOUS` | Run multiple branches in parallel |
| `IF` | Conditional branch |
| `ELSE IF` | Additional conditional branch |
| `ELSE` | Fallback conditional branch |
| `TUNNEL` | Jump to a root section and automatically return when it ends |
| `EOD` | End of dialogue |
| `RETURN` / `<-` | Return to parent scope |
| `END_INTERRUPTION` | Same as `<-` |
| `<` | Return to nearest choice list |
| `PAUSE` | Pause execution (used by runtime integrations) |

## Sequences

| Keyword | Behaviour |
|---------|-----------|
| `RANDOM` | Pick one branch at random (can repeat) |
| `SHUFFLE` | Pick at random, non-repeating until pool exhausted |
| `CYCLE` | Pick in order, round-robin |
| `ONCE` | Play once, silently skip on repeat |

## Narration

| Keyword | Purpose |
|---------|---------|
| `>` | Narration shorthand — non-voiced line, no speaker |
| `NARRATION` | Explicit narration keyword — identical to `>` |

## Structure

| Keyword | Purpose |
|---------|---------|
| `CONST` | Define a compile-time text constant |
| `#INCLUDE` | Include another Flow file |
| `IGNORE` | Mark a block to be skipped entirely |

---

## Choice option modifiers

| Prefix | Meaning |
|--------|---------|
| *(none)* | Normal selectable option |
| `*` | Locked — visible but not selectable |
| `#` | Hidden — not shown in the choice list |
| `SILENCE` | Silent hidden option — plays when no choice is made (timed) |

---

## Timed choice flags

Applied to `OPTIONS` with pipe separators: `OPTIONS|time|flag|flag`

| Flag | Meaning |
|------|---------|
| `5.0` | Time limit in seconds |
| `C` or `CONTINUE` | Continue main dialogue while timer runs |
| `I` or `INTERRUPT` | Interrupt abruptly when a choice is made |

---

## Shorthand tokens

| Token | Equivalent |
|-------|-----------|
| `>` | `NARRATION:` |
| `<` | Return to nearest choice list |
| `<-` | `RETURN` |
| `->NAME` | Jump to root `NAME` |
| `->NAME<-` | Tunnel to root `NAME` and return (arrow form) |
| `<<NAME>>` | Jump to root `NAME` (block syntax) |
| `//` | Line comment |
| `Label\|N` | Weighted RANDOM branch label with weight N |
