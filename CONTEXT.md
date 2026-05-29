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
The author's written explanation of their thought process attached to one of their own Moves. Only the author's Moves carry Annotations — opponent Moves are never annotated.
_Avoid_: Comment, Description, Note

**Color**:
Whether the author played as White or Black in a given Game. Determines which Moves are eligible for Annotation.
_Avoid_: Side, Piece color

**Status**:
A Game's publication state: Draft (visible only to the author, work in progress) or Published (visible to all readers).
_Avoid_: State, Visibility, Mode
