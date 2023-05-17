import { describe, expect, test, vi } from "vitest";

import { config, getFastifyInstance } from "./mocks";

import { FastifyInstance, FastifyReply } from "fastify";

describe("Fastify api", () => {
  describe("constructor()", () => {
    describe("custom error handler is set", async () => {
      test("works", async () => {
        vi.resetModules();
        vi.doMock("src/api/utils/error", () => ({
          errorHandler: async (err: unknown, req: unknown, res: FastifyReply) =>
            res.status(500).send("error"),
        }));

        const server = await getFastifyInstance();

        server.get("/test", async () => {
          throw new Error();
        });

        const response = await server.inject().get("/test");

        expect(response.statusCode).toBe(500);
        expect(response.body).toBe("error");

        vi.doUnmock(`src/api/utils/error`);
      });
    });

    test.each(["v1/auth", "v1/todos", "v1/jobs", "v1/settings"])(
      "router /%s is registered",
      async (route) => {
        vi.resetModules();
        vi.doMock(`src/api/routes/${route}`, () => ({
          default: () => async (f: FastifyInstance) => {
            f.get("/", () => route);
          },
        }));

        const server = await getFastifyInstance();

        const response = await server.inject().get(`/${route}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(route);

        vi.doUnmock(`src/api/routes/${route}`);
      }
    );
  });

  describe("routes", () => {
    describe("GET /health", () => {
      test("works", async () => {
        const server = await getFastifyInstance();

        const response = await server.inject().get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe("OK");
      });
    });

    describe("GET /documentation", () => {
      test("is exposed when openapi is true", async () => {
        const server = await getFastifyInstance({ ...config, openapi: true });

        const response = await server.inject().get("/documentation");

        expect(response.statusCode).toBeLessThan(400);
      });

      test("is not exposed when openapi is false", async () => {
        const server = await getFastifyInstance({ ...config, openapi: false });

        const response = await server.inject().get("/documentation");

        expect(response.statusCode).toBe(404);
      });
    });
  });
});
