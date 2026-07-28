"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createGame } from "../actions";

type Tournament = {
  id: number;
  name: string;
};

export function GameForm({ tournaments }: { tournaments: Tournament[] }) {
  const [state, action, pending] = useActionState(createGame, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tournamentId">Tournament</Label>
        <Select
          name="tournamentId"
          defaultValue={tournaments[0] ? String(tournaments[0].id) : undefined}
        >
          <SelectTrigger id="tournamentId" className="w-full">
            <SelectValue placeholder="Select a tournament" />
          </SelectTrigger>
          <SelectContent>
            {tournaments.map((tournament) => (
              <SelectItem key={tournament.id} value={String(tournament.id)}>
                {tournament.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pgn">PGN</Label>
        <Textarea id="pgn" name="pgn" required placeholder="1. e4 e5 2. Nf3 Nc6" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="color">Color</Label>
        <Select name="color" defaultValue="WHITE">
          <SelectTrigger id="color" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WHITE">White</SelectItem>
            <SelectItem value="BLACK">Black</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="opponent">Opponent</Label>
        <Input id="opponent" name="opponent" type="text" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        Import game
      </Button>
    </form>
  );
}
