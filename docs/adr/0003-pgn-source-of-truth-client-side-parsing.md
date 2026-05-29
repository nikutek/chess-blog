# PGN as source of truth, client-side move parsing

Game moves are stored as a raw PGN string in the database, not as normalized Move rows. The frontend (Next.js + chess.js) parses the PGN and handles all move navigation client-side. Annotations are stored separately, linked by FEN (see ADR-0001). This avoids pre-computing and storing FEN for every Move server-side, keeps the backend data model simple, and leverages chess.js's mature PGN parser which also handles sidelines natively. The raw PGN is always preserved so the game can be re-parsed or exported at any time.
