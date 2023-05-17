export type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: Date;
};

export type ITodosService = {
  getAll: (limit: number, offset: number) => Promise<Todo[]>;
  getById: (id: Todo["id"]) => Promise<Todo>;
  create: (todo: Omit<Todo, "id" | "created_at">) => Promise<Todo>;
  update: (todo: Omit<Todo, "created_at">) => Promise<Todo>;
  delete: (id: Todo["id"]) => Promise<Todo>;
};
