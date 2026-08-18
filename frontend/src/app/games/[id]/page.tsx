import { listAnnotationsByGame } from "@/lib/annotations";
import { getGame } from "@/lib/games";
import { getAccessToken } from "@/lib/supabase/server";

import { GameViewer } from "./game-viewer";
import { PublishToggle } from "./publish-toggle";

type Sideline = {
  id: number;
  branchFen: string;
  pgn: string;
  description: string | null;
  parentSidelineId: number | null;
};

async function getSidelines(id: string): Promise<Sideline[]> {
  const response = await fetch(`${process.env.API_URL}/api/games/${id}/sidelines`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load the sidelines.");
  }

  return response.json();
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accessToken = await getAccessToken();
  const [game, annotationRows, sidelines] = await Promise.all([
    getGame(Number(id)),
    listAnnotationsByGame(Number(id)),
    getSidelines(id),
  ]);
  // GameViewer's Annotation type still covers Sideline annotations, ported in
  // the follow-up Sidelines slice; main-line ones from Supabase are tagged
  // accordingly here since lib/annotations.ts only returns those for now.
  const annotations = annotationRows.map((annotation) => ({
    ...annotation,
    contextType: "MAIN_LINE" as const,
    sidelineId: null,
  }));

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-4 pt-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        vs {game.opponent}
      </h1>
      {accessToken && <PublishToggle gameId={game.id} status={game.status} />}
      <GameViewer
        pgn={game.pgn}
        gameId={game.id}
        isAuthor={!!accessToken}
        annotations={annotations}
        sidelines={sidelines}
      />
    </div>
  );
}
