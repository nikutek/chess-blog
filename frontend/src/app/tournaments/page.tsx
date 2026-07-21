import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Tournament = {
  id: number;
  name: string;
  location: string;
  date: string;
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

export default async function TournamentsPage() {
  const tournaments = await getTournaments();

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
