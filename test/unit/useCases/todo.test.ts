import { beforeEach, describe, expect, test, vi } from "vitest";

import { Todo, ITodosService } from "src/domain/todo";
import { Todos } from "src/useCases/todos";

const service = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} satisfies ITodosService;

describe("Todos use case", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAll()", () => {
    test("works", async () => {
      const todos: Todo[] = [
        {
          id: "id",
          completed: true,
          created_at: new Date(),
          description: "description",
          title: "title",
        },
      ];
      service.getAll.mockResolvedValueOnce(todos);

      const result = await new Todos(service).getAll(10, 20);

      expect(result).toEqual(todos);
      expect(service.getAll).toHaveBeenCalledOnce();
      expect(service.getAll).toHaveBeenCalledWith(10, 20);
    });
  });

  describe("getById()", () => {
    test("works", async () => {
      const todo: Todo = {
        id: "id",
        completed: true,
        created_at: new Date(),
        description: "description",
        title: "title",
      };
      service.getById.mockResolvedValueOnce(todo);

      const result = await new Todos(service).getById("id");

      expect(result).toEqual(todo);
      expect(service.getById).toHaveBeenCalledOnce();
      expect(service.getById).toHaveBeenCalledWith("id");
    });
  });

  describe("create()", () => {
    test("works", async () => {
      const inTodo: Omit<Todo, "id" | "created_at"> = {
        completed: true,
        description: "description",
        title: "title",
      };
      const outTodo: Todo = { ...inTodo, id: "id", created_at: new Date() };
      service.create.mockResolvedValueOnce(outTodo);

      const result = await new Todos(service).create(inTodo);

      expect(result).toEqual(outTodo);
      expect(service.create).toHaveBeenCalledOnce();
      expect(service.create).toHaveBeenCalledWith(inTodo);
    });
  });

  describe("update()", () => {
    test("works", async () => {
      const inTodo: Omit<Todo, "created_at"> = {
        id: "id",
        completed: true,
        description: "description",
        title: "title",
      };
      const outTodo: Todo = { ...inTodo, created_at: new Date() };
      service.update.mockResolvedValueOnce(outTodo);

      const result = await new Todos(service).update(inTodo);

      expect(result).toEqual(outTodo);
      expect(service.update).toHaveBeenCalledOnce();
      expect(service.update).toHaveBeenCalledWith(inTodo);
    });
  });

  describe("delete()", () => {
    test("works", async () => {
      const todo: Todo = {
        id: "id",
        completed: true,
        description: "description",
        title: "title",
        created_at: new Date(),
      };
      service.delete.mockResolvedValueOnce(todo);

      const result = await new Todos(service).delete(todo.id);

      expect(result).toEqual(todo);
      expect(service.delete).toHaveBeenCalledOnce();
      expect(service.delete).toHaveBeenCalledWith(todo.id);
    });
  });
});
