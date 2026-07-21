import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions", () => ({
  createTournament: vi.fn(async () => ({ error: "Could not create the tournament." })),
}));

const { TournamentForm } = await import("./tournament-form");

describe("TournamentForm", () => {
  it("renders name, location, date, and a submit button", () => {
    render(<TournamentForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("shows the error message returned by the action", async () => {
    const user = userEvent.setup();
    render(<TournamentForm />);

    await user.type(screen.getByLabelText(/name/i), "City Open");
    await user.type(screen.getByLabelText(/location/i), "Warsaw");
    await user.type(screen.getByLabelText(/date/i), "2026-08-01");
    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText("Could not create the tournament.")).toBeInTheDocument();
    });
  });
});
