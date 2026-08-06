import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const saveAnnotation = vi.fn();
const deleteAnnotation = vi.fn();

vi.mock("../actions", () => ({ saveAnnotation, deleteAnnotation }));

const { AnnotationEditor } = await import("./annotation-editor");

describe("AnnotationEditor", () => {
  beforeEach(() => {
    saveAnnotation.mockReset();
    deleteAnnotation.mockReset();
  });

  it("shows an empty textarea when there is no annotation yet", () => {
    render(<AnnotationEditor gameId={1} fen="startpos" annotation={undefined} />);

    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("shows the existing annotation text and a delete button", () => {
    render(
      <AnnotationEditor
        gameId={1}
        fen="startpos"
        annotation={{ id: 5, fen: "startpos", text: "Solid opening choice." }}
      />,
    );

    expect(screen.getByRole("textbox")).toHaveValue("Solid opening choice.");
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("saves a new annotation with the current gameId and fen", async () => {
    const user = userEvent.setup();
    saveAnnotation.mockResolvedValue(undefined);
    render(<AnnotationEditor gameId={1} fen="startpos" annotation={undefined} />);

    await user.type(screen.getByRole("textbox"), "Solid opening choice.");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(saveAnnotation).toHaveBeenCalled());
    const submittedFormData = saveAnnotation.mock.calls[0][1] as FormData;
    expect(submittedFormData.get("gameId")).toBe("1");
    expect(submittedFormData.get("fen")).toBe("startpos");
    expect(submittedFormData.get("annotationId")).toBe("");
    expect(submittedFormData.get("text")).toBe("Solid opening choice.");
  });

  it("includes the annotationId when updating an existing annotation", async () => {
    const user = userEvent.setup();
    saveAnnotation.mockResolvedValue(undefined);
    render(
      <AnnotationEditor
        gameId={1}
        fen="startpos"
        annotation={{ id: 5, fen: "startpos", text: "old text" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(saveAnnotation).toHaveBeenCalled());
    const submittedFormData = saveAnnotation.mock.calls[0][1] as FormData;
    expect(submittedFormData.get("annotationId")).toBe("5");
  });

  it("includes the sidelineId when creating an annotation inside a sideline", async () => {
    const user = userEvent.setup();
    saveAnnotation.mockResolvedValue(undefined);
    render(<AnnotationEditor gameId={1} fen="startpos" annotation={undefined} sidelineId={7} />);

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(saveAnnotation).toHaveBeenCalled());
    const submittedFormData = saveAnnotation.mock.calls[0][1] as FormData;
    expect(submittedFormData.get("sidelineId")).toBe("7");
  });

  it("deletes the annotation when delete is clicked", async () => {
    const user = userEvent.setup();
    deleteAnnotation.mockResolvedValue(undefined);
    render(
      <AnnotationEditor
        gameId={1}
        fen="startpos"
        annotation={{ id: 5, fen: "startpos", text: "old text" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => expect(deleteAnnotation).toHaveBeenCalled());
    const submittedFormData = deleteAnnotation.mock.calls[0][1] as FormData;
    expect(submittedFormData.get("gameId")).toBe("1");
    expect(submittedFormData.get("annotationId")).toBe("5");
  });

  it("shows the error message returned by the save action", async () => {
    const user = userEvent.setup();
    saveAnnotation.mockResolvedValue({ error: "Could not save the annotation." });
    render(<AnnotationEditor gameId={1} fen="startpos" annotation={undefined} />);

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("Could not save the annotation.")).toBeInTheDocument();
    });
  });
});
