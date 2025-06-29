"use client";
import { useState } from "react";
import { ChessBoard } from "~/components/ChessBoard";
import { MoveExplanation } from "~/components/MoveExplanation";
import { MoveNavigation } from "~/components/MoveNavigation";
import { sicilianDefenseGame } from "~/data/sampleGames";


const App = () => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const game = sicilianDefenseGame;
  
  const handleMoveChange = (moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Chess Analysis</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex justify-center">
            <ChessBoard fen={game.moves[currentMoveIndex].fen} />
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{game.title}</h2>
              <p className="text-gray-600">{game.description}</p>
            </div>
            
            <MoveExplanation move={game.moves[currentMoveIndex]} />
            
            <MoveNavigation 
              currentMove={currentMoveIndex} 
              totalMoves={game.moves.length} 
              onMoveChange={handleMoveChange} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
