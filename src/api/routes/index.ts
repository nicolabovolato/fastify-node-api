import { FastifyPluginAsync } from "fastify";

import { UseCases } from "..";

import apiV1 from "./v1";

export default (useCases: UseCases): FastifyPluginAsync =>
  async (fastify) => {
    fastify.register(apiV1(useCases), { prefix: "/v1" });
  };
