import { getAccessToken } from "@/lib/supabase/server";

import { GameViewer } from "./game-viewer";
import { PublishToggle } from "./publish-toggle";

type Game = {
  id: number;
  pgn: string;
  opponent: string;
  status: "DRAFT" | "PUBLISHED";
};

async function getGame(id: string, accessToken: string | undefined): Promise<Game> {
  const response = await fetch(`${process.env.API_URL}/api/games/${id}`, {
    cache: "no-store",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (!response.ok) {
    throw new Error("Could not load the game.");
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
  const game = await getGame(id, accessToken);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-4 pt-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        vs {game.opponent}
      </h1>
      {accessToken && <PublishToggle gameId={game.id} status={game.status} />}
      <GameViewer pgn={game.pgn} />
    </div>
  );
}
