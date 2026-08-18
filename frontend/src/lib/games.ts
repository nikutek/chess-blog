import { isValidPgn } from "@/lib/pgn";
import { createClient } from "@/lib/supabase/server";

export type Color = "white" | "black";
export type Status = "draft" | "published";

export type Game = {
  id: number;
  tournamentId: number;
  pgn: string;
  color: Color;
  status: Status;
  opponent: string;
  date: string;
};

export type RecentGame = {
  id: number;
  pgn: string;
  opponent: string;
  tournament: { name: string };
};

const GAME_COLUMNS = "id, tournamentId:tournament_id, pgn, color, status, opponent, date:game_date";

export async function createGame(
  tournamentId: number,
  pgn: string,
  color: Color,
  opponent: string,
  date: string,
): Promise<Game> {
  if (!isValidPgn(pgn)) {
    throw new Error("Could not import the game: the PGN is invalid.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game")
    .insert({ tournament_id: tournamentId, pgn, color, opponent, game_date: date })
    .select(GAME_COLUMNS)
    .single();

  if (error) {
    throw new Error("Could not import the game.");
  }

  return data;
}

export async function getGame(id: number): Promise<Game> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game")
    .select(GAME_COLUMNS)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Could not load the game.");
  }

  return data;
}

async function setStatus(id: number, status: Status): Promise<Game> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game")
    .update({ status })
    .eq("id", id)
    .select(GAME_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Could not ${status === "published" ? "publish" : "unpublish"} the game.`);
  }

  return data;
}

export async function publishGame(id: number): Promise<Game> {
  return setStatus(id, "published");
}

export async function unpublishGame(id: number): Promise<Game> {
  return setStatus(id, "draft");
}

export async function listGamesByTournament(tournamentId: number): Promise<Game[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game")
    .select(GAME_COLUMNS)
    .eq("tournament_id", tournamentId)
    .order("game_date", { ascending: false });

  if (error) {
    throw new Error("Could not load games.");
  }

  return data;
}

export async function listRecentPublishedGames(limit: number): Promise<RecentGame[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game")
    .select("id, pgn, opponent, tournament:tournament(name)")
    .eq("status", "published")
    .order("game_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Could not load recent games.");
  }

  // Without generated Database types, supabase-js's select-string parser can't
  // tell this embed is a to-one relation (game.tournament_id -> tournament.id)
  // and infers it as an array; it's a single row at runtime, per the FK.
  return data as unknown as RecentGame[];
}
