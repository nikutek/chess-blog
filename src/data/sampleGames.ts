import type { GameData } from "@/types/chess";

export const sicilianDefenseGame: GameData = {
  title: "Sicilian Defense: Najdorf Variation",
  description:
    "A classic Sicilian Defense game showcasing the strategic depth of the Najdorf Variation.",
  moves: [
    {
      move: "Start position",
      explanation: "Initial position.",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    },
    {
      move: "1. e4",
      explanation:
        "White opens with the King's Pawn opening, claiming central space and freeing the queen and king's bishop.",
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    },
    {
      move: "1...c5",
      explanation:
        "Black responds with the Sicilian Defense, fighting for the center asymmetrically and preparing for a dynamic counterattack.",
      fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    },
    {
      move: "2. Nf3",
      explanation:
        "White develops the knight to a natural square, controlling the center and preparing for kingside castling.",
      fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    },
    {
      move: "2...d6",
      explanation:
        "Black prepares for a fianchetto of the king's bishop and controls the e5 square, essential for future development.",
      fen: "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    },
  ],
};

export const ruyLopezGame: GameData = {
  title: "Ruy Lopez: Morphy Defense",
  description:
    "A fundamental opening in chess, the Ruy Lopez demonstrates classical development and control of the center.",
  moves: [
    {
      move: "Start position",
      explanation: "Initial position.",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    },
    {
      move: "1. e4",
      explanation: "White opens with the King's Pawn, controlling the center.",
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    },
    {
      move: "1...e5",
      explanation: "Black responds symmetrically, also claiming the center.",
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    },
    {
      move: "2. Nf3",
      explanation: "White develops the knight, attacking the e5 pawn.",
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    },
    {
      move: "2...Nc6",
      explanation: "Black defends the e5 pawn and develops a piece.",
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    },
    {
      move: "3. Bb5",
      explanation: "White plays the Ruy Lopez, attacking the knight on c6.",
      fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    },
  ],
};

export const frenchDefenseGame: GameData = {
  title: "French Defense: Advance Variation",
  description:
    "The French Defense is a solid response to 1.e4, and the Advance Variation leads to a locked center and strategic maneuvering.",
  moves: [
    {
      move: "Start position",
      explanation: "Initial position.",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    },
    {
      move: "1. e4",
      explanation: "White opens with the King's Pawn, controlling the center.",
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    },
    {
      move: "1...e6",
      explanation: "Black prepares to challenge the center with d5.",
      fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    },
    {
      move: "2. d4",
      explanation: "White grabs more central space.",
      fen: "rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2",
    },
    {
      move: "2...d5",
      explanation: "Black strikes at the center.",
      fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    },
    {
      move: "3. e5",
      explanation:
        "White advances the pawn, gaining space and closing the center.",
      fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
    },
  ],
};

export const sampleGames: GameData[] = [
  sicilianDefenseGame,
  ruyLopezGame,
  frenchDefenseGame,
];
