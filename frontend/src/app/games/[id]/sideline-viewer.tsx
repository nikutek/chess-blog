"use client";

import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";

import { Button } from "@/components/ui/button";
import { parseSideline } from "@/lib/chess/parse-pgn";

import { AnnotationEditor } from "./annotation-editor";

const PLAY_STEP_MS = 800;

type Sideline = { id: number; branchFen: string; pgn: string; description: string | null };
type Annotation = { id: number; fen: string; text: string };

export function SidelineViewer({
  sideline,
  gameId,
  isAuthor,
  annotations,
  onBack,
}: {
  sideline: Sideline;
  gameId: number;
  isAuthor: boolean;
  annotations: Annotation[];
  onBack: () => void;
}) {
  const moves = useMemo(() => parseSideline(sideline.branchFen, sideline.pgn), [sideline]);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const position = moveIndex === -1 ? sideline.branchFen : moves[moveIndex].fen;
  const annotationByFen = useMemo(
    () => new Map(annotations.map((annotation) => [annotation.fen, annotation])),
    [annotations],
  );
  const currentAnnotation = annotationByFen.get(position);

  useEffect(() => {
    if (!isPlaying || moveIndex >= moves.length - 1) {
      return;
    }
    const timer = setTimeout(() => setMoveIndex((index) => Math.min(index + 1, moves.length - 1)), PLAY_STEP_MS);
    return () => clearTimeout(timer);
  }, [isPlaying, moveIndex, moves.length]);

  return (
    <div className="flex flex-col gap-3">
      {sideline.description && <p>{sideline.description}</p>}
      <Chessboard
        options={{
          id: "sideline-viewer",
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
          onClick={() => {
            setIsPlaying(false);
            setMoveIndex((index) => Math.max(index - 1, -1));
          }}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={moveIndex === moves.length - 1}
          onClick={() => {
            setIsPlaying(false);
            setMoveIndex((index) => Math.min(index + 1, moves.length - 1));
          }}
        >
          Next
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={moveIndex === moves.length - 1}
          onClick={() => {
            setMoveIndex(-1);
            setIsPlaying(true);
          }}
        >
          Play
        </Button>
      </div>
      {isAuthor ? (
        <AnnotationEditor
          key={position}
          gameId={gameId}
          fen={position}
          annotation={currentAnnotation}
          sidelineId={sideline.id}
        />
      ) : (
        currentAnnotation && <p>{currentAnnotation.text}</p>
      )}
      <Button type="button" variant="outline" onClick={onBack}>
        Back to main game
      </Button>
    </div>
  );
}
