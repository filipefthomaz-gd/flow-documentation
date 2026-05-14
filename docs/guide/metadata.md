# Node Metadata

Root nodes can carry metadata — key-value pairs attached to the node at parse time. Metadata is used for documentation, tooling, and runtime [Find Queries](/guide/find-queries) to locate nodes dynamically.

## Syntax

Metadata lines start with `@` followed by a key, a colon, and a value:

```flow
<<ARMOURY>>:
  @tags: combat, equipment
  @author: Filipe
  @priority: 1
  ---
  Rita: Grab a weapon. Anything you like.
  John: I'll take the rifle.
  EOD
```

Use `---` to separate metadata from the body. The `---` is optional if the body starts with a non-metadata line — the body begins at the first non-`@` line:

```flow
<<METADATA_ONLY>>:
  @tags: justTags
  EOD

<<NATURAL_END>>:
  @tags: a, b
  @requires: mood > 5
  Bob: This ends naturally — no --- needed.
  EOD
```

## Multi-value keys

A single key can hold multiple values separated by commas:

```flow
@tags: combat, boss, final
@on: event1, event2
```

Values are stored as lists. Find queries can use `CONTAINS` to check membership.

## Special metadata keys

Some metadata keys have built-in semantics in Flow:

| Key | Type | Description |
|-----|------|-------------|
| `@requires` | Expression | Condition evaluated automatically during `find()` queries. If the condition is false, the node is excluded from results. Removed from the generic Metadata dictionary — not queryable via `@key` substitution. |
| `@priority` | Integer | Numeric priority for disambiguating between eligible nodes. Stored as a typed `int` field for programmatic use and also kept in Metadata so it can be queried: `find(@priority > 5)`. |

### @requires — node condition

The `@requires` expression is evaluated against the runtime's variable storage — the same evaluator used for `[[if ...]]` conditions:

```flow
<<FOREST_AMBUSH>>:
  @tag: combat
  @requires: $player_level > 3
  @priority: 10
  ---
  Alice: Goblins ambush you in the forest!
  EOD
```

Multiple `@requires` lines are AND-joined automatically:

```flow
<<BOSS_FIGHT>>:
  @tag: combat, boss
  @requires: $has_sword == true
  @requires: $player_level >= 5
  ---
  Charlie: The dragon awakens!
  EOD
```

If the condition fails, the node is invisible to `find()` — it won't match any query.

### @priority — selection weight

`@priority` stores an integer that can be queried from `find()` and used by future selection strategies (e.g., "prefer higher priority"). For now it is stored and queryable:

```flow
-> find(@tag CONTAINS "boss" && @priority > 5)
```

## What metadata is for

| Use | Description |
|-----|-------------|
| **Find Queries** | Runtime jump to a node matching criteria — `-> find(@tag CONTAINS "combat")` |
| **Documentation** | Author, notes — any info about the node |
| **Tooling** | Editor extensions, linting, and analysis can read metadata |

## In the runtime

Metadata is exposed on `DialogueRootNode` as a `Dictionary<string, List<string>>`, plus typed `Condition` and `Priority` fields for the special keys:

```csharp
runner.OnNodeStarted += nodeData =>
{
    var rootNode = runner.Graph.Nodes.Values
        .OfType<DialogueRootNode>()
        .FirstOrDefault(n => n.NodeID.rootNode == nodeData.currentNode);

    // Generic metadata — includes @priority, @tags, etc.
    if (rootNode?.Metadata.TryGetValue("tags", out var tags) == true)
    {
        foreach (var tag in tags)
            Analytics.Tag($"scene_{tag}");
    }

    // Typed fields for special keys
    if (rootNode?.Priority > 5)
        Analytics.Tag("high_priority_scene");

    // @requires is evaluated automatically during find() — not available here
};
```

## See also

- [Find Queries](/guide/find-queries) — jump to nodes by metadata at runtime
- [Writing Dialogue — Node Metadata](/guide/writing-dialogue#node-metadata) — quick syntax reference
