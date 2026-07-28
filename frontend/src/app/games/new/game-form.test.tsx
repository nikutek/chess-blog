import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions", () => ({
  createGame: vi.fn(async () => ({ error: "Could not import the game. Check the PGN and try again." })),
}));

const { GameForm } = await import("./game-form");

const tournaments = [
  { id: 1, name: "City Open" },
  { id: 2, name: "Summer Cup" },
];

describe("GameForm", () => {
  it("renders tournament, pgn, color, opponent, date, and a submit button", () => {
    render(<GameForm tournaments={tournaments} />);

    expect(screen.getByLabelText(/tournament/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pgn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/opponent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /import/i })).toBeInTheDocument();
  });

  it("shows the error message returned by the action", async () => {
    const user = userEvent.setup();
    render(<GameForm tournaments={tournaments} />);

    await user.type(screen.getByLabelText(/pgn/i), "1. e4 e5");
    await user.type(screen.getByLabelText(/opponent/i), "Kasparov");
    await user.type(screen.getByLabelText(/date/i), "2026-08-02");
    await user.click(screen.getByRole("button", { name: /import/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Could not import the game. Check the PGN and try again."),
      ).toBeInTheDocument();
    });
  });
});
