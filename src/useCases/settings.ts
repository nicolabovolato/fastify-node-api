import { ISettingsService } from "src/domain/settings";

export type ISettings = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string | null) => Promise<string | null>;
};

export class Settings implements ISettings {
  constructor(private readonly service: ISettingsService) {}

  async get(key: string) {
    return this.service.get(key);
  }

  async set(key: string, value: string | null) {
    return this.service.set(key, value);
  }
}
