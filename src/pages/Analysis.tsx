
import { Header } from "@/components/Header";
import { ChessAnalysis } from "@/components/ChessAnalysis";
import { sampleGames } from "@/data/sampleGames";
import { useParams, Navigate } from "react-router-dom";

const Analysis = () => {
  const { id } = useParams<{ id: string }>();
  const gameIndex = id ? parseInt(id) : 0;
  
  // Check if the game exists
  if (isNaN(gameIndex) || gameIndex < 0 || gameIndex >= sampleGames.length) {
    return <Navigate to="/analysis/0" replace />;
  }
  
  const selectedGame = sampleGames[gameIndex];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <ChessAnalysis game={selectedGame} />
      </main>
    </div>
  );
};

export default Analysis;
