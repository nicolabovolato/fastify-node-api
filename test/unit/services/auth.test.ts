import { describe, expect, test } from "vitest";

import { V2, V4 } from "paseto";

import { PasetoAuth, Config } from "src/services/auth";
import { Claims } from "src/domain/auth";
import { AuthError } from "src/domain/errors";

const config: Config = {
  publicKey: `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEARCsnT9JAkaWG+6BlBeJTKUmZY+xmn+xdwINSS4dhVHM=
-----END PUBLIC KEY-----`,
  privateKey: `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIGgU582FmEz0i76AVAKH3NRcT+3fZu/SSXdhoFdzWfuH
-----END PRIVATE KEY-----`,
};

describe("Paseto auth service", () => {
  describe("sign()", () => {
    test("works", async () => {
      const claims: Claims = { sub: "user", role: "admin" };
      const token = await new PasetoAuth(config).sign(claims, 60 * 1000);
      await expect(V4.verify(token, config.publicKey)).resolves.toContain(
        claims
      );
    });
  });

  describe("verify()", () => {
    test("works", async () => {
      const claims: Claims = { sub: "user", role: "admin" };
      const token = await V4.sign(claims, config.privateKey, {
        expiresIn: "1m",
      });
      await expect(new PasetoAuth(config).verify(token)).resolves.toEqual(
        claims
      );
    });

    test("fails on invalid token version", async () => {
      const claims: Claims = { sub: "user", role: "admin" };
      const v2token = await V2.sign(claims, config.privateKey, {
        expiresIn: "1m",
      });
      await expect(new PasetoAuth(config).verify(v2token)).rejects.toThrowError(
        AuthError
      );
    });

    test("fails on expired token", async () => {
      const claims: Claims = { sub: "user", role: "admin" };
      const token = await V4.sign(claims, config.privateKey, {
        expiresIn: "0s",
      });
      await expect(new PasetoAuth(config).verify(token)).rejects.toThrowError(
        AuthError
      );
    });

    test("fails on token signed with another key", async () => {
      const claims: Claims = { sub: "user", role: "admin" };
      const key = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIGgU582FmEz0i76AVAKH3NRcT+3fZh/SSXdhoFdzWfuS
-----END PRIVATE KEY-----`;

      const token = await V4.sign(claims, key, {
        expiresIn: "1m",
      });
      await expect(new PasetoAuth(config).verify(token)).rejects.toThrowError(
        AuthError
      );
    });

    test.each([
      { sub: true, role: "user" },
      { sub: "user", role: true },
      { sub: "user", role: "super" },
    ])("fails on malformed claims (%#)", async (claims) => {
      const token = await V4.sign(claims, config.privateKey, {
        expiresIn: "1m",
      });
      await expect(new PasetoAuth(config).verify(token)).rejects.toThrowError(
        AuthError
      );
    });
  });
});
