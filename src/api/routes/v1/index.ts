import { FastifyPluginAsync } from "fastify";

import { UseCases } from "src/api";

import auth from "./auth";
import jobs from "./jobs";
import settings from "./settings";
import todos from "./todos";

export default (useCases: UseCases): FastifyPluginAsync =>
  async (fastify) => {
    fastify.register(auth(useCases.auth), { prefix: "/auth" });
    fastify.register(jobs(useCases.jobs), { prefix: "/jobs" });
    fastify.register(settings(useCases.settings), {
      prefix: "/settings",
    });
    fastify.register(todos(useCases.todos), { prefix: "/todos" });
  };
