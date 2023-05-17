import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { V4, errors as pasetoErrors } from "paseto";

import { IAuthService, Claims } from "src/domain/auth";
import { AuthError } from "src/domain/errors";

export type Config = {
  privateKey: string;
  publicKey: string;
};

const claimsValidator = TypeCompiler.Compile(
  Type.Object({
    sub: Type.String(),
    role: Type.Union([Type.Literal("user"), Type.Literal("admin")]),
  })
);

export class PasetoAuth implements IAuthService {
  constructor(private readonly config: Config) {}

  async sign(claims: Claims, expireInMs: number) {
    return await V4.sign(claims, this.config.privateKey, {
      expiresIn: `${expireInMs / 1000}s`,
    });
  }

  async verify(token: string) {
    const tokenClaims = await this.verifyWrapped(token);

    if (!claimsValidator.Check(tokenClaims))
      throw new AuthError("unauthorized");

    return {
      role: tokenClaims.role,
      sub: tokenClaims.sub,
    };
  }

  private async verifyWrapped(token: string) {
    try {
      return await V4.verify(token, this.config.publicKey);
    } catch (err) {
      if (err instanceof pasetoErrors.PasetoError) {
        switch (err.constructor) {
          case pasetoErrors.PasetoClaimInvalid:
          case pasetoErrors.PasetoInvalid:
          case pasetoErrors.PasetoNotSupported:
          case pasetoErrors.PasetoVerificationFailed:
            throw new AuthError("unauthorized");
        }
      }

      throw err;
    }
  }
}
