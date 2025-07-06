"use client";
import type { GameData } from "@/types/chess";
import { useState } from "react";
import { ChessBoard } from "~/components/ChessBoard";
import { MoveExplanation } from "~/components/MoveExplanation";
import { MoveNavigation } from "~/components/MoveNavigation";
import { sampleGames, sicilianDefenseGame } from "~/data/sampleGames";
import GamePage from "./[gameId]/page";
import Link from "next/link";
const App = () => {
  const games = sampleGames;
  console.log(games);
  return (
    <>
      {sampleGames.map((game: GameData, index) => {
        return (
          <div key={index} className="flex flex-col gap-20">
            <Link href={`/${index}`}>
              <h2>{game.title}</h2>
            </Link>
          </div>
        );
      })}
    </>
  );
};

export default App;
