import {
  Type,
  FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";

import { IAuth } from "src/useCases/auth";

const claims = Type.Object({
  sub: Type.String({ format: "email" }),
  role: Type.Union([Type.Literal("user"), Type.Literal("admin")]),
});

const headers = Type.Object({
  authorization: Type.String({ pattern: "^Bearer .+" }),
});
const params = Type.Object({
  email: Type.String({ format: "email" }),
});

const tokenResponse = Type.Object({
  token: Type.String(),
});

const protectedResponse = Type.Object({
  message: Type.String(),
});

const getToken = (header: string) => header.slice(7);

export default (useCase: IAuth): FastifyPluginAsyncTypebox =>
  async (fastify) => {
    fastify.post(
      "/token",
      {
        schema: {
          tags: ["auth"],
          body: claims,
          response: {
            "2xx": tokenResponse,
          },
        },
      },
      async (req, res) => {
        const token = await useCase.generateToken(req.body);
        return res.status(201).send({ token });
      }
    );

    fastify.get(
      "/protected",
      {
        schema: {
          tags: ["auth"],
          headers: headers,
          response: {
            "2xx": protectedResponse,
          },
        },
        preHandler: async (req) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await useCase.validateToken(getToken(req.headers.authorization!));
        },
      },
      (_req, _res) => {
        return { message: "Access granted!" };
      }
    );

    fastify.get(
      "/user/:email",
      {
        schema: {
          tags: ["auth"],
          headers: headers,
          params,
          response: {
            "2xx": protectedResponse,
          },
        },
        preHandler: async (req) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await useCase.validateToken(getToken(req.headers.authorization!), {
            subs: [req.params.email],
          });
        },
      },
      (_req, _res) => {
        return { message: "Access granted!" };
      }
    );

    fastify.get(
      "/admin",
      {
        schema: {
          tags: ["auth"],
          headers,
          response: {
            "2xx": protectedResponse,
          },
        },
        preHandler: async (req) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await useCase.validateToken(getToken(req.headers.authorization!), {
            roles: ["admin"],
          });
        },
      },
      (_req, _res) => {
        return { message: "Access granted!" };
      }
    );
  };
