
import { Header } from "@/components/Header";
import { sampleGames } from "@/data/sampleGames";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AnalysisList = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Chess Analysis Library</h1>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleGames.map((game, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {game.moves.length} moves with detailed explanations
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to={`/analysis/${index}`}>
                    Analyze Game
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AnalysisList;
