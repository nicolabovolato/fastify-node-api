import { beforeEach, describe, expect, test, vi } from "vitest";

import { ISettingsService } from "src/domain/settings";
import { Settings } from "src/useCases/settings";

const service = {
  get: vi.fn(),
  set: vi.fn(),
} satisfies ISettingsService;

describe("Settings use case", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("get()", () => {
    test("works", async () => {
      service.get.mockResolvedValueOnce("value");

      const result = await new Settings(service).get("key");

      expect(result).toEqual("value");
      expect(service.get).toHaveBeenCalledOnce();
      expect(service.get).toHaveBeenCalledWith("key");
    });
  });

  describe("set()", () => {
    test("works", async () => {
      service.set.mockResolvedValueOnce("value");

      const result = await new Settings(service).set("key", "value");

      expect(result).toEqual("value");
      expect(service.set).toHaveBeenCalledOnce();
      expect(service.set).toHaveBeenCalledWith("key", "value");
    });
  });
});
