import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../actions", () => ({
  saveAnnotation: vi.fn(),
  deleteAnnotation: vi.fn(),
  saveSideline: vi.fn(),
  deleteSideline: vi.fn(),
}));

const { SidelineViewer } = await import("./sideline-viewer");

const sideline = {
  id: 7,
  branchFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
  pgn: "2. Nc3 Nf6",
  description: "A quieter alternative to Nf3.",
};

describe("SidelineViewer", () => {
  it("renders the board at the branch position and shows the description", () => {
    const { container } = render(
      <SidelineViewer sideline={sideline} gameId={1} isAuthor={false} annotations={[]} onBack={() => {}} />,
    );

    expect(
      container.querySelector("#sideline-viewer-piece-wN-b1"),
    ).toBeInTheDocument();
    expect(screen.getByText("A quieter alternative to Nf3.")).toBeInTheDocument();
  });

  it("advances one move on the board when next is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SidelineViewer sideline={sideline} gameId={1} isAuthor={false} annotations={[]} onBack={() => {}} />,
    );

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(
      container.querySelector("#sideline-viewer-piece-wN-c3"),
    ).toBeInTheDocument();
  });

  it("calls onBack when returning to the main game", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<SidelineViewer sideline={sideline} gameId={1} isAuthor={false} annotations={[]} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: /back to main game/i }));

    expect(onBack).toHaveBeenCalled();
  });

  it("shows the annotation text to a reader when the selected move is annotated", async () => {
    const user = userEvent.setup();
    render(
      <SidelineViewer
        sideline={sideline}
        gameId={1}
        isAuthor={false}
        annotations={[{ id: 1, fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2", text: "Sharp choice." }]}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Sharp choice.")).toBeInTheDocument();
  });

  it("shows an annotation input to the author for the current move", () => {
    render(<SidelineViewer sideline={sideline} gameId={1} isAuthor={true} annotations={[]} onBack={() => {}} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows a nested sideline indicator at the branch point and enters it when clicked", async () => {
    const user = userEvent.setup();
    const onEnterSideline = vi.fn();
    const nested = {
      id: 12,
      branchFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2",
      pgn: "1... c5",
      description: "Even sharper.",
    };
    render(
      <SidelineViewer
        sideline={sideline}
        gameId={1}
        isAuthor={false}
        annotations={[]}
        childSidelines={[nested]}
        onEnterSideline={onEnterSideline}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /sideline/i }));

    expect(onEnterSideline).toHaveBeenCalledWith(12);
  });

  it("shows a custom back label when returning to a parent sideline", () => {
    render(
      <SidelineViewer
        sideline={sideline}
        gameId={1}
        isAuthor={false}
        annotations={[]}
        onBack={() => {}}
        backLabel="Back to previous sideline"
      />,
    );

    expect(screen.getByRole("button", { name: /back to previous sideline/i })).toBeInTheDocument();
  });

  describe("play", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("automatically steps through every move when play is clicked", async () => {
      const { container } = render(
        <SidelineViewer sideline={sideline} gameId={1} isAuthor={false} annotations={[]} onBack={() => {}} />,
      );

      fireEvent.click(screen.getByRole("button", { name: /play/i }));

      for (let i = 0; i < 2; i++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(800);
        });
      }

      expect(
        container.querySelector("#sideline-viewer-piece-bN-f6"),
      ).toBeInTheDocument();
    });
  });
});
