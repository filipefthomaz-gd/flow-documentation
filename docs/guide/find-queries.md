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

## Node conditions with @requires

If a root node has an `@requires` condition, it is evaluated automatically during every `find()` query. Nodes whose conditions fail are excluded — even if their metadata matches the query:

```flow
<<PICK_SCENE>>:
  -> find(@tag CONTAINS "combat")
  EOD

<<FOREST_FIGHT>>:
  @tag: combat
  @zone: forest
  @requires: $player_level > 3
  @priority: 5
  ---
  Alice: Goblins ambush you!
  EOD

<<BOSS_FIGHT>>:
  @tag: combat
  @zone: castle
  @requires: $player_level >= 10
  @priority: 10
  ---
  Charlie: The dragon awakens!
  EOD
```

At `player_level = 7`, only `FOREST_FIGHT` matches: `BOSS_FIGHT` is excluded by its `@requires` condition. Node conditions use the same expression evaluator as `[[if ...]]` and run against the runtime's variable storage.

## Multiple matches and selection strategies

When more than one node matches, the runtime applies a **selection strategy** to pick one. The default strategy is `BestLeastRecentlyViewed`, which mirrors Yarn Spinner's saliency system:

1. Highest `@priority` wins
2. Most `@requires` conditions wins (specificity)
3. Least recently selected wins (recency)
4. Random tiebreak

Override the strategy per-call by appending `| strategyName` inside the `find()`:

```flow
-> find(@tag CONTAINS "combat")                         // default strategy
-> find(@tag CONTAINS "combat" | random)                // equal probability
-> find(@tag CONTAINS "combat" | best)                  // highest @priority only
-> find(@tag CONTAINS "combat" | weighted)              // probability proportional to @priority
-> find(@tag CONTAINS "combat" | recency)               // least recently selected
-> find(@tag CONTAINS "combat" | specific)              // most @requires conditions
```

| Strategy | Behaviour |
|----------|-----------|
| `default` | Priority → Specificity → Recency → Random (recommended) |
| `best` | Highest `@priority`; random tiebreak |
| `weighted` | Probability proportional to `@priority` (floor 1) |
| `recency` | Least recently selected; random tiebreak |
| `specific` | Most `@requires` conditions; random tiebreak |
| `random` | Equal probability — no weighting |

The runtime tracks how many times each node has been selected in a play session. The `recency` and `default` strategies use this to spread selection across the pool.

## As a tunnel

A find query can be used as a tunnel — it jumps to the selected node and returns when it ends:

```flow
-> find(@tag CONTAINS "ambient_bark") <-
Rita: Anyway, where were we?
```

This is the recommended pattern for barks: a short scene plays and execution returns to the next line automatically. See [Tunnel](/guide/tunnel) for the return mechanic.

## In the runtime

The find query is executed when the node is reached during traversal. It evaluates the expression against every `DialogueRootNode` in the graph, filters by `@requires` and metadata match, and applies the selection strategy.

## See also

- [Node Metadata](/guide/metadata) — how to tag nodes
- [Storylets](/guide/storylets) — full guide to the storylet pattern and strategy configuration
- [Tunnel](/guide/tunnel) — how `-> find(...) <-` returns after the selected node ends
