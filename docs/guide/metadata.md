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
  @when: mood > 5
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

## What metadata is for

| Use | Description |
|-----|-------------|
| **Find Queries** | Runtime jump to a node matching criteria — `-> find(@tag CONTAINS "combat")` |
| **Documentation** | Author, priority, notes — any info about the node |
| **Tooling** | Editor extensions, linting, and analysis can read metadata |

## In the runtime

Metadata is exposed on `DialogueRootNode` as a `Dictionary<string, List<string>>`. Your game can inspect it when a node starts:

```csharp
runner.OnNodeStarted += nodeData =>
{
    var rootNode = runner.Graph.Nodes.Values
        .OfType<DialogueRootNode>()
        .FirstOrDefault(n => n.NodeID.rootNode == nodeData.currentNode);
    
    if (rootNode?.Metadata.TryGetValue("tags", out var tags) == true)
    {
        foreach (var tag in tags)
            Analytics.Tag($"scene_{tag}");
    }
};
```

## See also

- [Find Queries](/guide/find-queries) — jump to nodes by metadata at runtime
- [Writing Dialogue — Node Metadata](/guide/writing-dialogue#node-metadata) — quick syntax reference
