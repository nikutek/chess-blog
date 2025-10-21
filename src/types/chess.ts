export interface ChessMove {
  move: string;
  explanation: string;
  fen: string;
}

export interface GameData {
  gameID: string;
  title: string;
  moves: ChessMove[];
  description: string;
  side: "WHITE" | "BLACK";
  result: "WHITE_WIN" | "BLACK_WIN" | "DRAW";
  tournamentName: string;
  tournamentDate: string;
  createdAt: string;
  updatedAt: string;
}
