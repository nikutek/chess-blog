"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAnnotation,
  deleteAnnotation as deleteAnnotationRecord,
  updateAnnotationText,
} from "@/lib/annotations";
import {
  createGame as createGameRecord,
  publishGame as publishGameRecord,
  unpublishGame as unpublishGameRecord,
  type Color,
} from "@/lib/games";
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

  let game;
  try {
    game = await createGameRecord(Number(tournamentId), pgn, color as Color, opponent, date);
  } catch {
    return { error: "Could not import the game. Check the PGN and try again." };
  }

  redirect(`/tournaments/${game.tournamentId}/games`);
}

async function setPublicationStatus(
  action: "publish" | "unpublish",
  formData: FormData,
): Promise<GameState> {
  const gameId = formData.get("gameId");
  if (typeof gameId !== "string" || !gameId) {
    return { error: `Could not ${action} the game.` };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/login");
  }

  try {
    if (action === "publish") {
      await publishGameRecord(Number(gameId));
    } else {
      await unpublishGameRecord(Number(gameId));
    }
  } catch {
    return { error: `Could not ${action} the game.` };
  }

  revalidatePath(`/games/${gameId}`);
}

export async function publishGame(
  _prevState: GameState,
  formData: FormData,
): Promise<GameState> {
  return setPublicationStatus("publish", formData);
}

export async function unpublishGame(
  _prevState: GameState,
  formData: FormData,
): Promise<GameState> {
  return setPublicationStatus("unpublish", formData);
}

export async function saveAnnotation(
  _prevState: GameState,
  formData: FormData,
): Promise<GameState> {
  const gameId = formData.get("gameId");
  const fen = formData.get("fen");
  const annotationId = formData.get("annotationId");
  const text = formData.get("text");

  if (
    typeof gameId !== "string" ||
    typeof fen !== "string" ||
    typeof text !== "string" ||
    !gameId ||
    !fen ||
    !text
  ) {
    return { error: "Annotation text is required." };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/login");
    return;
  }

  const isUpdate = typeof annotationId === "string" && annotationId !== "";

  try {
    if (isUpdate) {
      await updateAnnotationText(Number(annotationId), text);
    } else {
      await createAnnotation(Number(gameId), fen, text);
    }
  } catch {
    return { error: "Could not save the annotation." };
  }

  revalidatePath(`/games/${gameId}`);
}

export async function saveSideline(
  _prevState: GameState,
  formData: FormData,
): Promise<GameState> {
  const gameId = formData.get("gameId");
  const branchFen = formData.get("branchFen");
  const sidelineId = formData.get("sidelineId");
  const parentSidelineId = formData.get("parentSidelineId");
  const pgn = formData.get("pgn");
  const description = formData.get("description");

  if (
    typeof gameId !== "string" ||
    typeof branchFen !== "string" ||
    typeof pgn !== "string" ||
    typeof description !== "string" ||
    !gameId ||
    !branchFen ||
    !pgn
  ) {
    return { error: "Sideline PGN is required." };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/login");
    return;
  }

  const isUpdate = typeof sidelineId === "string" && sidelineId !== "";
  const url = isUpdate
    ? `${process.env.API_URL}/api/games/${gameId}/sidelines/${sidelineId}`
    : `${process.env.API_URL}/api/games/${gameId}/sidelines`;
  const hasParentSidelineId = typeof parentSidelineId === "string" && parentSidelineId !== "";

  const response = await fetch(url, {
    method: isUpdate ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(
      isUpdate
        ? { pgn, description }
        : { branchFen, pgn, description, ...(hasParentSidelineId ? { parentSidelineId: Number(parentSidelineId) } : {}) },
    ),
  });

  if (!response.ok) {
    return { error: "Could not save the sideline." };
  }

  revalidatePath(`/games/${gameId}`);
}

export async function deleteSideline(
  _prevState: GameState,
  formData: FormData,
): Promise<GameState> {
  const gameId = formData.get("gameId");
  const sidelineId = formData.get("sidelineId");

  if (typeof gameId !== "string" || typeof sidelineId !== "string" || !gameId || !sidelineId) {
    return { error: "Could not delete the sideline." };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/login");
    return;
  }

  const response = await fetch(`${process.env.API_URL}/api/games/${gameId}/sidelines/${sidelineId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return { error: "Could not delete the sideline." };
  }

  revalidatePath(`/games/${gameId}`);
}

export async function deleteAnnotation(
  _prevState: GameState,
  formData: FormData,
): Promise<GameState> {
  const gameId = formData.get("gameId");
  const annotationId = formData.get("annotationId");

  if (typeof gameId !== "string" || typeof annotationId !== "string" || !gameId || !annotationId) {
    return { error: "Could not delete the annotation." };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/login");
    return;
  }

  try {
    await deleteAnnotationRecord(Number(annotationId));
  } catch {
    return { error: "Could not delete the annotation." };
  }

  revalidatePath(`/games/${gameId}`);
}
