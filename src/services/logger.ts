import { default as pino } from "pino";

export { Logger } from "pino";
export type Config = {
  level: string;
  version: string;
};

export const init = (config: Config) =>
  pino({
    level: config.level,
  }).child({
    version: config.version,
  });
