import cors from "cors";
import express from "express";
import { getDB, initDB } from "./db.js";

// 1. CONFIGURATION
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // C'est ici qu'on gère les CORS, et ça suffit !
initDB(); // lancement de la database

//2. HELPER (DATABASE)

async function getTodos() {
  const db = await getDB();
  const data = await db.all("SELECT * FROM todos");
  return data;
}

async function createTodo(text, completed = false) {
  const db = await getDB();
  const result = await db.run(
    "INSERT INTO todos (text, completed) VALUES (?, ?)",
    [text, completed ? 1 : 0]
  );
  return result.lastID; // Returns the new todo's ID
}
async function updateTodo(id, text, completed) {
  const db = await getDB();
  await db.run("UPDATE todos SET text = ?, completed = ? WHERE id = ?", [
    text,
    completed ? 1 : 0,
    id,
  ]);
}

async function deleteTodo(id) {
  const db = await getDB();
  await db.run("DELETE FROM todos WHERE id = ?", [id]);
}
// 3. ROUTES JSON

// GET (Lire tout)
app.get("/todos", async (req, res) => {
  const todos = await getTodos();
  res.json(todos);
});

// GET ONE (Lire un seul)
app.get("/todos/:id", async (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const todos = await getTodos();
  const todo = todos.find((t) => t.id === todoId);
  if (!todo) return res.status(404).json({ error: "Not found" });
  res.json(todo);
});

// POST (Créer)
app.post("/todos", async (req, res) => {
  const { text } = req.body; // On attend bien 'text'
  if (!text) return res.status(400).json({ error: "Text required" });

  const newID = await createTodo(text, false);
  const newTodo = { id: newID, text, completed: false };
  res.status(201).json(newTodo);
});

// PATCH (Modifier)
app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  const todos = await getTodos();
  const todo = todos.find((t) => t.id === parseInt(id));
  if (!todo) return res.status(404).json({ error: "not found" });

  const newText = text !== undefined ? text : todo.text;
  const newCompleted = completed !== undefined ? completed : todo.completed;

  await updateTodo(parseInt(id), newText, newCompleted);
  res.json({ success: true });
});

// DELETE (Supprimer)
app.delete("/todos/:id", async (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  await deleteTodo(todoId);
  res.json({ success: true });
});

// LANCEMENT
app.listen(port, () => {
  console.log(`✅ SERVER OK: http://localhost:${port}`);
});
