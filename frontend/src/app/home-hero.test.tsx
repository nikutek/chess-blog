import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomeHero } from "./home-hero";

const mountMock = vi.fn();
const disposeMock = vi.fn();
const resetBoardMock = vi.fn();
const animateMoveMock = vi.fn();
const setRotationPausedMock = vi.fn();

vi.mock("./chess-scene-3d", () => ({
  ChessScene3D: class {
    mount = mountMock;
    dispose = disposeMock;
    resetBoard = resetBoardMock;
    animateMove = animateMoveMock;
    setRotationPaused = setRotationPausedMock;
  },
}));

const analyses = [
  {
    id: 1,
    title: "vs Kasparov",
    tag: "City Open",
    desc: "e4 e5 Nf3",
    moves: [{ from: "e2", to: "e4" }],
  },
  {
    id: 2,
    title: "vs Karpov",
    tag: "Winter Cup",
    desc: "d4 d5 c4",
    moves: [{ from: "d2", to: "d4" }],
  },
];

describe("HomeHero", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("mounts the 3d scene once and disposes it on unmount", () => {
    const { unmount } = render(<HomeHero analyses={analyses} />);
    expect(mountMock).toHaveBeenCalledTimes(1);
    unmount();
    expect(disposeMock).toHaveBeenCalledTimes(1);
  });

  it("shows the default caption before any hover", () => {
    render(<HomeHero analyses={analyses} />);
    expect(screen.getByText("Najedź na analizę, aby zobaczyć pierwsze ruchy")).toBeInTheDocument();
  });

  it("on hover, pauses rotation, resets the board and schedules the opening moves", () => {
    render(<HomeHero analyses={analyses} />);

    fireEvent.mouseEnter(screen.getByText("vs Kasparov").closest("div")!.parentElement!.parentElement!);

    expect(setRotationPausedMock).toHaveBeenCalledWith(true);
    expect(resetBoardMock).toHaveBeenCalled();
    expect(screen.getByText("vs Kasparov — e4 e5 Nf3")).toBeInTheDocument();

    vi.advanceTimersByTime(400);
    expect(animateMoveMock).toHaveBeenCalledWith({ from: "e2", to: "e4" });
  });

  it("on unhover, resumes rotation and resets the board", () => {
    render(<HomeHero analyses={analyses} />);

    const card = screen.getByText("vs Kasparov").closest("div")!.parentElement!.parentElement!;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);

    expect(setRotationPausedMock).toHaveBeenCalledWith(false);
    expect(screen.getByText("Najedź na analizę, aby zobaczyć pierwsze ruchy")).toBeInTheDocument();
  });
});
