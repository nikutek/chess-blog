import type { ChessMove } from "@/types/chess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MoveExplanationProps {
  move: ChessMove;
  className?: string;
}

export function MoveExplanation({ move, className }: MoveExplanationProps) {
  return (
    <Card
      className={"animate-fade-in w-full" + (className ? ` ${className}` : "")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{move.move}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground wrap-break-words text-base">
          {move.explanation}
        </p>
      </CardContent>
    </Card>
  );
}
