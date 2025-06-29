
export interface ChessMove {
  move: string;
  explanation: string;
  fen: string;
}

export interface GameData {
  title: string;
  description: string;
  moves: ChessMove[];
}
