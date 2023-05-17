import {
  Type,
  FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";

import { ISettings } from "src/useCases/settings";

const value = Type.Union([
  Type.String({ minLength: 1, maxLength: 256 }),
  Type.Null(),
]);

const params = Type.Object({
  key: Type.String({ minLength: 4, maxLength: 64 }),
});

const body = Type.Object({
  value,
});

const response = body;

export default (useCase: ISettings): FastifyPluginAsyncTypebox =>
  async (fastify) => {
    fastify.get(
      "/:key",
      {
        schema: {
          tags: ["settings"],
          params,
          response: {
            "2xx": response,
          },
        },
      },
      async (req, _res) => {
        const value = await useCase.get(req.params.key);
        return { value };
      }
    );

    fastify.put(
      "/:key",
      {
        schema: {
          tags: ["settings"],
          params,
          body,
          response: {
            "2xx": response,
          },
        },
      },
      async (req, _res) => {
        const value = await useCase.set(req.params.key, req.body.value);
        return { value };
      }
    );
  };
