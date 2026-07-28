import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAccessToken } from "@/lib/supabase/server";

type Game = {
  id: number;
  pgn: string;
  color: "WHITE" | "BLACK";
  status: "DRAFT" | "PUBLISHED";
  opponent: string;
  date: string;
};

async function getGames(tournamentId: string): Promise<Game[]> {
  // No token means an anonymous reader: the backend already filters out
  // Draft games for unauthenticated requests (see GameController), so no
  // client-side filtering is needed here.
  const accessToken = await getAccessToken();

  const response = await fetch(`${process.env.API_URL}/api/tournaments/${tournamentId}/games`, {
    cache: "no-store",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (!response.ok) {
    throw new Error("Could not load games.");
  }

  return response.json();
}

export default async function TournamentGamesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const games = await getGames(id);

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
                <TableCell>{game.opponent}</TableCell>
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
