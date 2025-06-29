
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MoveNavigationProps {
  currentMove: number;
  totalMoves: number;
  onMoveChange: (moveIndex: number) => void;
}

export function MoveNavigation({ currentMove, totalMoves, onMoveChange }: MoveNavigationProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        variant="outline"
        onClick={() => onMoveChange(currentMove - 1)}
        disabled={currentMove === 0}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous Move
      </Button>
      
      <span className="text-sm font-medium">
        {currentMove} / {totalMoves - 1}
      </span>
      
      <Button
        variant="outline"
        onClick={() => onMoveChange(currentMove + 1)}
        disabled={currentMove === totalMoves - 1}
        className="flex items-center gap-2"
      >
        Next Move
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
