import { createClient } from "@/lib/supabase/server";

export type Sideline = {
  id: number;
  gameId: number;
  parentSidelineId: number | null;
  branchFen: string;
  pgn: string;
  description: string | null;
};

const SIDELINE_COLUMNS =
  "id, gameId:game_id, parentSidelineId:parent_sideline_id, branchFen:branch_fen, pgn, description";

export async function createSideline(
  gameId: number,
  parentSidelineId: number | null,
  branchFen: string,
  pgn: string,
  description: string,
): Promise<Sideline> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sideline")
    .insert({
      game_id: gameId,
      parent_sideline_id: parentSidelineId,
      branch_fen: branchFen,
      pgn,
      description,
    })
    .select(SIDELINE_COLUMNS)
    .single();

  if (error) {
    throw new Error("Could not save the sideline.");
  }

  return data;
}

export async function listSidelinesByGame(gameId: number): Promise<Sideline[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sideline")
    .select(SIDELINE_COLUMNS)
    .eq("game_id", gameId);

  if (error) {
    throw new Error("Could not load the sidelines.");
  }

  return data;
}

export async function updateSideline(
  id: number,
  pgn: string,
  description: string,
): Promise<Sideline> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sideline")
    .update({ pgn, description })
    .eq("id", id)
    .select(SIDELINE_COLUMNS)
    .single();

  if (error) {
    throw new Error("Could not save the sideline.");
  }

  return data;
}

export async function deleteSideline(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("sideline").delete().eq("id", id);

  if (error) {
    throw new Error("Could not delete the sideline.");
  }
}
