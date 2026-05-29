# FEN as Annotation position identifier

Annotations are linked to Moves by the FEN (Forsyth-Edwards Notation) string of the board position after the Move, not by move number. Move numbers are ambiguous when sidelines (PGN variations) exist — the same number can appear in multiple branches. FEN uniquely identifies any board position across the main line and all variations. Sidelines are not implemented yet, but this identifier makes the architecture ready for them without a data migration.
