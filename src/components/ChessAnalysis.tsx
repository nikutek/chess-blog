
import { useState } from "react";
import { ChessBoard } from "@/components/ChessBoard";
import { MoveExplanation } from "@/components/MoveExplanation";
import { MoveNavigation } from "@/components/MoveNavigation";
import { GameData } from "@/types/chess";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChessAnalysisProps {
  game: GameData;
}

export function ChessAnalysis({ game }: ChessAnalysisProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const isMobile = useIsMobile();
  
  const handleMoveChange = (moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);
  };

  return (
    <div className={`w-full ${isMobile ? 'flex flex-col gap-6' : 'grid grid-cols-2 gap-8'}`}>
      <div className="flex justify-center">
        <ChessBoard fen={game.moves[currentMoveIndex].fen} />
      </div>
      
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{game.title}</CardTitle>
            <CardDescription>{game.description}</CardDescription>
          </CardHeader>
        </Card>
        
        <MoveExplanation move={game.moves[currentMoveIndex]} />
        
        <MoveNavigation 
          currentMove={currentMoveIndex} 
          totalMoves={game.moves.length} 
          onMoveChange={handleMoveChange} 
        />
      </div>
    </div>
  );
}
