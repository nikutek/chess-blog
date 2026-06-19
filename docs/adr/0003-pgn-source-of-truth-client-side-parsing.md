# PGN as source of truth for main line; Sidelines as separate entities

Game moves for the main line are stored as a raw PGN string in the database. The frontend (Next.js + chess.js) parses the PGN and handles all move navigation client-side. Annotations are stored separately, linked by FEN (see ADR-0001). The raw PGN is always preserved so the game can be re-parsed or exported at any time.

Sidelines are stored as separate database entities, each with their own `sideline_id` and their own PGN snippet representing the sideline's move sequence. This keeps the main game PGN clean and standard, while giving each Sideline a stable identity for annotation linking (see ADR-0001). Sidelines can nest — a Sideline that branches off another Sideline references its parent via `parent_sideline_id` and the FEN of the branching point.

A full PGN export (main line + all Sidelines as variations) is assembled on demand by the backend.

Storing Sideline moves inside the main PGN as variations (parentheses notation) was rejected because standard PGN has no mechanism for stable IDs — any embedded ID scheme would be a non-standard extension fragile to external PGN editors.
