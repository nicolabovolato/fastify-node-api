import { describe, expect, test } from "vitest";

import { logger } from "test/mocks";

import fastify from "fastify";

import { errorHandler } from "src/api/utils/error";
import { AuthError, ConflictError, NotFoundError } from "src/domain/errors";

describe("Api utils", () => {
  describe("errorHandler()", () => {
    test.each([
      { error: new NotFoundError("entity", "id"), statusCode: 404 },
      { error: new ConflictError("entity"), statusCode: 409 },
      { error: new AuthError("unauthorized"), statusCode: 401 },
      { error: new AuthError("forbidden"), statusCode: 403 },
    ] as const)(
      "domain error $error.constructor.name ($error.message) is mapped to $statusCode",
      async ({ error, statusCode }) => {
        const app = await fastify({
          logger,
        })
          .setErrorHandler(errorHandler)
          .get("/", () => {
            throw error;
          });

        const result = await app.inject().get("/");

        expect(result.json()).toContain({
          statusCode,
          message: error.message,
        });
      }
    );

    test.each([
      { error: new Error("error") },
      { error: new TypeError("type error") },
      { error: new RangeError("range error") },
    ] as const)(
      "unknown error $error.constructor.name is mapped to 500",
      async (error) => {
        const app = await fastify({
          logger,
        })
          .setErrorHandler(errorHandler)
          .get("/", () => {
            throw error;
          });

        const result = await app.inject().get("/");

        expect(result.json()).toEqual({
          statusCode: 500,
          error: "Internal server error",
          message: "internal server error",
        });
      }
    );

    test.each([
      new fastify.errorCodes.FST_ERR_CTP_INVALID_MEDIA_TYPE(),
      { statusCode: "400", code: "FST_ERR_VALIDATION" },
    ] as const)(
      "fastify error $code is handled in the default error handler",
      async (err) => {
        const app = await fastify({
          logger,
        })
          .setErrorHandler(errorHandler)
          .get("/", () => {
            throw err;
          });

        const result = await app.inject().get("/");

        expect(result.json()).toContain({
          statusCode: err.statusCode,
          code: err.code,
        });
      }
    );
  });
});
