import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { listTournaments } from "@/lib/tournaments";

import { GameForm } from "./game-form";

export default async function NewGamePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data) {
    redirect("/login");
  }

  const tournaments = await listTournaments();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">Import game</h1>
      <GameForm tournaments={tournaments} />
    </div>
  );
}
