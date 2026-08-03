import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SidelineViewer } from "./sideline-viewer";

const sideline = {
  id: 7,
  branchFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
  pgn: "2. Nc3 Nf6",
  description: "A quieter alternative to Nf3.",
};

describe("SidelineViewer", () => {
  it("renders the board at the branch position and shows the description", () => {
    const { container } = render(<SidelineViewer sideline={sideline} onBack={() => {}} />);

    expect(
      container.querySelector("#sideline-viewer-piece-wN-b1"),
    ).toBeInTheDocument();
    expect(screen.getByText("A quieter alternative to Nf3.")).toBeInTheDocument();
  });

  it("advances one move on the board when next is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<SidelineViewer sideline={sideline} onBack={() => {}} />);

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(
      container.querySelector("#sideline-viewer-piece-wN-c3"),
    ).toBeInTheDocument();
  });

  it("calls onBack when returning to the main game", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<SidelineViewer sideline={sideline} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: /back to main game/i }));

    expect(onBack).toHaveBeenCalled();
  });

  describe("play", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("automatically steps through every move when play is clicked", async () => {
      const { container } = render(<SidelineViewer sideline={sideline} onBack={() => {}} />);

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
