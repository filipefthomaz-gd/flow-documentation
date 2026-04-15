# Keywords

## Control flow

| Keyword | Purpose |
|---------|---------|
| `OPTIONS` / `CHOICES` / `BRANCHING` / `?` | Present a set of choices to the player |
| `SIMULTANEOUS` | Run multiple branches in parallel |
| `IF` | Conditional branch |
| `ELSE IF` | Additional conditional branch |
| `ELSE` | Fallback conditional branch |
| `CONDITIONAL` | Alias for an `IF`-style block |
| `TUNNEL` | Jump to a root section and return when it ends |
| `PARALLEL` | Start a root section in a separate track |
| `KILL` | Stop a running parallel track by name |
| `EOD` | End of dialogue |
| `RETURN` / `<-` | Return to parent scope |
| `^-` / `END_INTERRUPTION` | Same as `<-` |
| `<` | Return to nearest choice list |
| `PAUSE` | Timed delay — `PAUSE: 1.5` pauses execution for the given number of seconds |
| `AWAIT` | Suspend execution until a condition resolves — track EOD, external event, or function |
| `IGNORE` | Skip this block entirely |

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

## Variables

| Keyword | Purpose |
|---------|---------|
| `CONST` | Define a compile-time text constant, referenced as `$Name` |
| `VAR` | Declare a persistent runtime variable, referenced as `{name}` |
| `TEMP` | Declare a session-scoped variable; at top level declares it, inside a block sets it |
| `SET` | Shorthand for `[[set expr]]` — set a variable inline |

## Structure

| Keyword | Purpose |
|---------|---------|
| `#INCLUDE` | Include another Flow file — `#INCLUDE path` or `#INCLUDE path AS alias` |

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
| `^-` | `END_INTERRUPTION` |
| `->NAME` | Jump to root `NAME` |
| `->NAME<-` | Tunnel to root `NAME` and return (arrow form) |
| `<<NAME>>` | Jump to root `NAME` (block syntax) |
| `//` | Line comment |
| `SET expr` | `[[set expr]]` — supports `=`, `+=`, `-=`, `*=`, `/=` |
| `#CMD args` | `[[cmd args]]` |
| `$Name` | CONST substitution — replaced at parse time |
| `{name}` | Runtime variable substitution |
| `{a ? b \| c}` | Inline ternary expression |
| `{A \| B \| C}` | Inline random pick |
| `Label\|N` | Weighted RANDOM branch label with weight N |
