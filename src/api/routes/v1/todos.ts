import {
  Type,
  FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";

import { ITodos } from "src/useCases/todos";

const id = Type.String({ format: "uuid" });
const todo = Type.Object({
  id,
  title: Type.String({ maxLength: 256 }),
  description: Type.String(),
  completed: Type.Boolean(),
});
const todos = Type.Array(todo);
const todoWithoutId = Type.Omit(todo, ["id"]);

const querystring = Type.Object({
  limit: Type.Number({ minimum: 10, maximum: 100 }),
  offset: Type.Number({ minimum: 0 }),
});
const params = Type.Object({ id });

export default (useCase: ITodos): FastifyPluginAsyncTypebox =>
  async (fastify) => {
    fastify.get(
      "/",
      {
        schema: {
          tags: ["todos"],
          querystring,
          response: { "2xx": todos },
        },
      },
      async (req, _res) => {
        return await useCase.getAll(req.query.limit, req.query.offset);
      }
    );

    fastify.get(
      "/:id",
      {
        schema: {
          tags: ["todos"],
          params,
          response: { "2xx": todo },
        },
      },
      async (req, _res) => {
        return await useCase.getById(req.params.id);
      }
    );

    fastify.post(
      "/",
      {
        schema: {
          tags: ["todos"],
          body: todoWithoutId,
          response: { "2xx": todo },
        },
      },
      async (req, res) => {
        const todo = await useCase.create(req.body);
        return res.status(201).send(todo);
      }
    );

    fastify.put(
      "/:id",
      {
        schema: {
          tags: ["todos"],
          params,
          body: todoWithoutId,
          response: { "2xx": todo },
        },
      },
      async (req, _res) => {
        return await useCase.update({ id: req.params.id, ...req.body });
      }
    );

    fastify.delete(
      "/:id",
      {
        schema: {
          tags: ["todos"],
          params,
          response: { "2xx": todo },
        },
      },
      async (req, _res) => {
        return await useCase.delete(req.params.id);
      }
    );
  };
