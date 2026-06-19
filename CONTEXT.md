# Chess Diary

A public chess blog where the author documents tournament games with move-by-move annotations explaining their thought process. Only the author can add or edit content; all readers see the published games.

## Language

**Tournament**:
A chess tournament event that is the mandatory parent of all games. Every game must belong to exactly one tournament.
_Avoid_: Competition, Event, Championship

**Game**:
A single chess game played within a tournament, imported via PGN. Has a Status of Draft or Published.
_Avoid_: Match, Partie, Contest

**Move**:
A single half-move (ply) made by one player — White or Black. A full move number in chess notation contains two Moves.
_Avoid_: Half-move, Ply, Turn, Full move

**Annotation**:
The author's written explanation attached to a Move or a Sideline. In the main game, any Move — own or opponent's — may carry an Annotation. In a Sideline, every Move is also eligible. Annotations on individual Moves are always optional.
_Avoid_: Comment, Description, Note

**Color**:
Whether the author played as White or Black in a given Game.
_Avoid_: Side, Piece color

**Sideline**:
A sequence of Moves branching off from a specific Move in a Game or another Sideline, created by the author to explore alternative continuations. A Sideline has its own optional description and may carry per-Move Annotations. Sidelines can nest recursively.
_Avoid_: Variation, Branch, Line

**Status**:
A Game's publication state: Draft (visible only to the author, work in progress) or Published (visible to all readers).
_Avoid_: State, Visibility, Mode
