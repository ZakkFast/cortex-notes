import { apiRequest } from "./client";

export type CortexSettings = {
  accent_color: string;
};

export const settingsApi = {
  get() {
    return apiRequest<CortexSettings>("/settings");
  },

  update(accentColor: string) {
    return apiRequest<CortexSettings>("/settings", {
      method: "PATCH",
      body: JSON.stringify({ accent_color: accentColor }),
    });
  },
};
