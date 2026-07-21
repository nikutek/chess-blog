import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { TournamentForm } from "./tournament-form";

export default async function NewTournamentPage() {
  const supabase = await createClient();
  // getClaims() verifies the JWT locally against Supabase's JWKS (see
  // proxy.ts) rather than trusting whatever is in the session cookie.
  const { data } = await supabase.auth.getClaims();

  if (!data) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-semibold tracking-tight">New tournament</h1>
      <TournamentForm />
    </div>
  );
}
