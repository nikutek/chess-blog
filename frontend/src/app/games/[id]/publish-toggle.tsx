"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { publishGame, unpublishGame } from "../actions";

type Status = "DRAFT" | "PUBLISHED";

export function PublishToggle({
  gameId,
  status,
}: {
  gameId: number;
  status: Status;
}) {
  const [state, action, pending] = useActionState(
    status === "DRAFT" ? publishGame : unpublishGame,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col items-center gap-2">
      <input type="hidden" name="gameId" value={gameId} />
      <Button type="submit" variant="outline" disabled={pending}>
        {status === "DRAFT" ? "Publish" : "Unpublish"}
      </Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
