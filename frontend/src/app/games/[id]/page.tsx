import { getAccessToken } from "@/lib/supabase/server";

import { GameViewer } from "./game-viewer";
import { PublishToggle } from "./publish-toggle";

type Game = {
  id: number;
  pgn: string;
  opponent: string;
  status: "DRAFT" | "PUBLISHED";
};

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

async function getAnnotations(id: string): Promise<Annotation[]> {
  const response = await fetch(`${process.env.API_URL}/api/games/${id}/annotations`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load the annotations.");
  }

  return response.json();
}

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
  const [game, annotations, sidelines] = await Promise.all([
    getGame(id, accessToken),
    getAnnotations(id),
    getSidelines(id),
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
