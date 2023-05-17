import { beforeEach, describe, expect, test, vi } from "vitest";

import { config, getFastifyInstance, mockUseCases } from "../../mocks";

import { randomUUID } from "node:crypto";

import { NotFoundError, ConflictError } from "src/domain/errors";
import { Todo } from "src/domain/todo";

const useCases = mockUseCases();

const domainTodo: Todo = {
  id: randomUUID(),
  completed: false,
  created_at: new Date(),
  description: "description",
  title: "title",
};
const { id: _id, created_at: _created_at, ...apiRequestTodo } = domainTodo;
const { created_at: __created_at, ...apiResponseTodo } = domainTodo;

describe("/v1/todos api routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /v1/todos", () => {
    test("200", async () => {
      vi.mocked(useCases.todos.getAll).mockResolvedValueOnce([domainTodo]);
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().get("/v1/todos").query({
        limit: "10",
        offset: "50",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([apiResponseTodo]);
      expect(useCases.todos.getAll).toHaveBeenCalledOnce();
      expect(useCases.todos.getAll).toHaveBeenCalledWith(10, 50);
    });
  });

  describe("GET /v1/todos/:id", () => {
    test("200", async () => {
      vi.mocked(useCases.todos.getById).mockResolvedValueOnce(domainTodo);
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().get(`/v1/todos/${domainTodo.id}`);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(apiResponseTodo);
      expect(useCases.todos.getById).toHaveBeenCalledOnce();
      expect(useCases.todos.getById).toHaveBeenCalledWith(domainTodo.id);
    });

    test("404", async () => {
      vi.mocked(useCases.todos.getById).mockRejectedValueOnce(
        new NotFoundError("todo", domainTodo.id)
      );
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().get(`/v1/todos/${domainTodo.id}`);

      expect(response.statusCode).toBe(404);
      expect(useCases.todos.getById).toHaveBeenCalledOnce();
      expect(useCases.todos.getById).toHaveBeenCalledWith(domainTodo.id);
    });
  });

  describe("POST /v1/todos", () => {
    test("201", async () => {
      vi.mocked(useCases.todos.create).mockResolvedValueOnce(domainTodo);
      const api = await getFastifyInstance(config, useCases);

      const response = await api
        .inject()
        .post("/v1/todos")
        .payload(apiRequestTodo);

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(apiResponseTodo);
      expect(useCases.todos.create).toHaveBeenCalledOnce();
      expect(useCases.todos.create).toHaveBeenCalledWith(apiRequestTodo);
    });

    test("409", async () => {
      vi.mocked(useCases.todos.create).mockRejectedValueOnce(
        new ConflictError("todo")
      );
      const api = await getFastifyInstance(config, useCases);

      const response = await api
        .inject()
        .post("/v1/todos")
        .payload(apiRequestTodo);

      expect(response.statusCode).toBe(409);
      expect(useCases.todos.create).toHaveBeenCalledOnce();
      expect(useCases.todos.create).toHaveBeenCalledWith(apiRequestTodo);
    });
  });

  describe("PUT /v1/todos/:id", () => {
    test("200", async () => {
      vi.mocked(useCases.todos.update).mockResolvedValueOnce(domainTodo);
      const api = await getFastifyInstance(config, useCases);

      const response = await api
        .inject()
        .put(`/v1/todos/${domainTodo.id}`)
        .payload(apiRequestTodo);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(apiResponseTodo);
      expect(useCases.todos.update).toHaveBeenCalledOnce();
      expect(useCases.todos.update).toHaveBeenCalledWith({
        id: domainTodo.id,
        ...apiRequestTodo,
      });
    });

    test("404", async () => {
      vi.mocked(useCases.todos.update).mockRejectedValueOnce(
        new NotFoundError("todo", domainTodo.id)
      );
      const api = await getFastifyInstance(config, useCases);

      const response = await api
        .inject()
        .put(`/v1/todos/${domainTodo.id}`)
        .payload(apiRequestTodo);

      expect(response.statusCode).toBe(404);
      expect(useCases.todos.update).toHaveBeenCalledOnce();
      expect(useCases.todos.update).toHaveBeenCalledWith({
        id: domainTodo.id,
        ...apiRequestTodo,
      });
    });
  });

  describe("DELETE /v1/todos/:id", () => {
    test("200", async () => {
      vi.mocked(useCases.todos.delete).mockResolvedValueOnce(domainTodo);
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().delete(`/v1/todos/${domainTodo.id}`);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(apiResponseTodo);
      expect(useCases.todos.delete).toHaveBeenCalledOnce();
      expect(useCases.todos.delete).toHaveBeenCalledWith(domainTodo.id);
    });

    test("404", async () => {
      vi.mocked(useCases.todos.delete).mockRejectedValueOnce(
        new NotFoundError("todo", domainTodo.id)
      );
      const api = await getFastifyInstance(config, useCases);

      const response = await api.inject().delete(`/v1/todos/${domainTodo.id}`);

      expect(response.statusCode).toBe(404);
      expect(useCases.todos.delete).toHaveBeenCalledOnce();
      expect(useCases.todos.delete).toHaveBeenCalledWith(domainTodo.id);
    });
  });
});
