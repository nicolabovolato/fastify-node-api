import { beforeEach, describe, expect, test, vi } from "vitest";

import { config, getFastifyInstance, mockUseCases } from "../../mocks";

const useCases = mockUseCases();

describe("/v1/settings api routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /v1/settings/:key", () => {
    test.each(["value", null])("200 - %s", async (value) => {
      vi.mocked(useCases.settings.get).mockResolvedValueOnce(value);
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().get(`/v1/settings/setting-key`);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        value,
      });
      expect(useCases.settings.get).toHaveBeenCalledOnce();
      expect(useCases.settings.get).toHaveBeenCalledWith("setting-key");
    });
  });

  describe("PUT /v1/settings/:key", () => {
    test.each(["value", null])("200 - %s", async (value) => {
      vi.mocked(useCases.settings.set).mockResolvedValueOnce(value);
      const api = await getFastifyInstance(config, useCases);

      const response = await api
        .inject()
        .put(`/v1/settings/setting-key`)
        .payload({
          value,
        });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        value,
      });
      expect(useCases.settings.set).toHaveBeenCalledOnce();
      expect(useCases.settings.set).toHaveBeenCalledWith("setting-key", value);
    });
  });
});
