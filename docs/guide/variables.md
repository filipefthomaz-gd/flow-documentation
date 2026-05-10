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
CONST EnemyType = "Golem"
```

Reference with a bare `$` sign — no braces:

```flow
Rita: Welcome, $PlayerName. Your mission is $QuestTitle.
John: Maximum health is $MaxHealth.
Guard: Watch out for the $EnemyType ahead!
```

::: warning No runtime access
`CONST` values exist only in the source text. They are gone after parsing — you cannot read or write them at runtime.
:::

Multiple constants are substituted in definition order. If a constant name is a prefix of another (e.g. `HEALTH` and `HEALTH_MAX`), define the longer name first to avoid partial replacements.

### Advanced CONST usage

```flow
CONST HeroName = "Aria"
CONST Weapon = "Sword of Light"
CONST Location = "Crystal Cave"

<<ENTRANCE>>:
  > The $HeroName enters the $Location, gripping the $Weapon tightly.
  Rita: You made it! The $Weapon glows with power.
  John: Nothing can stop us now — not even the guardians of $Location.
  EOD
```

## VAR — persistent variables

`VAR` declares a named variable stored in the runtime's `IFlowVariablesStorage`. Declare at the **top level** of the file (not inside a block):

```flow
VAR reputation = 0
VAR has_key = false
VAR faction = "neutral"
VAR playerName = "Stranger"
VAR gold = 0
VAR mood = "neutral"
```

Values persist for the lifetime of the storage object — typically across scenes or for an entire play session, depending on how your game integrates the storage.

If a variable is already declared (e.g. from an included file), the second declaration is silently ignored with a warning.

### Reading in dialogue

Reference with `{braces}`:

```flow
Rita: Your reputation is {reputation}.
John: Faction: {faction}.
Rita: Welcome, {playerName}. You have {gold} gold.
John: Mood on file: {mood}.
```

### Writing in dialogue

Use the `SET` shorthand or `[[set ...]]` command:

```flow
SET reputation = 5
SET has_key = true
[[set faction = "rebels"]]
[[set playerName = "Aria"]]
[[set gold = 150]]
```

Compound assignment operators modify the current value in place:

```flow
SET reputation += 1     // add
SET gold -= cost        // subtract using another variable
SET damage *= 2         // multiply
SET health /= 2         // divide
```

The right-hand side is a full expression — you can use variables, arithmetic, and comparisons.

These are processed by the `set` command handler in your runtime. The built-in `SetCommand` writes directly to `IFlowVariablesStorage`.

### Variable persistence example

```flow
VAR reputation = 0
VAR mood = "neutral"
TEMP session_greeted = false

<<FIRST_MEETING>>:
  SET reputation += 1
  TEMP local_flag = true
  IF reputation >= 3:
    Rita: We go way back. Reputation: {reputation}.
  ELSE:
    Rita: New face. Visits so far: {reputation}.
    -> FIRST_MEETING
  SET mood = "curious"
  -> SHOP

<<SHOP>>:
  // TEMP local_flag from FIRST_MEETING is gone — cleared after that dialogue ended.
  // VAR reputation and mood still have their values.
  Rita: Mood on file: {mood}.
  IF session_greeted == false:
    Rita: Haven't greeted you yet this session.
    SET session_greeted = true
    <
  ELSE:
    Rita: Already said hello.
  EOD: EOD
```

## TEMP — session variables

`TEMP` at the **top level** works like `VAR` but is registered as a temporary — reset at the start of each session:

```flow
TEMP visit_count = 0
TEMP intro_seen = false
TEMP tutorial_complete = false
```

`TEMP` **inside a block** creates a graph node that sets the variable mid-dialogue:

```flow
<<SHOP>>:
  TEMP visit_count = 1
  Rita: Welcome.
  EOD
```

This is useful for tracking state that should reset between play sessions, like first-visit flags within a single run.

### TEMP usage examples

```flow
TEMP player_entered_shop = false
TEMP hint_shown = false

<<SHOP_ENTRANCE>>:
  > The shop bell jingles as you enter.
  IF player_entered_shop == false:
    SET player_entered_shop = true
    Rita: Welcome traveler! First time in my shop?
    ->
  ELSE:
    Rita: Back again? Need more supplies?
  EOD

<<HINT_SYSTEM>>:
  IF hint_shown == false:
    > A faint glow highlights the interactable object.
    SET hint_shown = true
    Rita: That looks important.
  EOD
```

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

The expression evaluator supports full arithmetic (`+`, `-`, `*`, `/`), comparison (`==`, `!=`, `<`, `>`, `<=`, `>=`), logical (`&&`, `||`, `!` / `not`, `and`, `or`), and parentheses for grouping. Operator precedence follows standard rules.

::: tip String concatenation
`+` between a string and any other type produces a string: `{"Part " + chapter}` gives `"Part 2"`.
:::

::: info Numbers in output
Integer-valued numbers are rendered without a decimal point: `{gold * 1.0}` where gold is `10` outputs `10`, not `10.0`.
:::

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
