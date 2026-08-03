import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { parsePgn } from "@/lib/chess/parse-pgn";

vi.mock("../actions", () => ({
  saveAnnotation: vi.fn(),
  deleteAnnotation: vi.fn(),
  saveSideline: vi.fn(),
  deleteSideline: vi.fn(),
}));

const { GameViewer } = await import("./game-viewer");

describe("GameViewer", () => {
  it("renders the board in the starting position when no move is selected", () => {
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={false} annotations={[]} />);

    expect(
      container.querySelector("#game-viewer-piece-wP-e2"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("#game-viewer-piece-wP-e4"),
    ).not.toBeInTheDocument();
  });

  it("advances one move on the board when next is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={false} annotations={[]} />);

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
    render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={false} annotations={[]} />);

    expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByRole("button", { name: /prev/i })).toBeEnabled();
  });

  it("moves back one move on the board when prev is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={false} annotations={[]} />);

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
    render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={false} annotations={[]} />);

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
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={false} annotations={[]} />);

    await user.click(screen.getByText("Nf3"));

    expect(
      container.querySelector("#game-viewer-piece-wN-f3"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nf3")).toHaveAttribute("aria-current", "true");
  });

  it("jumps to a move when it is activated with the keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={false} annotations={[]} />);

    screen.getByText("Nf3").focus();
    await user.keyboard("{Enter}");

    expect(
      container.querySelector("#game-viewer-piece-wN-f3"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nf3")).toHaveAttribute("aria-current", "true");
  });

  it("shows the annotation text to a reader when the selected move is annotated", async () => {
    const user = userEvent.setup();
    const fenAfterE4 = parsePgn("1. e4 e5 2. Nf3 Nc6")[0].fen;
    render(
      <GameViewer
        pgn="1. e4 e5 2. Nf3 Nc6"
        gameId={1}
        isAuthor={false}
        annotations={[{ id: 1, fen: fenAfterE4, text: "Solid opening choice." }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Solid opening choice.")).toBeInTheDocument();
  });

  it("shows nothing to a reader when the selected move is unannotated", () => {
    render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={false} annotations={[]} />);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows an annotation input to the author for any move", () => {
    render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={true} annotations={[]} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows a sideline indicator at the branch point move", async () => {
    const user = userEvent.setup();
    const fenAfterE4 = parsePgn("1. e4 e5 2. Nf3 Nc6")[0].fen;
    render(
      <GameViewer
        pgn="1. e4 e5 2. Nf3 Nc6"
        gameId={1}
        isAuthor={false}
        annotations={[]}
        sidelines={[{ id: 7, branchFen: fenAfterE4, pgn: "1... c5", description: "Sicilian instead." }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByRole("button", { name: /sideline/i })).toBeInTheDocument();
  });

  it("enters the sideline view and shows its description when the indicator is clicked", async () => {
    const user = userEvent.setup();
    const fenAfterE4 = parsePgn("1. e4 e5 2. Nf3 Nc6")[0].fen;
    render(
      <GameViewer
        pgn="1. e4 e5 2. Nf3 Nc6"
        gameId={1}
        isAuthor={false}
        annotations={[]}
        sidelines={[{ id: 7, branchFen: fenAfterE4, pgn: "1... c5", description: "Sicilian instead." }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /sideline/i }));

    expect(screen.getByText("Sicilian instead.")).toBeInTheDocument();
  });

  it("returns to the main game from a sideline", async () => {
    const user = userEvent.setup();
    const fenAfterE4 = parsePgn("1. e4 e5 2. Nf3 Nc6")[0].fen;
    render(
      <GameViewer
        pgn="1. e4 e5 2. Nf3 Nc6"
        gameId={1}
        isAuthor={false}
        annotations={[]}
        sidelines={[{ id: 7, branchFen: fenAfterE4, pgn: "1... c5", description: "Sicilian instead." }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /sideline/i }));
    await user.click(screen.getByRole("button", { name: /back to main game/i }));

    expect(screen.getByText("Nf3")).toBeInTheDocument();
    expect(screen.queryByText("Sicilian instead.")).not.toBeInTheDocument();
  });

  it("shows a sideline creation form to the author for the selected move", async () => {
    const user = userEvent.setup();
    render(<GameViewer pgn="1. e4 e5 2. Nf3 Nc6" gameId={1} isAuthor={true} annotations={[]} sidelines={[]} />);

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByLabelText(/sideline pgn/i)).toBeInTheDocument();
  });
});
