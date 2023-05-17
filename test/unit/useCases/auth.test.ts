import { beforeEach, describe, expect, test, vi } from "vitest";

import { IAuthService, Claims } from "src/domain/auth";
import { Config, Auth, ClaimChecks } from "src/useCases/auth";
import { AuthError } from "src/domain/errors";

const service = {
  sign: vi.fn(),
  verify: vi.fn(),
} satisfies IAuthService;

const config: Config = {
  expirationMs: 60 * 1000,
};

describe("Auth use case", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateToken()", () => {
    test("works", async () => {
      const claims: Claims = { role: "user", sub: "test" };
      service.sign.mockResolvedValueOnce("token");

      const result = await new Auth(config, service).generateToken(claims);

      expect(result).toEqual("token");
      expect(service.sign).toHaveBeenCalledOnce();
      expect(service.sign).toHaveBeenCalledWith(claims, config.expirationMs);
    });
  });

  describe("validateToken()", () => {
    test.each([
      [undefined, { role: "user", sub: "user1" }],
      [
        { roles: ["admin", "user"], subs: ["user1", "user2"] },
        { role: "user", sub: "user1" },
      ],
      [
        { roles: ["admin"], subs: ["user1"] },
        { role: "admin", sub: "user1" },
      ],
      [
        { roles: ["user"], subs: ["user2"] },
        { role: "user", sub: "user2" },
      ],
      [{ roles: ["admin"] }, { role: "admin", sub: "user1" }],
      [{ subs: ["user2"] }, { role: "user", sub: "user2" }],
    ] satisfies [ClaimChecks | undefined, Claims][])(
      "check succeeds (%#)",
      async (inClaims, outClaims) => {
        service.verify.mockResolvedValueOnce(outClaims);

        const result = await new Auth(config, service).validateToken(
          "token",
          inClaims
        );

        expect(result).toEqual(outClaims);
        expect(service.verify).toHaveBeenCalledOnce();
        expect(service.verify).toHaveBeenCalledWith("token");
      }
    );

    test.each([
      [
        { roles: [], subs: [] },
        { role: "user", sub: "user1" },
      ],
      [
        { roles: ["admin"], subs: [] },
        { role: "admin", sub: "user1" },
      ],
      [
        { roles: [], subs: ["user1"] },
        { role: "admin", sub: "user1" },
      ],
      [
        { roles: ["admin"], subs: ["user2"] },
        { role: "admin", sub: "user1" },
      ],
      [
        { roles: ["user"], subs: ["user1"] },
        { role: "admin", sub: "user1" },
      ],
    ] satisfies [ClaimChecks | undefined, Claims][])(
      "check fails (%#)",
      async (inClaims, outClaims) => {
        service.verify.mockResolvedValueOnce(outClaims);

        await expect(
          new Auth(config, service).validateToken("token", inClaims)
        ).rejects.toThrowError(AuthError);
        expect(service.verify).toHaveBeenCalledOnce();
        expect(service.verify).toHaveBeenCalledWith("token");
      }
    );
  });
});
