# Line IDs

Every dialogue line and choice option gets a permanent ID. Translations and voice-over files are keyed by it. The ID stays with its line when you add lines around it, move it or reword it, so a French string or a recorded take never ends up on the wrong line.

You never write or see these IDs. The Flow editors (VS Code and Flowriter) assign and track them for you.

## Where they live

The IDs are stored next to each file, in a companion file with `.ids` added to the name:

```
intro.flow
intro.flow.ids
```

```
# Line IDs for intro.flow, in file order. Kept up to date by the Flow editors.
# Commit it with the .flow file. Don't edit it by hand.
a2hn87w6	Speaker: Hello, world.
ff988sm5	OtherSpeaker: How are you?
mv8w55gg	Fine:
bg5zzidi	Speaker: Good to hear.
```

Commit the `.ids` file with its `.flow` file. Each entry keeps the line's text so the ID can find its line again after edits.

Lines that get an ID:

- dialogue lines, including narration (`> ...`)
- player choice options (the children of `?:`)

Commands, jumps, conditions and other control lines don't get one.

## How IDs follow your edits

**While you write**, the editor sees every change as you make it:

- Typing over a line keeps its ID, even if none of the old text is left.
- Cut and paste keeps the ID.
- Copy and paste gives the copy a new ID.
- A new line gets a new ID.

**Changes made outside the editor**, such as a git merge, a find-and-replace across files or edits in another program, are matched up the next time the editor sees the file:

- A line with unchanged text keeps its ID, wherever it moved.
- A small fix, like a typo, keeps its ID.
- A larger rewording keeps its ID but is flagged for you to confirm. In VS Code it shows as an info hint on the line, with two quick fixes: **Same line, reworded** (keep the ID) and **New line** (give it a new ID).
- A line too different from anything that was removed gets a new ID.

Renaming a file keeps its IDs, both inside the editor and while the editor is closed.

In VS Code, hover over a line to see its ID.

## Using IDs at runtime

Pass the companion file's content to the parser along with the `.flow` file:

```csharp
var parser = new DroidParser(fileLoader);
parser.Parse(new DroidParserTextData(id, flowText, idsText));
```

Each `DialogueLine` then has a `lineId`, and each `BranchingOption` has a `lineId` for its option text. Without the companion file they're `null`.

If the `.flow` file was edited without the `.ids` file being updated (for example, by a tool other than the Flow editors), the parser matches what it can, the same way the editors do. Lines it can't match get a `null` ID.
