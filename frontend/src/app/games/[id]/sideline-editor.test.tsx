import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const saveSideline = vi.fn();
const deleteSideline = vi.fn();

vi.mock("../actions", () => ({ saveSideline, deleteSideline }));

const { SidelineEditor } = await import("./sideline-editor");

describe("SidelineEditor", () => {
  beforeEach(() => {
    saveSideline.mockReset();
    deleteSideline.mockReset();
  });

  it("shows empty pgn and description fields when creating a new sideline", () => {
    render(<SidelineEditor gameId={1} branchFen="startpos" sideline={undefined} />);

    expect(screen.getByLabelText(/pgn/i)).toHaveValue("");
    expect(screen.getByLabelText(/description/i)).toHaveValue("");
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("shows the existing sideline's pgn, description, and a delete button", () => {
    render(
      <SidelineEditor
        gameId={1}
        branchFen="startpos"
        sideline={{ id: 7, branchFen: "startpos", pgn: "2. Nc3 Nf6", description: "A quieter alternative to Nf3." }}
      />,
    );

    expect(screen.getByLabelText(/pgn/i)).toHaveValue("2. Nc3 Nf6");
    expect(screen.getByLabelText(/description/i)).toHaveValue("A quieter alternative to Nf3.");
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("saves a new sideline with the current gameId and branchFen", async () => {
    const user = userEvent.setup();
    saveSideline.mockResolvedValue(undefined);
    render(<SidelineEditor gameId={1} branchFen="startpos" sideline={undefined} />);

    await user.type(screen.getByLabelText(/pgn/i), "2. Nc3 Nf6");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(saveSideline).toHaveBeenCalled());
    const submittedFormData = saveSideline.mock.calls[0][1] as FormData;
    expect(submittedFormData.get("gameId")).toBe("1");
    expect(submittedFormData.get("branchFen")).toBe("startpos");
    expect(submittedFormData.get("sidelineId")).toBe("");
    expect(submittedFormData.get("pgn")).toBe("2. Nc3 Nf6");
  });

  it("includes the sidelineId when updating an existing sideline", async () => {
    const user = userEvent.setup();
    saveSideline.mockResolvedValue(undefined);
    render(
      <SidelineEditor
        gameId={1}
        branchFen="startpos"
        sideline={{ id: 7, branchFen: "startpos", pgn: "2. Nc3", description: "" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(saveSideline).toHaveBeenCalled());
    const submittedFormData = saveSideline.mock.calls[0][1] as FormData;
    expect(submittedFormData.get("sidelineId")).toBe("7");
  });

  it("includes the parentSidelineId when creating a nested sideline", async () => {
    const user = userEvent.setup();
    saveSideline.mockResolvedValue(undefined);
    render(<SidelineEditor gameId={1} branchFen="startpos" sideline={undefined} parentSidelineId={3} />);

    await user.type(screen.getByLabelText(/pgn/i), "1... Nf6");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(saveSideline).toHaveBeenCalled());
    const submittedFormData = saveSideline.mock.calls[0][1] as FormData;
    expect(submittedFormData.get("parentSidelineId")).toBe("3");
  });

  it("deletes the sideline when delete is clicked", async () => {
    const user = userEvent.setup();
    deleteSideline.mockResolvedValue(undefined);
    render(
      <SidelineEditor
        gameId={1}
        branchFen="startpos"
        sideline={{ id: 7, branchFen: "startpos", pgn: "2. Nc3", description: "" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => expect(deleteSideline).toHaveBeenCalled());
    const submittedFormData = deleteSideline.mock.calls[0][1] as FormData;
    expect(submittedFormData.get("gameId")).toBe("1");
    expect(submittedFormData.get("sidelineId")).toBe("7");
  });
});
