export type Claims = {
  sub: string;
  role: "user" | "admin";
};

export type IAuthService = {
  sign: (claims: Claims, expireInMs: number) => Promise<string>;
  verify: (token: string) => Promise<Claims>;
};
