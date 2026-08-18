import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listGamesByTournament } from "@/lib/games";

export default async function TournamentGamesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Draft games are filtered by Postgres RLS based on the caller's session,
  // not here: an anonymous reader's query only ever returns Published rows.
  const games = await listGamesByTournament(Number(id));

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-4 pt-16">
      <h1 className="text-2xl font-semibold tracking-tight">Games</h1>
      {games.length === 0 ? (
        <p className="text-muted-foreground">No games yet.</p>
      ) : (
        <Table className="max-w-2xl">
          <TableHeader>
            <TableRow>
              <TableHead>Opponent</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  <Link href={`/games/${game.id}`} className="underline">
                    {game.opponent}
                  </Link>
                </TableCell>
                <TableCell>{game.color}</TableCell>
                <TableCell>{game.date}</TableCell>
                <TableCell>{game.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
