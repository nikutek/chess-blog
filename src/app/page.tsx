"use client";
import type { GameData } from "@/types/chess";
import { sampleGames, sicilianDefenseGame } from "~/data/sampleGames";
import GamePage from "./[gameId]/page";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

const HomePage = () => {
  // const data = sampleGames;
  // console.log(games);
  const { isPending, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: () =>
      fetch("http://localhost:8080/games").then((res) => res.json()),
  });
  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  console.log(data);

  return (
    <>
      {data.map((game: GameData) => {
        return (
          <div key={game.gameID} className="flex flex-col gap-20">
            <Link href={`/${game.gameID}`}>
              <h2>{game.title}</h2>
            </Link>
          </div>
        );
      })}
    </>
  );
};

export default HomePage;
