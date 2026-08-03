"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { deleteSideline, saveSideline } from "../actions";

type Sideline = { id: number; branchFen: string; pgn: string; description: string | null };

export function SidelineEditor({
  gameId,
  branchFen,
  sideline,
}: {
  gameId: number;
  branchFen: string;
  sideline: Sideline | undefined;
}) {
  const [saveState, saveAction, savePending] = useActionState(saveSideline, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteSideline, undefined);

  const fieldId = `sideline-${sideline?.id ?? "new"}`;

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <form action={saveAction} className="flex flex-col gap-2">
        <input type="hidden" name="gameId" value={gameId} />
        <input type="hidden" name="branchFen" value={branchFen} />
        <input type="hidden" name="sidelineId" value={sideline?.id ?? ""} />
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${fieldId}-pgn`}>Sideline PGN</Label>
          <Textarea
            id={`${fieldId}-pgn`}
            name="pgn"
            defaultValue={sideline?.pgn ?? ""}
            placeholder="e.g. 2. Nc3 Nf6"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${fieldId}-description`}>Description</Label>
          <Input
            id={`${fieldId}-description`}
            name="description"
            defaultValue={sideline?.description ?? ""}
            placeholder="Optional description"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="outline" size="sm" disabled={savePending}>
            Save
          </Button>
          {sideline && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deletePending}
              onClick={() => {
                const formData = new FormData();
                formData.set("gameId", String(gameId));
                formData.set("sidelineId", String(sideline.id));
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
