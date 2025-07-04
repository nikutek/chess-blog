import { ChessBoard } from "@/components/ChessBoard";
import { MoveExplanation } from "@/components/MoveExplanation";
import { MoveNavigation } from "@/components/MoveNavigation";
import type { GameData } from "@/types/chess";
import React, { useState } from "react";

const GamePage = (game: GameData) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const handleMoveChange = (moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);
  };

  const isGameValid = (game: GameData) => {
    if (!game || !game.moves || game.moves.length === 0) {
      return false;
    }
    if (!game.title || !game.description) {
      return false;
    }
    for (const move of game.moves) {
      if (!move.fen || !move.explanation) {
        return false;
      }
    }
    return true;
  };

  if (!isGameValid(game) || !game.moves[currentMoveIndex]) {
    return <div className="text-center text-red-500">Game data error.</div>;
  }

  return (
    <>
      <div className="flex h-screen flex-row">
        <div className="flex w-2/5 items-center justify-center">
          <ChessBoard
            fen={game.moves[currentMoveIndex].fen}
            className="content-around"
          />
        </div>

        <section className="flex flex-1 grow flex-col items-center">
          <h2 className="mb-2 p-6 text-center text-2xl font-semibold">
            {game.title}
          </h2>

          <MoveExplanation
            move={game.moves[currentMoveIndex]}
            className="max-w-4/5S h-auto w-full max-w-4/5"
          />
          <MoveNavigation
            currentMove={currentMoveIndex}
            totalMoves={game.moves.length}
            onMoveChange={handleMoveChange}
            className="mt-auto mb-12 p-12"
          />
        </section>
      </div>
    </>
  );
};

export default GamePage;
