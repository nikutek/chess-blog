import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MoveNavigationProps {
  currentMove: number;
  totalMoves: number;
  onMoveChange: (moveIndex: number) => void;
  className?: string;
}

export function MoveNavigation({
  currentMove,
  totalMoves,
  onMoveChange,
  className,
}: MoveNavigationProps) {
  return (
    <div
      className={
        "mt-6 flex items-center justify-center gap-8" +
        (className ? ` ${className}` : "")
      }
    >
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
