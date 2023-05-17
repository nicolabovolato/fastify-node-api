import closeWithGrace from "close-with-grace";

import config from "./config";

import { init, Logger } from "./services/logger";
import { KyselyDB } from "./services/db";
import { RedisCache } from "./services/cache";
import { PasetoAuth } from "./services/auth";
import { BullQueue } from "./services/queue";

import { Todos } from "./useCases/todos";
import { Auth } from "./useCases/auth";
import { Settings } from "./useCases/settings";
import { Jobs } from "./useCases/jobs";

import { FastifyApi } from "./api/index";

(async () => {
  const logger: Logger = init(config.services.logger);

  const todoService = new KyselyDB(
    config.services.db,
    logger.child({ module: "db" })
  );
  await todoService.migrate();

  const cacheService = new RedisCache(
    config.services.cache,
    logger.child({ module: "cache" })
  );
  const queueService = new BullQueue(
    config.services.queue,
    logger.child({ module: "queue" })
  );

  const authService = new PasetoAuth(config.services.auth);

  const api = new FastifyApi(config.api, logger.child({ module: "api" }), {
    todos: new Todos(todoService),
    auth: new Auth(config.useCases.auth, authService),
    settings: new Settings(cacheService),
    jobs: new Jobs(logger.child({ module: "jobs" }), queueService),
  });
  await api.serve();

  closeWithGrace(
    { delay: config.gracefulShutdownTimeoutMs },
    async ({ signal, err }) => {
      if (err) logger.fatal(err);
      else logger.info(`${signal} received, stopping server...`);
      await api.close();
    }
  );
})();
