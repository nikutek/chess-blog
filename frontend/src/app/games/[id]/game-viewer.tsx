"use client";

import { useState } from "react";
import { Chessboard } from "react-chessboard";

import { Button } from "@/components/ui/button";
import { parsePgn } from "@/lib/chess/parse-pgn";
import { cn } from "@/lib/utils";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function GameViewer({ pgn }: { pgn: string }) {
  const moves = parsePgn(pgn);
  const [moveIndex, setMoveIndex] = useState(-1);

  const position = moveIndex === -1 ? START_FEN : moves[moveIndex].fen;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
      <div className="flex flex-1 flex-col gap-3">
        <Chessboard
          options={{
            id: "game-viewer",
            position,
            allowDragging: false,
            showAnimations: false,
          }}
        />
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={moveIndex === -1}
            onClick={() => setMoveIndex((index) => Math.max(index - 1, -1))}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={moveIndex === moves.length - 1}
            onClick={() =>
              setMoveIndex((index) => Math.min(index + 1, moves.length - 1))
            }
          >
            Next
          </Button>
        </div>
      </div>
      <ol className="flex-1 space-y-1 overflow-y-auto rounded-md border p-3 sm:max-h-96">
        {moves.map((move, index) => (
          <li key={index}>
            {index % 2 === 0 && (
              <span className="text-muted-foreground">{index / 2 + 1}. </span>
            )}
            <span
              role="button"
              tabIndex={0}
              aria-current={index === moveIndex}
              onClick={() => setMoveIndex(index)}
              className={cn(
                "cursor-pointer rounded px-2 py-1 hover:bg-accent",
                index === moveIndex && "bg-accent font-semibold",
              )}
            >
              {move.san}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
