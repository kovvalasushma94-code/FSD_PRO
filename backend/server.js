const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "tasks.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function dateOffset(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const sampleTasks = [
  {
    id: "1",
    title: "Morning 7:30 ki bus ekkali 🚌",
    date: dateOffset(),
    time: "07:30",
    priority: "High",
    completed: false
  },
  {
    id: "2",
    title: "Alarm snooze cheyyakunda levali 😂",
    date: dateOffset(),
    time: "07:00",
    priority: "High",
    completed: false
  },
  {
    id: "3",
    title: "Assignment complete cheyyali 📚",
    date: dateOffset(),
    time: "17:00",
    priority: "High",
    completed: false
  },
  {
    id: "4",
    title: "5 minutes reels ani 1 hour cheyyakudadhu 📱",
    date: dateOffset(),
    time: "20:00",
    priority: "Medium",
    completed: true
  },
  {
    id: "5",
    title: "Repu college bag ready chesukovali 🎒",
    date: dateOffset(1),
    time: "21:00",
    priority: "Medium",
    completed: false
  }
];

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify(sampleTasks, null, 2), "utf8");
}

function readTasks() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function saveTasks(tasks) {
  fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2), "utf8");
}

app.get("/", (_req, res) => {
  res.json({ message: "To-Do List API is running!" });
});

app.get("/api/tasks", (_req, res) => {
  try {
    res.json(readTasks());
  } catch (error) {
    res.status(500).json({ message: "Could not read tasks", error: error.message });
  }
});

app.post("/api/tasks", (req, res) => {
  try {
    const { title, date = "", time = "", priority = "Medium" } = req.body;
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }
    if (!["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({ message: "Choose a valid priority" });
    }

    const tasks = readTasks();
    const task = {
      id: Date.now().toString(),
      title: title.trim(),
      date,
      time,
      priority,
      completed: false
    };
    tasks.unshift(task);
    saveTasks(tasks);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Could not add task", error: error.message });
  }
});

app.put("/api/tasks/:id", (req, res) => {
  try {
    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Task not found" });

    const { title, date = "", time = "", priority = "Medium" } = req.body;
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }
    if (!["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({ message: "Choose a valid priority" });
    }

    tasks[index] = { ...tasks[index], title: title.trim(), date, time, priority };
    saveTasks(tasks);
    res.json(tasks[index]);
  } catch (error) {
    res.status(500).json({ message: "Could not update task", error: error.message });
  }
});

app.patch("/api/tasks/:id/complete", (req, res) => {
  try {
    const tasks = readTasks();
    const task = tasks.find((item) => item.id === req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (typeof req.body.completed !== "boolean") {
      return res.status(400).json({ message: "completed must be true or false" });
    }

    task.completed = req.body.completed;
    saveTasks(tasks);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Could not update task", error: error.message });
  }
});

app.delete("/api/tasks/:id", (req, res) => {
  try {
    const tasks = readTasks();
    const remaining = tasks.filter((task) => task.id !== req.params.id);
    if (remaining.length === tasks.length) {
      return res.status(404).json({ message: "Task not found" });
    }
    saveTasks(remaining);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete task", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`To-Do List backend running on port ${PORT}`);
});
