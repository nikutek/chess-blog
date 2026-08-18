"use server";

import { redirect } from "next/navigation";

import { getAccessToken } from "@/lib/supabase/server";
import { createTournament as createTournamentRecord } from "@/lib/tournaments";

export type TournamentState = { error: string } | undefined;

export async function createTournament(
  _prevState: TournamentState,
  formData: FormData,
): Promise<TournamentState> {
  const name = formData.get("name");
  const location = formData.get("location");
  const date = formData.get("date");

  if (
    typeof name !== "string" ||
    typeof location !== "string" ||
    typeof date !== "string" ||
    !name ||
    !location ||
    !date
  ) {
    return { error: "Name, location, and date are required." };
  }

  // Redirect rather than fail here: the create page already guards on
  // session presence, so a missing token means the session expired between
  // page load and submit.
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/login");
    return;
  }

  try {
    await createTournamentRecord(name, location, date);
  } catch {
    return { error: "Could not create the tournament." };
  }

  redirect("/tournaments");
}
