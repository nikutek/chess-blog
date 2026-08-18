import { createClient } from "@/lib/supabase/server";

export type Tournament = {
  id: number;
  name: string;
  location: string;
  date: string;
};

export async function listTournaments(): Promise<Tournament[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournament")
    .select("id, name, location, date:tournament_date")
    .order("tournament_date", { ascending: false });

  if (error) {
    throw new Error("Could not load tournaments.");
  }

  return data;
}

export async function createTournament(
  name: string,
  location: string,
  date: string,
): Promise<Tournament> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournament")
    .insert({ name, location, tournament_date: date })
    .select("id, name, location, date:tournament_date")
    .single();

  if (error) {
    throw new Error("Could not create the tournament.");
  }

  return data;
}
