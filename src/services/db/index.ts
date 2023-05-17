import {
  ColumnType,
  FileMigrationProvider,
  Generated,
  Kysely,
  Migrator,
  PostgresDialect,
} from "kysely";
import { DatabaseError, Pool } from "pg";
import * as path from "node:path";
import * as fs from "node:fs/promises";

import { Todo, ITodosService } from "src/domain/todo";
import { ConflictError, NotFoundError } from "src/domain/errors";
import { Logger } from "../logger";

type Database = {
  todos: DBTodo;
};

type DBTodo = Todo & {
  id: Generated<string>;
  created_at: ColumnType<Date, undefined, undefined>;
};

export type Config = {
  connectionString: string;
  timeout: number;
};

export class KyselyDB implements ITodosService {
  private readonly db: Kysely<Database>;
  private readonly migrator: Migrator;

  constructor(config: Config, private readonly logger: Logger) {
    const pool = new Pool({
      connectionString: config.connectionString,
      connectionTimeoutMillis: config.timeout,
    });
    pool.on("error", (err) => this.logger.error(err));

    this.db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool,
      }),
    });

    this.migrator = new Migrator({
      db: this.db,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: `${__dirname}/migrations`,
      }),
    });
  }

  async migrate() {
    const { error, results } = await this.migrator.migrateToLatest();
    results?.forEach((result) => {
      const msg = `migration: ${result.migrationName} ${result.direction} ${result.status}`;
      result.status == "Error"
        ? this.logger.error(result, msg)
        : this.logger.info(result, msg);
    });
    if (error) {
      this.logger.fatal(error, "Failed to apply migrations");
      throw error;
    }
  }

  async getAll(limit: number, offset: number) {
    return await this.db
      .selectFrom("todos")
      .selectAll()
      .orderBy("created_at", "desc")
      .offset(offset)
      .limit(limit)
      .execute();
  }

  async getById(id: Todo["id"]) {
    return await this.db
      .selectFrom("todos")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow(() => new NotFoundError("todo", id));
  }

  async create(todo: Omit<Todo, "id" | "created_at">) {
    try {
      return await this.db
        .insertInto("todos")
        .values(todo)
        .returningAll()
        .executeTakeFirstOrThrow();
    } catch (err) {
      if (err instanceof DatabaseError && err.code == "23505") {
        throw new ConflictError("todo");
      }
      throw err;
    }
  }

  async update(todo: Omit<Todo, "created_at">) {
    const { id, ...todoRest } = todo;
    return await this.db
      .updateTable("todos")
      .set(todoRest)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new NotFoundError("todo", id));
  }

  async delete(id: Todo["id"]) {
    return await this.db
      .deleteFrom("todos")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow(() => new NotFoundError("todo", id));
  }
}
