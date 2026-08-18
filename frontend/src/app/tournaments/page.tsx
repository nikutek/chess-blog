import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listTournaments } from "@/lib/tournaments";

export default async function TournamentsPage() {
  const tournaments = await listTournaments();

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-4 pt-16">
      <h1 className="text-2xl font-semibold tracking-tight">Tournaments</h1>
      {tournaments.length === 0 ? (
        <p className="text-muted-foreground">No tournaments yet.</p>
      ) : (
        <Table className="max-w-2xl">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell>{tournament.name}</TableCell>
                <TableCell>{tournament.location}</TableCell>
                <TableCell>{tournament.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
