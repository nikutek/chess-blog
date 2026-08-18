import { createClient } from "@/lib/supabase/server";

export type Annotation = {
  id: number;
  gameId: number;
  fen: string;
  text: string;
};

const ANNOTATION_COLUMNS = "id, gameId:game_id, fen, text";

export async function createAnnotation(
  gameId: number,
  fen: string,
  text: string,
): Promise<Annotation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annotation")
    .insert({ game_id: gameId, context_type: "main_line", fen, text })
    .select(ANNOTATION_COLUMNS)
    .single();

  if (error) {
    throw new Error("Could not save the annotation.");
  }

  return data;
}

export async function listAnnotationsByGame(gameId: number): Promise<Annotation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annotation")
    .select(ANNOTATION_COLUMNS)
    .eq("game_id", gameId);

  if (error) {
    throw new Error("Could not load the annotations.");
  }

  return data;
}

export async function updateAnnotationText(id: number, text: string): Promise<Annotation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annotation")
    .update({ text })
    .eq("id", id)
    .select(ANNOTATION_COLUMNS)
    .single();

  if (error) {
    throw new Error("Could not save the annotation.");
  }

  return data;
}

export async function deleteAnnotation(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("annotation").delete().eq("id", id);

  if (error) {
    throw new Error("Could not delete the annotation.");
  }
}
