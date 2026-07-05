import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Chess Diary</h1>
      <p className="text-muted-foreground">Project scaffolding placeholder.</p>
      <Button>Hello, shadcn/ui</Button>
    </div>
  );
}
