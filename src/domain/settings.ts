export type ISettingsService = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string | null) => Promise<string | null>;
};
