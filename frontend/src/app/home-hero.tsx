"use client";

import { useEffect, useRef, useState } from "react";

import { ChessScene3D } from "./chess-scene-3d";
import type { RecentAnalysis } from "./recent-analyses";

const MOVE_START_DELAY_MS = 350;
const MOVE_STEP_DELAY_MS = 750;

export function HomeHero({ analyses }: { analyses: RecentAnalysis[] }) {
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ChessScene3D | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const container = boardContainerRef.current;
    if (!container) return;
    const scene = new ChessScene3D(container);
    scene.mount();
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  function clearScheduledMoves() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  function handleEnter(index: number) {
    clearScheduledMoves();
    setActiveIndex(index);
    const scene = sceneRef.current;
    if (!scene) return;
    scene.setRotationPaused(true);
    scene.resetBoard();
    analyses[index].moves.forEach((move, i) => {
      timeoutsRef.current.push(
        setTimeout(() => scene.animateMove(move), MOVE_START_DELAY_MS + i * MOVE_STEP_DELAY_MS),
      );
    });
  }

  function handleLeave() {
    clearScheduledMoves();
    setActiveIndex(null);
    sceneRef.current?.setRotationPaused(false);
    sceneRef.current?.resetBoard();
  }

  useEffect(() => clearScheduledMoves, []);

  const caption =
    activeIndex === null
      ? "Najedź na analizę, aby zobaczyć pierwsze ruchy"
      : `${analyses[activeIndex].title} — ${analyses[activeIndex].desc}`;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-10 px-16">
      <div className="flex min-h-0 max-h-full flex-col justify-center py-4">
        <div className="mb-2 flex-none text-[11px] font-bold tracking-[2px] text-primary uppercase">
          Analiza partii · 1800+
        </div>
        <h1 className="mb-2 flex-none text-[clamp(22px,4.5vh,38px)] leading-[1.08] font-extrabold tracking-[-1px]">
          Zobacz partię,
          <br />
          zanim ją zagrasz
        </h1>
        <p className="mb-4 max-w-[420px] flex-none text-[clamp(11.5px,1.1vh_+_6px,13.5px)] leading-relaxed text-muted-foreground">
          Rozbieram debiuty i partie krok po kroku — na poziomie gracza klubowego, nie arcymistrza. Najedź na analizę
          obok, a szachownica odegra jej pierwsze ruchy.
        </p>

        <div className="mb-2 flex-none text-[10.5px] font-bold tracking-[1.5px] text-muted-foreground/80 uppercase">
          Ostatnie analizy
        </div>
        <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
          {analyses.map((analysis, i) => {
            const active = activeIndex === i;
            return (
              <div
                key={analysis.id}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={handleLeave}
                className="flex flex-none cursor-pointer items-center justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 transition-all duration-250 ease-in-out"
                style={{
                  borderColor: active ? "#d6483a" : "rgba(255,255,255,.08)",
                  background: active ? "rgba(214,72,58,.12)" : "rgba(255,255,255,.03)",
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 truncate text-[10.5px] font-bold tracking-[1px] text-primary uppercase">
                    {analysis.tag}
                  </div>
                  <div className="truncate text-[clamp(12.5px,1.2vh_+_6px,15px)] font-bold">{analysis.title}</div>
                </div>
                <div className="font-mono text-xs whitespace-nowrap text-muted-foreground">{analysis.desc}</div>
              </div>
            );
          })}
          {analyses.length === 0 && (
            <p className="text-sm text-muted-foreground">Brak opublikowanych partii do pokazania.</p>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col justify-center self-stretch">
        <div ref={boardContainerRef} className="relative h-[82%] w-full" />
        <p className="mt-1 flex-none text-center text-xs text-muted-foreground">{caption}</p>
      </div>
    </div>
  );
}
