
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Link } from "react-router-dom";
import { sampleGames } from "@/data/sampleGames";
import { ChessIcon } from "@/components/icons/ChessIcon";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-10">
        <section className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <ChessIcon className="h-16 w-16" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Chess Scribe Navigator</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore chess games with detailed move explanations and visual board representation.
          </p>
        </section>
        
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Chess Scribe Navigator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
