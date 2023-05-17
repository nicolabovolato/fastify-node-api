import { vi } from "vitest";

import { pino } from "pino";

import { ITodos } from "src/useCases/todos";
import { IAuth } from "src/useCases/auth";
import { IJobs } from "src/useCases/jobs";
import { ISettings } from "src/useCases/settings";

export const logger = pino({ level: "silent" });

export const todosUseCase = (): ITodos => ({
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

export const authUseCase = (): IAuth => ({
  generateToken: vi.fn(),
  validateToken: vi.fn(),
});

export const jobsUseCase = (): IJobs => ({
  enqueue: vi.fn(),
});

export const settingsUseCase = (): ISettings => ({
  get: vi.fn(),
  set: vi.fn(),
});
