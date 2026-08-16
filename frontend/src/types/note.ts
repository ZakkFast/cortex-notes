export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Backlink = {
  id: string;
  title: string;
  updated_at: string;
};

export type NoteDraft = {
  title: string;
  content: string;
  tags: string[];
};

export type SaveState = "idle" | "saving" | "saved" | "error";
