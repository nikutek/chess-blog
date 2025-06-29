
import { cn } from "@/lib/utils";

interface ChessIconProps {
  className?: string;
}

export function ChessIcon({ className }: ChessIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-chess", className)}
    >
      <path d="M2 15h20v7H2z" />
      <path d="M2 2h20v3H2z" />
      <path d="M2 5v10" />
      <path d="M22 5v10" />
      <path d="M12 5v10" />
      <path d="M7 5v10" />
      <path d="M17 5v10" />
      <path d="M7 8h.01" />
      <path d="M17 8h.01" />
      <path d="M7 12h.01" />
      <path d="M17 12h.01" />
    </svg>
  );
}
