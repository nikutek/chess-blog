import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { GameForm } from "./game-form";

type Tournament = {
  id: number;
  name: string;
};

async function getTournaments(): Promise<Tournament[]> {
  const response = await fetch(`${process.env.API_URL}/api/tournaments`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load tournaments.");
  }

  return response.json();
}

export default async function NewGamePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data) {
    redirect("/login");
  }

  const tournaments = await getTournaments();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">Import game</h1>
      <GameForm tournaments={tournaments} />
    </div>
  );
}
