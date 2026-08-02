import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions", () => ({
  publishGame: vi.fn(),
  unpublishGame: vi.fn(),
}));

const { PublishToggle } = await import("./publish-toggle");

describe("PublishToggle", () => {
  it("shows a Publish button for a draft game", () => {
    render(<PublishToggle gameId={1} status="DRAFT" />);

    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /unpublish/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an Unpublish button for a published game", () => {
    render(<PublishToggle gameId={1} status="PUBLISHED" />);

    expect(screen.getByRole("button", { name: /unpublish/i })).toBeInTheDocument();
  });
});
