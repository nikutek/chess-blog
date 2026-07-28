"use server";

import { redirect } from "next/navigation";

import { getAccessToken } from "@/lib/supabase/server";

export type GameState = { error: string } | undefined;

export async function createGame(
  _prevState: GameState,
  formData: FormData,
): Promise<GameState> {
  const tournamentId = formData.get("tournamentId");
  const pgn = formData.get("pgn");
  const color = formData.get("color");
  const opponent = formData.get("opponent");
  const date = formData.get("date");

  if (
    typeof tournamentId !== "string" ||
    typeof pgn !== "string" ||
    typeof color !== "string" ||
    typeof opponent !== "string" ||
    typeof date !== "string" ||
    !tournamentId ||
    !pgn ||
    !color ||
    !opponent ||
    !date
  ) {
    return { error: "Tournament, PGN, color, opponent, and date are required." };
  }

  // Redirect rather than fail here: the import page already guards on
  // session presence, so a missing token means the session expired between
  // page load and submit.
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/login");
    return;
  }

  const response = await fetch(`${process.env.API_URL}/api/games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      tournamentId: Number(tournamentId),
      pgn,
      color,
      opponent,
      date,
    }),
  });

  if (!response.ok) {
    return { error: "Could not import the game. Check the PGN and try again." };
  }

  redirect(`/tournaments/${tournamentId}/games`);
}
