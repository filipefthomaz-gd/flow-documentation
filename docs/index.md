---
layout: home

hero:
  name: Flow
  text: Dialogue scripting language
  tagline: A game-first, writer-friendly format for branching dialogue. Built for interruptions, simultaneous tracks, timed choices, and the kinds of conversations that actually feel alive.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Syntax Reference
      link: /reference/syntax

features:
  - icon: ✍️
    title: Plain text, plain readable
    details: "Speaker name followed by a colon and the line text is all it takes. Files are readable without tooling, editable in any text editor, and version-controlled like code. No XML, no JSON, no graph editor required."

  - icon: 🔀
    title: Choices and conditions
    details: "<code>OPTIONS:</code> presents player choices. <code>IF</code> / <code>ELSE IF</code> / <code>ELSE</code> branches on runtime conditions. Options can be locked, timed, or conditional inline — without extra syntax."

  - icon: 🎲
    title: Automatic sequence nodes
    details: "<code>RANDOM</code>, <code>SHUFFLE</code>, <code>CYCLE</code>, and <code>ONCE</code> pick branches without player input. State is persisted automatically — ONCE plays once per session, SHUFFLE never repeats until the pool is exhausted."

  - icon: ↩️
    title: Tunnels
    details: "<code>-&gt; SECTION &lt;-</code> calls any root node as a subroutine and returns automatically when it ends. Reuse greetings, barks, and cutscenes from multiple places without duplicating content."

  - icon: ⚡
    title: Parallel dialogue tracks
    details: "<code>PARALLEL</code> starts an independent track alongside the main dialogue. <code>AWAIT</code> holds the master until a condition or EOD resolves — for background music, ambient NPC lines, and event-driven sequences."

  - icon: 🔍
    title: Storylet queries
    details: "<code>find(@tag CONTAINS \"combat\" | weighted)</code> selects a node at runtime by metadata query. Pluggable strategies — priority, recency, specificity, weighted random — make content-driven selection as simple as writing a tag."
---
