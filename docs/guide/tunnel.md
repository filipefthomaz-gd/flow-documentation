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

Works the same as cross-file jumps, using dot notation after `#INCLUDE`:

```flow
#INCLUDE npcs/john.flow

<<START>>:
  Rita: Hang on.
  TUNNEL: john.GREETING
  Rita: Right. Let's go.
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
