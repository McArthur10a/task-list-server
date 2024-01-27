const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const taskRouter = express.Router();

const port = 8080;

const tasks = [
  { id: 1, title: "Hacer la compra", completed: false },
  { id: 2, title: "Terminar proyecto", completed: true },
];

// Middleware para validar el token en las rutas protegidas
function authenticateToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ error: "Acceso no autorizado. Token no proporcionado." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Acceso prohibido. Token inválido." });
    }

    req.user = user;
    next();
  });
}

// Rutas CRUD para la lista de tareas
taskRouter.post("/", authenticateToken, (req, res) => {
  // Crear una nueva tarea
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    completed: false,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

taskRouter.get("/", authenticateToken, (req, res) => {
  // Listar todas las tareas
  res.json(tasks);
});

taskRouter.get("/completed", authenticateToken, (req, res) => {
  // Listar las tareas completas
  const completedTasks = tasks.filter((task) => task.completed);
  res.json(completedTasks);
});

taskRouter.get("/incomplete", authenticateToken, (req, res) => {
  // Listar las tareas incompletas
  const incompleteTasks = tasks.filter((task) => !task.completed);
  res.json(incompleteTasks);
});

taskRouter.get("/:id", authenticateToken, (req, res) => {
  // Obtener una sola tarea por ID
  const taskId = parseInt(req.params.id);
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return res.status(404).json({ error: "Tarea no encontrada." });
  }

  res.json(task);
});

taskRouter.put("/:id", authenticateToken, (req, res) => {
  // Actualizar una tarea por ID
  const taskId = parseInt(req.params.id);
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return res.status(404).json({ error: "Tarea no encontrada." });
  }

  task.title = req.body.title || task.title;
  task.completed = req.body.completed || task.completed;

  res.json(task);
});

taskRouter.delete("/:id", authenticateToken, (req, res) => {
  // Eliminar una tarea por ID
  const taskId = parseInt(req.params.id);
  const index = tasks.findIndex((task) => task.id === taskId);

  if (index === -1) {
    return res.status(404).json({ error: "Tarea no encontrada." });
  }

  const deletedTask = tasks.splice(index, 1)[0];
  res.json(deletedTask);
});

app.use("/tasks", taskRouter);

app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
