import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { GameViewer } from "./game-viewer";

describe("GameViewer", () => {
  it("renders the board in the starting position when no move is selected", () => {
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" />);

    expect(
      container.querySelector("#game-viewer-piece-wP-e2"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("#game-viewer-piece-wP-e4"),
    ).not.toBeInTheDocument();
  });

  it("advances one move on the board when next is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" />);

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(
      container.querySelector("#game-viewer-piece-wP-e4"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("#game-viewer-piece-wP-e2"),
    ).not.toBeInTheDocument();
  });

  it("disables prev at the starting position and re-enables it after a move", async () => {
    const user = userEvent.setup();
    render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" />);

    expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByRole("button", { name: /prev/i })).toBeEnabled();
  });

  it("moves back one move on the board when prev is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" />);

    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /prev/i }));

    expect(
      container.querySelector("#game-viewer-piece-wP-e4"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("#game-viewer-piece-bP-e5"),
    ).not.toBeInTheDocument();
  });

  it("lists every move and highlights the currently selected one", async () => {
    const user = userEvent.setup();
    render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" />);

    expect(screen.getByText("e4")).toBeInTheDocument();
    expect(screen.getByText("e5")).toBeInTheDocument();
    expect(screen.getByText("Nf3")).toBeInTheDocument();
    expect(screen.getByText("Nc6")).toBeInTheDocument();

    expect(screen.getByText("e4")).toHaveAttribute("aria-current", "false");

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("e4")).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("e5")).toHaveAttribute("aria-current", "false");
  });

  it("jumps directly to the clicked move in the sidebar", async () => {
    const user = userEvent.setup();
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" />);

    await user.click(screen.getByText("Nf3"));

    expect(
      container.querySelector("#game-viewer-piece-wN-f3"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nf3")).toHaveAttribute("aria-current", "true");
  });

  it("jumps to a move when it is activated with the keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" />);

    screen.getByText("Nf3").focus();
    await user.keyboard("{Enter}");

    expect(
      container.querySelector("#game-viewer-piece-wN-f3"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nf3")).toHaveAttribute("aria-current", "true");
  });
});
