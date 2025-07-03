"use client";
import type { GameData } from "@/types/chess";
import { useState } from "react";
import { ChessBoard } from "~/components/ChessBoard";
import { MoveExplanation } from "~/components/MoveExplanation";
import { MoveNavigation } from "~/components/MoveNavigation";
import { sicilianDefenseGame } from "~/data/sampleGames";
import GamePage from "./GamePage";


const App = () => {
  
  return (

    <GamePage {...sicilianDefenseGame}/>
  )
}


export default App;
