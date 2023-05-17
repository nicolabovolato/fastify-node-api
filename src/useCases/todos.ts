import { Todo, ITodosService } from "src/domain/todo";

export type ITodos = {
  getAll: (limit: number, offset: number) => Promise<Todo[]>;
  getById: (id: Todo["id"]) => Promise<Todo>;
  create: (todo: Omit<Todo, "id" | "created_at">) => Promise<Todo>;
  update: (todo: Omit<Todo, "created_at">) => Promise<Todo>;
  delete: (id: Todo["id"]) => Promise<Todo>;
};

export class Todos implements ITodos {
  constructor(private readonly service: ITodosService) {}

  async getAll(limit: number, offset: number) {
    return await this.service.getAll(limit, offset);
  }

  async getById(id: Todo["id"]) {
    return await this.service.getById(id);
  }

  async create(todo: Omit<Todo, "id" | "created_at">) {
    return await this.service.create(todo);
  }

  async update(todo: Omit<Todo, "created_at">) {
    return await this.service.update(todo);
  }

  async delete(id: Todo["id"]) {
    return await this.service.delete(id);
  }
}
