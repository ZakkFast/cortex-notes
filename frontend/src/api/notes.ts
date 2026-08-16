import { apiRequest } from "./client";
import type { Backlink, Note, NoteDraft } from "../types/note";

export const notesApi = {
  list(search = "", trash = false) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (trash) params.set("trash", "true");
    const query = params.toString();
    return apiRequest<Note[]>(`/notes${query ? `?${query}` : ""}`);
  },

  create(payload: Partial<NoteDraft> = {}) {
    return apiRequest<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(noteId: string, payload: Partial<NoteDraft>) {
    return apiRequest<Note>(`/notes/${noteId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  remove(noteId: string) {
    return apiRequest<void>(`/notes/${noteId}`, { method: "DELETE" });
  },

  restore(noteId: string) {
    return apiRequest<Note>(`/notes/${noteId}/restore`, { method: "POST" });
  },

  backlinks(noteId: string) {
    return apiRequest<Backlink[]>(`/notes/${noteId}/backlinks`);
  },
};
