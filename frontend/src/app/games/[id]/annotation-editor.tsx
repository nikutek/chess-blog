"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { deleteAnnotation, saveAnnotation } from "../actions";

type Annotation = { id: number; fen: string; text: string };

export function AnnotationEditor({
  gameId,
  fen,
  annotation,
  sidelineId,
}: {
  gameId: number;
  fen: string;
  annotation: Annotation | undefined;
  sidelineId?: number;
}) {
  const [saveState, saveAction, savePending] = useActionState(saveAnnotation, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAnnotation, undefined);

  return (
    <div className="flex flex-col gap-2">
      <form action={saveAction} className="flex flex-col gap-2">
        <input type="hidden" name="gameId" value={gameId} />
        <input type="hidden" name="fen" value={fen} />
        <input type="hidden" name="annotationId" value={annotation?.id ?? ""} />
        <input type="hidden" name="sidelineId" value={sidelineId ?? ""} />
        <Textarea name="text" defaultValue={annotation?.text ?? ""} placeholder="Add an annotation…" />
        <div className="flex gap-2">
          <Button type="submit" variant="outline" size="sm" disabled={savePending}>
            Save
          </Button>
          {annotation && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deletePending}
              onClick={() => {
                const formData = new FormData();
                formData.set("gameId", String(gameId));
                formData.set("annotationId", String(annotation.id));
                deleteAction(formData);
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </form>
      {saveState?.error && <p className="text-sm text-destructive">{saveState.error}</p>}
      {deleteState?.error && <p className="text-sm text-destructive">{deleteState.error}</p>}
    </div>
  );
}
