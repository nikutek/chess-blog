# Annotation identifier: FEN for main line, (sideline_id, FEN) for sidelines

Annotations are linked to their target by a composite key depending on what is being annotated:

- **Main line Move**: keyed by FEN alone. Main line moves are permanent (played in a real tournament game) and FEN is unique within a linear game, so FEN is a stable, sufficient identifier.
- **Sideline Move**: keyed by `(sideline_id, FEN)`. The same position (FEN) can be reached by different Sidelines, and each occurrence should carry an independent Annotation — so the Sideline's own ID is required to disambiguate.
- **Sideline as a whole**: keyed by `sideline_id`. The Sideline's general description is attached to the Sideline entity itself, not to any specific Move within it.

Move numbers were rejected as identifiers because they are ambiguous when nested Sidelines exist — the same number can appear in multiple branches. FEN alone was rejected because two Sidelines can reach the same position via transposition, and the author must be able to write different Annotations for each path (e.g. "transposition to the main line" is meaningful only in the context of the Sideline that leads there).
