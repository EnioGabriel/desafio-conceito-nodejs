const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  // Percorrendo Array de usuários e armazenando o usuário em uma const
  const user = users.find((user) => {
    return user.username === username;
  });

  // Se o username não for encontrado
  if (!user) {
    return response.status(404).json({ error: "Usuário não encontrado" });
  }

  // Valor que pode ser exportado para fora do middleware
  request.user = user;

  return next();
}

// Cadastro do usuário
app.post("/users", (request, response) => {
  const { name, username } = request.body;

  // Varrendo array e verificando se contem username repetido
  // some => retorna verdadeiro ou falso dependendo da condiçao passada para ele
  const usernameAlreadyExist = users.some((user) => {
    return user.username === username;
  });

  // Retornando erro caso o username já esteja cadastrado
  if (usernameAlreadyExist) {
    return response
      .status(400)
      .json({ error: "esse username já está em uso!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

// Lista TODOS do usuário
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  // Retorna lista completa com os todos
  return response.status(201).json(user.todos);
});

// Cria lista de TODOS
app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  // Retorna apenas o TODO criado
  return response.status(201).json(todo);
});

// Atualiza title e deadline do TODO
app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  // Recebendo dados do body da requisição
  const { title, deadline } = request.body;

  // recebendo id via parametro na URL
  const { id } = request.params;

  const todo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todo) {
    return response.status(404).json({ error: "Todo não encontrado" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

// Altera o valor de done do TODO
app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  // recebendo id via parametro na URL
  const { id } = request.params;

  const todo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todo) {
    return response.status(404).json({ error: "Todo não encontrado" });
  }

  todo.done = true;

  return response.json(todo);
});

// Deleta TODO
app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  // recebendo id via parametro na URL
  const { id } = request.params;

  // Localiza a posição do elemento no array
  const todoIndex = user.todos.findIndex((todo) => {
    return todo.id === id;
  });

  // Se retornar -1, não encontrou o elemento
  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo não encontrado" });
  }

  // Excluindo todo selecionado
  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
