
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChessIcon } from "@/components/icons/ChessIcon";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-4">
          <ChessIcon className="h-6 w-6" />
          <Link to="/" className="font-semibold">
            Chess Scribe
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Button asChild variant="ghost" className="text-sm font-medium transition-colors hover:text-primary">
            <Link to="/">Home</Link>
          </Button>
          <Button asChild variant="ghost" className="text-sm font-medium transition-colors hover:text-primary">
            <Link to="/analysis">Analysis</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
