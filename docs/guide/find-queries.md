# Find Queries

Find queries let you jump to a root node by querying its [metadata](/guide/metadata) at runtime. Instead of hard-coding a jump target, you write a condition — the first matching node is selected.

This is useful for content-driven games where nodes are tagged by category, zone, mood, or any other attribute.

## Syntax

```
-> find(QUERY)
```

Where `QUERY` is an expression using `@key` references to match against node metadata:

```flow
<<START>>:
  Rita: Let's find a combat scene!
  -> find(@tag CONTAINS "combat")
  EOD

<<SCENE_A>>:
  @tag: combat, action
  @zone: forest
  ---
  Alice: You're in the forest combat area!
  EOD

<<SCENE_B>>:
  @tag: peaceful, exploration
  @zone: forest
  ---
  Bob: The peaceful forest path.
  EOD

<<SCENE_C>>:
  @tag: combat, boss
  @zone: castle
  ---
  Charlie: The boss fight!
  EOD
```

When `-> find(@tag CONTAINS "combat")` executes, the runtime searches all root nodes for one whose `@tag` metadata contains `"combat"`. It picks `SCENE_A` or `SCENE_C` — whichever comes first (non-deterministic across multiple matches).

## Query operators

| Operator | Example | Behaviour |
|----------|---------|-----------|
| `==` | `@zone == "forest"` | Exact match on value |
| `!=` | `@zone != "castle"` | Not equal |
| `>` | `@priority > 5` | Numeric greater than |
| `>=` | `@priority >= 3` | Numeric greater or equal |
| `<` | `@priority < 10` | Numeric less than |
| `<=` | `@priority <= 5` | Numeric less or equal |
| `CONTAINS` | `@tag CONTAINS "boss"` | Value is in the tag list |
| `&&` | `@tag CONTAINS "combat" && @zone == "forest"` | Logical AND |
| `\|\|` | `@zone == "forest" \|\| @zone == "cave"` | Logical OR |

## Combined queries

You can combine multiple operators for precise targeting:

```flow
-> find(@tag CONTAINS "combat" && @priority > 0 && @zone != "castle")
```

## Multiple matches

If more than one node matches, one is selected at random. This makes find queries useful for ambient, barks, and procedural content:

```flow
@tag: ambient_greeting
@mood: neutral
---
Guard: Morning.

@tag: ambient_greeting
@mood: neutral
---
Guard: Another day, another patrol.

@tag: ambient_greeting
@mood: neutral
---
Guard: You're up early.
```

## With priority

Combine with a `@priority` tag to control selection odds:

```flow
@tag: bark_combat
@priority: 3
---
John: Contact front!

@tag: bark_combat
@priority: 1
---
John: This is fine.
```

Note: find queries do not use weights — they select uniformly from matches. Use weighted `RANDOM` inside the matched node for weighted results.

## In the runtime

The find query is executed by `DialogueRootChangeNode` when it's reached during traversal. It evaluates the expression against every `DialogueRootNode` in the graph, filters by matching metadata, and picks one at random from the results.

```csharp
// The query @tag CONTAINS "combat" is expanded to check each node's metadata:
//   root.Metadata["tag"] contains "combat"
```

## See also

- [Node Metadata](/guide/metadata) — how to tag nodes
- [Writing Dialogue — Find Queries](/guide/writing-dialogue#find-queries) — quick syntax reference
- [Syntax — Find Queries](/reference/syntax#find-queries) — reference
