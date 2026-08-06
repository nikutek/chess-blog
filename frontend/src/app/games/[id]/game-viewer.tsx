"use client";

import { useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";

import { Button } from "@/components/ui/button";
import { parsePgn } from "@/lib/chess/parse-pgn";
import { cn } from "@/lib/utils";

import { AnnotationEditor } from "./annotation-editor";
import { SidelineEditor } from "./sideline-editor";
import { SidelineViewer } from "./sideline-viewer";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type Annotation = {
  id: number;
  fen: string;
  text: string;
  contextType: "MAIN_LINE" | "SIDELINE";
  sidelineId: number | null;
};
type Sideline = {
  id: number;
  branchFen: string;
  pgn: string;
  description: string | null;
  parentSidelineId: number | null;
};

export function GameViewer({
  pgn,
  gameId,
  isAuthor,
  annotations,
  sidelines = [],
}: {
  pgn: string;
  gameId: number;
  isAuthor: boolean;
  annotations: Annotation[];
  sidelines?: Sideline[];
}) {
  const moves = useMemo(() => parsePgn(pgn), [pgn]);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [sidelineStack, setSidelineStack] = useState<number[]>([]);
  const activeSidelineId = sidelineStack.at(-1) ?? null;

  const position = moveIndex === -1 ? START_FEN : moves[moveIndex].fen;
  const mainLineAnnotations = useMemo(
    () => annotations.filter((annotation) => annotation.contextType === "MAIN_LINE"),
    [annotations],
  );
  const annotationByFen = useMemo(
    () => new Map(mainLineAnnotations.map((annotation) => [annotation.fen, annotation])),
    [mainLineAnnotations],
  );
  const currentAnnotation = annotationByFen.get(position);

  const topLevelSidelines = useMemo(() => sidelines.filter((sideline) => sideline.parentSidelineId === null), [sidelines]);
  const sidelinesByFen = useMemo(() => {
    const map = new Map<string, Sideline[]>();
    for (const sideline of topLevelSidelines) {
      map.set(sideline.branchFen, [...(map.get(sideline.branchFen) ?? []), sideline]);
    }
    return map;
  }, [topLevelSidelines]);
  const currentSidelines = sidelinesByFen.get(position) ?? [];
  const activeSideline = sidelines.find((sideline) => sideline.id === activeSidelineId);
  const activeSidelineAnnotations = useMemo(
    () =>
      annotations.filter(
        (annotation) => annotation.contextType === "SIDELINE" && annotation.sidelineId === activeSidelineId,
      ),
    [annotations, activeSidelineId],
  );
  const childSidelines = useMemo(
    () => sidelines.filter((sideline) => sideline.parentSidelineId === activeSidelineId),
    [sidelines, activeSidelineId],
  );

  if (activeSideline) {
    return (
      <div className="w-full max-w-2xl">
        <SidelineViewer
          sideline={activeSideline}
          gameId={gameId}
          isAuthor={isAuthor}
          annotations={activeSidelineAnnotations}
          childSidelines={childSidelines}
          onEnterSideline={(id) => setSidelineStack((stack) => [...stack, id])}
          onBack={() => setSidelineStack((stack) => stack.slice(0, -1))}
          backLabel={sidelineStack.length > 1 ? "Back to previous sideline" : "Back to main game"}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row">
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
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setMoveIndex(index);
                  }
                }}
                className={cn(
                  "cursor-pointer rounded px-2 py-1 hover:bg-accent",
                  index === moveIndex && "bg-accent font-semibold",
                )}
              >
                {move.san}
              </span>
              {(sidelinesByFen.get(move.fen) ?? []).map((sideline, sidelineIndex) => (
                <button
                  key={sideline.id}
                  type="button"
                  aria-label={`View sideline ${sidelineIndex + 1}`}
                  onClick={() => setSidelineStack([sideline.id])}
                  className="ml-1 rounded px-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  ⑂
                </button>
              ))}
            </li>
          ))}
        </ol>
      </div>
      {isAuthor ? (
        <AnnotationEditor key={position} gameId={gameId} fen={position} annotation={currentAnnotation} />
      ) : (
        currentAnnotation && <p>{currentAnnotation.text}</p>
      )}
      {isAuthor && moveIndex !== -1 && (
        <div className="flex flex-col gap-2">
          {currentSidelines.map((sideline) => (
            <SidelineEditor key={sideline.id} gameId={gameId} branchFen={position} sideline={sideline} />
          ))}
          <SidelineEditor key={`new-${position}`} gameId={gameId} branchFen={position} sideline={undefined} />
        </div>
      )}
    </div>
  );
}
