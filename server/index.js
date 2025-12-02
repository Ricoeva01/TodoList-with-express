import cors from "cors";
import express from "express";
import fs from "fs/promises";

// 1. CONFIGURATION
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // C'est ici qu'on gère les CORS, et ça suffit !

// 2. HELPER (DATABASE)
async function getTodos() {
  try {
    const data = await fs.readFile("todos.json", "utf-8");
    if (!data.trim()) return []; // Fichier vide = tableau vide
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") return []; // Fichier existe pas encore
    console.error("Erreur lecture DB:", error);
    return []; // En cas de pépin, on renvoie [] pour ne pas crasher
  }
}

async function saveTodos(todosArray) {
  try {
    await fs.writeFile("todos.json", JSON.stringify(todosArray, null, 2));
  } catch (error) {
    console.error("Erreur écriture DB:", error);
  }
}

// 3. ROUTES

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

  const todos = await getTodos();
  const newTodo = { id: Date.now(), text, completed: false };

  await saveTodos([...todos, newTodo]);
  res.status(201).json(newTodo);
});

// PATCH (Modifier)
app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  const todos = await getTodos();
  let found = false;

  const newTodos = todos.map((todo) => {
    if (todo.id === parseInt(id)) {
      found = true;
      return {
        ...todo,
        // On met à jour seulement si on reçoit une nouvelle valeur
        text: text !== undefined ? text : todo.text,
        completed: completed !== undefined ? completed : todo.completed,
      };
    }
    return todo;
  });

  if (!found) return res.status(404).json({ error: "Not found" });

  await saveTodos(newTodos);
  res.json({ success: true });
});

// DELETE (Supprimer)
app.delete("/todos/:id", async (req, res) => {
  const todoId = parseInt(req.params.id, 10);
  const todos = await getTodos();
  const newTodos = todos.filter((todo) => todo.id !== todoId);

  await saveTodos(newTodos);
  res.json({ success: true });
});

// LANCEMENT
app.listen(port, () => {
  console.log(`✅ SERVER OK: http://localhost:${port}`);
});
