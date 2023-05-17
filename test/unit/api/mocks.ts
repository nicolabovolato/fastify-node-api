import { Config, UseCases } from "src/api";

import {
  logger,
  authUseCase,
  jobsUseCase,
  settingsUseCase,
  todosUseCase,
} from "test/mocks";

export const mockUseCases = (): UseCases => ({
  todos: todosUseCase(),
  auth: authUseCase(),
  settings: settingsUseCase(),
  jobs: jobsUseCase(),
});

export const config: Config = {
  openapi: false,
  port: 0,
};

export const getFastifyInstance = async (
  conf = config,
  useCases = mockUseCases()
) => new (await import("src/api")).FastifyApi(conf, logger, useCases)["server"];
