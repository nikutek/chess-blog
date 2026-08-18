import { listAnnotationsByGame } from "@/lib/annotations";
import { getGame } from "@/lib/games";
import { listSidelinesByGame } from "@/lib/sidelines";
import { getAccessToken } from "@/lib/supabase/server";

import { GameViewer } from "./game-viewer";
import { PublishToggle } from "./publish-toggle";

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accessToken = await getAccessToken();
  const [game, annotations, sidelines] = await Promise.all([
    getGame(Number(id)),
    listAnnotationsByGame(Number(id)),
    listSidelinesByGame(Number(id)),
  ]);

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
