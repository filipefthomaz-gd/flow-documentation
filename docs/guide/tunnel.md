# Tunnel

A **tunnel** is a jump that automatically returns. You call a root section like a subroutine — it plays in full, and when it ends, execution resumes from the next line after the tunnel call.

```flow
<<ENTRANCE>>:
  Rita: I need to introduce you to someone.
  TUNNEL: JOHN_INTRO
  Rita: Anyway. Where were we?
  EOD

<<JOHN_INTRO>>:
  John: Hey. Name's John.
  Rita: He's with me.
  EOD
```

The player sees:
1. Rita's introduction
2. John's greeting + Rita's vouching
3. Rita's "Where were we?" — execution returned automatically when `JOHN_INTRO` hit `EOD`

### Guard post example with arrow shorthand

```flow
<<GUARD_POST>>:
  > The guard post is quiet tonight.
  ->JOHN_INTRO<-
  John: Back to your post.
  EOD: EOD

<<JOHN_INTRO>>:
  John: Hey. Name's John.
  Rita: He's with me.
  EOD: EOD
```

---

## Syntax

Both forms produce the same result:

```flow
TUNNEL: ROOT_NAME          // keyword form — explicit and readable
-> ROOT_NAME <-            // arrow form — concise
```

Spaces around the target are optional:

```flow
->JOHN_INTRO<-
-> JOHN_INTRO <-
```

---

## Cross-file tunnels

Works the same as cross-file jumps, using dot notation after `#INCLUDE`. The prefix is the filename without extension, or the alias if `AS` was used:

```flow
#INCLUDE npcs/john.flow

<<START>>:
  Rita: Hang on.
  TUNNEL: john.GREETING
  Rita: Right. Let's go.
  EOD
```

```flow
#INCLUDE characters/npc_john_westbrook.flow AS john

<<START>>:
  TUNNEL: john.GREETING   // same — alias replaces the filename prefix
  EOD
```

---

## Nested tunnels

Tunnels maintain a call stack, so they can be nested:

```flow
<<MAIN>>:
  TUNNEL: CHAPTER_OPENING
  Rita: Now the real work begins.
  EOD

<<CHAPTER_OPENING>>:
  > The sun sets over the city.
  TUNNEL: JOHN_INTRO
  Rita: That's everyone.
  EOD

<<JOHN_INTRO>>:
  John: Hey.
  EOD
```

Execution returns correctly through each level.

---

## vs. `->` jump

| | Jump `->` | Tunnel `TUNNEL:` |
|---|---|---|
| Execution after | Never returns | Returns to next line |
| Use for | Section transitions, endings | Reusable sub-scenes, shared barks |
| `EOD` in target | Ends dialogue | Returns to caller |

::: tip When to use tunnels
Tunnels are ideal for reusable sections — greetings, short barks, shared cutscenes — that can be called from multiple places without duplicating content. Any section that ends with `EOD` can be used as a tunnel target.
:::

---

## Tunnel to a find query

The tunnel target can be a `find()` expression rather than a fixed node name. The runtime selects a matching node and returns after it ends:

```flow
<<MAIN_SCENE>>:
  Rita: Let me find someone for you to talk to.
  -> find(@tag CONTAINS "ambient_npc") <-
  Rita: Anyway. Where were we?
  EOD
```

This is the recommended pattern for barks: a pool of tagged scenes, selected by the runtime using the current strategy, playing as a subroutine. See [Storylets](/guide/storylets) for how to set up tagged scenes and configure selection strategies.
