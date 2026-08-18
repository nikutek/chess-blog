import { listRecentPublishedGames } from "@/lib/games";

import { HomeHero } from "./home-hero";
import { toRecentAnalyses } from "./recent-analyses";

export default async function Home() {
  const games = await listRecentPublishedGames(4);
  const analyses = toRecentAnalyses(games);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex flex-none items-center justify-between border-b border-white/8 px-16 py-6">
        <div className="text-lg font-bold tracking-[-0.3px]">My Chess Journey</div>
        <nav className="flex gap-8 text-sm text-muted-foreground">
          <span>Analizy</span>
          <span>Debiuty</span>
          <span>Końcówki</span>
          <span>O mnie</span>
        </nav>
      </header>

      <HomeHero analyses={analyses} />

      <footer className="flex flex-none justify-between border-t border-white/8 px-16 py-4.5 text-xs text-muted-foreground">
        <span>© 2026 My Chess Journey</span>
        <span>Analizy · Debiuty · Końcówki</span>
      </footer>
    </div>
  );
}
