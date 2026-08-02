"use client";

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
  const action =
    status === "DRAFT" ? () => publishGame(gameId) : () => unpublishGame(gameId);

  return (
    <form action={action}>
      <Button type="submit" variant="outline">
        {status === "DRAFT" ? "Publish" : "Unpublish"}
      </Button>
    </form>
  );
}
