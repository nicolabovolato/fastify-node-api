import { beforeEach, describe, expect, test, vi } from "vitest";

import { config, getFastifyInstance, mockUseCases } from "../../mocks";

import { randomUUID } from "node:crypto";

const useCases = mockUseCases();

describe("/v1/jobs api routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /v1/jobs", () => {
    test("201", async () => {
      const id = randomUUID();

      vi.mocked(useCases.jobs.enqueue).mockResolvedValueOnce(id);
      const api = await getFastifyInstance(config, useCases);

      const response = await api
        .inject()
        .post(`/v1/jobs`)
        .payload({
          data: [1, 2, 3, 4],
          operation: "add",
        });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual({
        id,
      });
      expect(useCases.jobs.enqueue).toHaveBeenCalledOnce();
      expect(useCases.jobs.enqueue).toHaveBeenCalledWith({
        data: [1, 2, 3, 4],
        operation: "add",
      });
    });
  });
});
