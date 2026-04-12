# Variables

Flow has three kinds of variables, each serving a different purpose.

| Kind | Keyword | Scope | Reference syntax |
|------|---------|-------|-----------------|
| Compile-time constant | `CONST` | Parse time only | `$Name` |
| Persistent variable | `VAR` | Runtime, persists across scenes | `{name}` |
| Session variable | `TEMP` | Runtime, reset each session | `{name}` |

---

## CONST — compile-time constants

`CONST` defines a value that is substituted literally into the script text before the file is parsed. It is not a runtime variable — it cannot be changed and is invisible to the engine.

```flow
CONST PlayerName = "Alex"
CONST MaxHealth = "100"
CONST QuestTitle = "The Last Signal"
```

Reference with a bare `$` sign — no braces:

```flow
Rita: Welcome, $PlayerName. Your mission is $QuestTitle.
John: Maximum health is $MaxHealth.
```

::: warning No runtime access
`CONST` values exist only in the source text. They are gone after parsing — you cannot read or write them at runtime.
:::

Multiple constants are substituted in definition order. If a constant name is a prefix of another (e.g. `HEALTH` and `HEALTH_MAX`), define the longer name first to avoid partial replacements.

---

## VAR — persistent variables

`VAR` declares a named variable stored in the runtime's `IFlowVariablesStorage`. Declare at the **top level** of the file (not inside a block):

```flow
VAR reputation = 0
VAR has_key = false
VAR faction = "neutral"
```

Values persist for the lifetime of the storage object — typically across scenes or for an entire play session, depending on how your game integrates the storage.

If a variable is already declared (e.g. from an included file), the second declaration is silently ignored with a warning.

### Reading in dialogue

Reference with `{braces}`:

```flow
Rita: Your reputation is {reputation}.
John: Faction: {faction}.
```

### Writing in dialogue

Use the `SET` shorthand or `[[set ...]]` command:

```flow
SET reputation = 5
SET has_key = true
[[set faction = "rebels"]]
```

These are processed by the `set` command handler in your runtime. The built-in `SetCommand` writes directly to `IFlowVariablesStorage`.

---

## TEMP — session variables

`TEMP` at the **top level** works like `VAR` but is registered as a temporary — reset at the start of each session:

```flow
TEMP visit_count = 0
TEMP intro_seen = false
```

`TEMP` **inside a block** creates a graph node that sets the variable mid-dialogue:

```flow
<<SHOP>>:
  TEMP visit_count = 1
  Rita: Welcome.
  EOD
```

This is useful for tracking state that should reset between play sessions, like first-visit flags within a single run.

---

## Inline expressions

Anywhere `{braces}` appear in a line of text, the runtime evaluates the content:

### Variable substitution

```flow
Rita: You have {gold} coins and {arrows} arrows.
```

If the variable is not found, the original `{gold}` text is left unchanged.

### Ternary expression

```flow
// {condition ? trueValue | falseValue}
Rita: You look {reputation > 5 ? "trustworthy" | "suspicious"} to me.
John: The door is {has_key ? "unlocked" | "still locked"}.
```

The condition is evaluated by the expression parser. Any comparison or logical expression is valid.

### Random pick

```flow
// {Option A | Option B | Option C}
John: {Morning|Afternoon|Evening}, traveller.
Rita: {See you around.|Take care.|Watch yourself.}
```

One option is chosen at random each time the line is delivered.

### General expression

Any expression that doesn't match the above patterns is passed to the expression evaluator and its result is inserted:

```flow
Rita: That's {gold * 2} after the discount.
John: Score: {kills + assists}.
```

---

## Example — all three in one file

```flow
CONST GameTitle = "Ember Protocol"
VAR reputation = 0
TEMP intro_played = false

<<INTRO>>:
  TEMP intro_played = true
  > Welcome to $GameTitle.
  Rita: Reputation: {reputation}.
  SET reputation = 1
  Rita: Now it's {reputation}.
  EOD
```
