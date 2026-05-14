# Storylets

A **storylet** is a self-contained scene that advertises when it's available. Instead of hard-coding a jump target, the runtime picks whichever scene fits the current game state best. This pattern comes from Emily Short's writing on narrative systems — it scales well as content grows because scenes don't need to know about each other.

In Flow, storylets are root nodes with metadata. A `find()` query selects among them.

---

## Setting up storylets

Tag any root node with `@tag`, `@priority`, and `@requires`:

```flow
<<FOREST_AMBUSH>>:
  @tag: combat
  @zone: forest
  @priority: 10
  @requires: player_level > 3
  ---
  Alice: Goblins spring from the trees!
  EOD

<<CASTLE_DUEL>>:
  @tag: combat
  @zone: castle
  @priority: 10
  @requires: player_level > 3
  @requires: has_sword == true
  ---
  Charlie: The knight challenges you to a duel!
  EOD

<<TAVERN_BRAWL>>:
  @tag: combat
  @priority: 5
  ---
  Bob: Someone throws a punch across the bar.
  EOD
```

Then select one at runtime with a find query:

```flow
<<START>>:
  > Something's about to kick off.
  -> find(@tag CONTAINS "combat")
```

The runtime evaluates every root node's `@requires` conditions against the current variable storage, filters by the metadata query, and picks one using the selection strategy.

---

## Selection strategies

The default strategy is `BestLeastRecentlyViewed`, which mimics Yarn Spinner's saliency system:

1. Highest `@priority` wins
2. Most `@requires` conditions wins (specificity — more conditions = more tailored to context)
3. Least recently selected wins (recency — spreads selection across the pool over time)
4. Random tiebreak

Given the example above with `player_level = 5` and `has_sword = true`:
- `TAVERN_BRAWL` is excluded by `@priority` (5 < 10)
- `FOREST_AMBUSH` and `CASTLE_DUEL` both pass at priority 10
- `CASTLE_DUEL` wins on specificity — it has two `@requires` conditions vs one

Override the strategy per-call with `| strategyName`:

```flow
-> find(@tag CONTAINS "combat" | random)     // equal probability
-> find(@tag CONTAINS "combat" | best)       // highest @priority only
-> find(@tag CONTAINS "combat" | weighted)   // probability proportional to @priority
-> find(@tag CONTAINS "combat" | recency)    // least recently selected
-> find(@tag CONTAINS "combat" | specific)   // most @requires conditions
```

| Strategy | Use for |
|----------|---------|
| `default` | General-purpose — good for most content |
| `best` | When you always want the highest priority scene, regardless of recency |
| `weighted` | When priority should act as a probability weight, not a hard rank |
| `recency` | When you want to rotate through a pool evenly |
| `specific` | When you want the most contextually tailored scene |
| `random` | Ambient barks and variation where recency doesn't matter |

---

## @requires

`@requires` evaluates against the runtime's variable storage using the same expression parser as `IF` conditions:

```flow
<<QUEST_HINT>>:
  @tag: hint
  @requires: completed_tutorial == true
  @requires: quest_active == true
  ---
  Guide: You'll find the key in the east wing.
  EOD
```

Multiple `@requires` lines are joined with `&&` — all must be true for the node to be eligible. A node with no `@requires` is always eligible (assuming the metadata query matches).

---

## Barks via tunnel

The most common pattern: a find query as a tunnel that returns after the bark plays.

```flow
<<MAIN_SCENE>>:
  Rita: Let me find you someone to talk to.
  -> find(@tag CONTAINS "ambient_npc") <-
  Rita: Right. Shall we move on?
  EOD
```

The matched node plays in full, then execution returns to `Rita: Right. Shall we move on?`. See [Tunnel](/guide/tunnel) for the return mechanic.

---

## Recency tracking

Each time a node is selected by `find()`, the runtime increments a visit counter stored in variable storage under the key `<nodeName>_find_visits`. The `recency` and `default` strategies read this counter to prefer less-recently-seen nodes.

Visit counts persist for the lifetime of the variable storage object — typically a single play session.

---

## See also

- [Node Metadata](/guide/metadata) — tagging syntax
- [Find Queries](/guide/find-queries) — query operators and syntax reference
- [Tunnel](/guide/tunnel) — how `-> find(...) <-` returns automatically
