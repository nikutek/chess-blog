
import type {ChessMove} from "@/types/chess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MoveExplanationProps {
  move: ChessMove;
}

export function MoveExplanation({ move }: MoveExplanationProps) {
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{move.move}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base text-muted-foreground">{move.explanation}</p>
      </CardContent>
    </Card>
  );
}
