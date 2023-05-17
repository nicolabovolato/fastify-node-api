import { IAuthService, Claims } from "src/domain/auth";
import { AuthError } from "src/domain/errors";

export type Config = {
  expirationMs: number;
};

export type ClaimChecks = {
  subs?: Claims["sub"][];
  roles?: Claims["role"][];
};

export type IAuth = {
  generateToken: (claims: Claims) => Promise<string>;
  validateToken: (token: string, claims?: ClaimChecks) => Promise<Claims>;
};

export class Auth implements IAuth {
  constructor(
    private readonly config: Config,
    private readonly service: IAuthService
  ) {}

  async generateToken(claims: Claims) {
    return await this.service.sign(claims, this.config.expirationMs);
  }

  async validateToken(token: string, claims?: ClaimChecks) {
    const tokenClaims = await this.service.verify(token);

    if (claims?.subs && !claims.subs.includes(tokenClaims.sub))
      throw new AuthError("forbidden");

    if (claims?.roles && !claims.roles.includes(tokenClaims.role))
      throw new AuthError("forbidden");

    return tokenClaims;
  }
}
