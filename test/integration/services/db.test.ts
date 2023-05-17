import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { logger } from "test/mocks";
import { dbConfig } from "test/integration/mocks";

import { randomUUID } from "node:crypto";

import { KyselyDB } from "src/services/db";
import { Todo } from "src/domain/todo";
import { ConflictError, NotFoundError } from "src/domain/errors";

const db = new KyselyDB(dbConfig, logger);

describe("Kysely db service", () => {
  beforeAll(async () => {
    await db.migrate();
  });

  beforeEach(async () => {
    await db["db"].deleteFrom("todos").execute();
  });

  test("create -> getById -> update ->  getById -> delete", async () => {
    const todo: Omit<Todo, "id" | "created_at"> = {
      title: "title",
      description: "description",
      completed: false,
    };

    const createResult = await db.create(todo);
    expect(createResult).toContain(todo);

    let getResult = await db.getById(createResult.id);
    expect(getResult).toEqual(createResult);

    const updateResult = await db.update({
      ...getResult,
      title: "updated" + todo.title,
      description: "updated" + todo.description,
      completed: !todo.completed,
    });
    expect(updateResult).toEqual({
      ...getResult,
      title: "updated" + todo.title,
      description: "updated" + todo.description,
      completed: !todo.completed,
    });

    getResult = await db.getById(createResult.id);
    expect(getResult).toEqual(updateResult);

    const deleteResult = await db.delete(getResult.id);
    expect(deleteResult).toEqual(getResult);
  });

  test("create with same id -> ConfictError", async () => {
    const todo: Omit<Todo, "created_at"> = {
      id: randomUUID(),
      title: "title",
      description: "description",
      completed: false,
    };

    await db.create(todo);
    await expect(db.create(todo)).rejects.toThrowError(ConflictError);
  });

  test("get non existent -> NotFoundError", async () => {
    await expect(db.getById(randomUUID())).rejects.toThrowError(NotFoundError);
  });

  test("update non existent -> NotFoundError", async () => {
    await expect(
      db.update({
        id: randomUUID(),
        title: "title",
        description: "description",
        completed: false,
      })
    ).rejects.toThrowError(NotFoundError);
  });

  test("delete non existent -> NotFoundError", async () => {
    await expect(db.delete(randomUUID())).rejects.toThrowError(NotFoundError);
  });

  test("create many -> getAll", async () => {
    const todo1: Omit<Todo, "id" | "created_at"> = {
      title: "title1",
      description: "description1",
      completed: false,
    };

    const todo2: Omit<Todo, "id" | "created_at"> = {
      title: "title2",
      description: "description2",
      completed: false,
    };

    const todo3: Omit<Todo, "id" | "created_at"> = {
      title: "title3",
      description: "description3",
      completed: true,
    };

    await db.create(todo1);
    await db.create(todo2);
    await db.create(todo3);

    let result = await db.getAll(3, 0);
    expect(result).toHaveLength(3);
    expect(result[0]).toContain(todo3);
    expect(result[1]).toContain(todo2);
    expect(result[2]).toContain(todo1);

    result = await db.getAll(1, 0);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain(todo3);

    result = await db.getAll(2, 1);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain(todo2);
    expect(result[1]).toContain(todo1);

    result = await db.getAll(1, 3);
    expect(result).toHaveLength(0);
  });
});
