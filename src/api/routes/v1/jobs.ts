import {
  Type,
  FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";

import { IJobs } from "src/useCases/jobs";

const body = Type.Object({
  operation: Type.Union([
    Type.Literal("add"),
    Type.Literal("subtract"),
    Type.Literal("multiply"),
    Type.Literal("divide"),
  ]),
  data: Type.Array(Type.Number({ minimum: 1, maximum: 10 }), {
    minItems: 2,
    maxItems: 5,
  }),
});

const response = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export default (useCase: IJobs): FastifyPluginAsyncTypebox =>
  async (fastify) => {
    fastify.post(
      "/",
      {
        schema: {
          tags: ["jobs"],
          body,
          response: {
            "2xx": response,
          },
        },
      },
      async (req, res) => {
        const id = await useCase.enqueue(req.body);
        return res.status(201).send({ id });
      }
    );
  };
