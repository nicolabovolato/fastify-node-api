import { beforeEach, describe, expect, test, vi } from "vitest";

import { config, getFastifyInstance, mockUseCases } from "../../mocks";

import { AuthError } from "src/domain/errors";

const useCases = mockUseCases();

describe("/v1/auth api routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /v1/auth/token", () => {
    test.each([
      { sub: "user@example.com", role: "user" },
      { sub: "admin@example.com", role: "admin" },
    ] as const)("201 - claims: %s", async (body) => {
      vi.mocked(useCases.auth.generateToken).mockResolvedValueOnce("token");
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().post("/v1/auth/token").payload(body);

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual({ token: "token" });
      expect(useCases.auth.generateToken).toHaveBeenCalledOnce();
      expect(useCases.auth.generateToken).toHaveBeenCalledWith(body);
    });
  });

  describe("GET /v1/auth/protected", () => {
    test("200", async () => {
      vi.mocked(useCases.auth.validateToken).mockResolvedValue({
        sub: "user@example.com",
        role: "user",
      });
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().get("/v1/auth/protected").headers({
        authorization: "Bearer token",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty("message");
      expect(response.json().message).toBeTypeOf("string");
      expect(useCases.auth.validateToken).toHaveBeenCalledOnce();
      expect(useCases.auth.validateToken).toHaveBeenCalledWith("token");
    });

    test("401", async () => {
      vi.mocked(useCases.auth.validateToken).mockRejectedValue(
        new AuthError("unauthorized")
      );
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().get("/v1/auth/protected").headers({
        authorization: "Bearer token",
      });

      expect(response.statusCode).toBe(401);
      expect(useCases.auth.validateToken).toHaveBeenCalledOnce();
      expect(useCases.auth.validateToken).toHaveBeenCalledWith("token");
    });
  });

  describe("GET /v1/auth/user/:email", () => {
    test("200", async () => {
      vi.mocked(useCases.auth.validateToken).mockResolvedValue({
        sub: "user@example.com",
        role: "user",
      });
      const api = await getFastifyInstance(config, useCases);

      const response = await api
        .inject()
        .get(`/v1/auth/user/user@example.com`)
        .headers({
          authorization: "Bearer token",
        });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty("message");
      expect(response.json().message).toBeTypeOf("string");
      expect(useCases.auth.validateToken).toHaveBeenCalledOnce();
      expect(useCases.auth.validateToken).toHaveBeenCalledWith("token", {
        subs: ["user@example.com"],
      });
    });

    test("401", async () => {
      vi.mocked(useCases.auth.validateToken).mockRejectedValue(
        new AuthError("unauthorized")
      );
      const api = await getFastifyInstance(config, useCases);

      const response = await api
        .inject()
        .get("/v1/auth/user/user@example.com")
        .headers({
          authorization: "Bearer token",
        });

      expect(response.statusCode).toBe(401);
      expect(useCases.auth.validateToken).toHaveBeenCalledOnce();
      expect(useCases.auth.validateToken).toHaveBeenCalledWith("token", {
        subs: ["user@example.com"],
      });
    });

    test("403", async () => {
      vi.mocked(useCases.auth.validateToken).mockRejectedValue(
        new AuthError("forbidden")
      );
      const api = await getFastifyInstance(config, useCases);

      const response = await api
        .inject()
        .get("/v1/auth/user/user@example.com")
        .headers({
          authorization: "Bearer token",
        });

      expect(response.statusCode).toBe(403);
      expect(useCases.auth.validateToken).toHaveBeenCalledOnce();
      expect(useCases.auth.validateToken).toHaveBeenCalledWith("token", {
        subs: ["user@example.com"],
      });
    });
  });

  describe("GET /v1/auth/admin", () => {
    test("200", async () => {
      vi.mocked(useCases.auth.validateToken).mockResolvedValue({
        sub: "admin@example.com",
        role: "admin",
      });
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().get(`/v1/auth/admin`).headers({
        authorization: "Bearer token",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty("message");
      expect(response.json().message).toBeTypeOf("string");
      expect(useCases.auth.validateToken).toHaveBeenCalledOnce();
      expect(useCases.auth.validateToken).toHaveBeenCalledWith("token", {
        roles: ["admin"],
      });
    });

    test("401", async () => {
      vi.mocked(useCases.auth.validateToken).mockRejectedValue(
        new AuthError("unauthorized")
      );
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().get("/v1/auth/admin").headers({
        authorization: "Bearer token",
      });

      expect(response.statusCode).toBe(401);
      expect(useCases.auth.validateToken).toHaveBeenCalledOnce();
      expect(useCases.auth.validateToken).toHaveBeenCalledWith("token", {
        roles: ["admin"],
      });
    });

    test("403", async () => {
      vi.mocked(useCases.auth.validateToken).mockRejectedValue(
        new AuthError("forbidden")
      );
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().get("/v1/auth/admin").headers({
        authorization: "Bearer token",
      });

      expect(response.statusCode).toBe(403);
      expect(useCases.auth.validateToken).toHaveBeenCalledOnce();
      expect(useCases.auth.validateToken).toHaveBeenCalledWith("token", {
        roles: ["admin"],
      });
    });
  });
});
