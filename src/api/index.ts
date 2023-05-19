import { default as fastify, FastifyInstance } from "fastify";
import swaggerUi from "@fastify/swagger-ui";
import swagger from "@fastify/swagger";

import { errorHandler } from "./utils/error";
import apiRoutes from "./routes";

import { Logger } from "src/services/logger";
import { ITodos } from "src/useCases/todos";
import { IAuth } from "src/useCases/auth";
import { ISettings } from "src/useCases/settings";
import { IJobs } from "src/useCases/jobs";

export type Config = {
  port: number;
  openapi: boolean;
};

export type UseCases = {
  auth: IAuth;
  jobs: IJobs;
  settings: ISettings;
  todos: ITodos;
};

export class FastifyApi {
  private readonly server: FastifyInstance;

  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    useCases: UseCases
  ) {
    this.server = fastify({
      logger: logger,
      ignoreTrailingSlash: true,
      exposeHeadRoutes: false,
    });

    this.server.setErrorHandler(errorHandler);

    if (config.openapi) {
      this.server.register(swagger);
      this.server.register(swaggerUi);
    }

    this.server.get("/health", () => "OK");
    this.server.register(apiRoutes(useCases));
  }

  async close() {
    return await this.server.close();
  }

  async serve() {
    await this.server.listen({
      port: this.config.port,
      host: "::",
    });

    if (this.config.openapi)
      this.logger.info(
        `SwaggerUI hosted at http://[::]:${this.config.port}/documentation`
      );
  }
}
