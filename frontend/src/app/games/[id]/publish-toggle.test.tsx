import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("../actions", () => ({
  publishGame: vi.fn(async () => ({ error: "Could not publish the game." })),
  unpublishGame: vi.fn(),
}));

const { PublishToggle } = await import("./publish-toggle");

describe("PublishToggle", () => {
  it("shows a Publish button for a draft game", () => {
    render(<PublishToggle gameId={1} status="draft" />);

    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /unpublish/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an Unpublish button for a published game", () => {
    render(<PublishToggle gameId={1} status="published" />);

    expect(screen.getByRole("button", { name: /unpublish/i })).toBeInTheDocument();
  });

  it("shows the error message returned by the action", async () => {
    const user = userEvent.setup();
    render(<PublishToggle gameId={1} status="draft" />);

    await user.click(screen.getByRole("button", { name: /publish/i }));

    await waitFor(() => {
      expect(screen.getByText("Could not publish the game.")).toBeInTheDocument();
    });
  });
});
