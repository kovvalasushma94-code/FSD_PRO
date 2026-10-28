import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/tasks";
const emptyForm = { title: "", date: "", time: "", priority: "Medium" };

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadTasks() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load tasks");
      setTasks(await response.json());
      setError("");
    } catch {
      setError("Backend not connected. Start the backend server in a second terminal.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function changeForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submitTask(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not save task");

      setForm({ ...emptyForm });
      setEditingId(null);
      await loadTasks();
      setNotice(result.title ? (editingId ? "Task updated! ✅" : "Task added! 🎉") : "Saved!");
    } catch (err) {
      setError(err.message || "Could not save task");
    } finally {
      setSaving(false);
    }
  }

  function editTask(task) {
    setEditingId(task.id);
    setForm({ title: task.title, date: task.date || "", time: task.time || "", priority: task.priority || "Medium" });
    setError("");
    setNotice("");
    document.getElementById("task-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`${API}/${task.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!response.ok) throw new Error("Could not update task");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not delete task");
      if (editingId === id) {
        setEditingId(null);
        setForm({ ...emptyForm });
      }
      await loadTasks();
      setNotice("Task deleted.");
    } catch (err) {
      setError(err.message);
    }
  }

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const filteredTasks = tasks.filter((task) => {
    const matchFilter = filter === "All" || (filter === "Pending" && !task.completed) || (filter === "Completed" && task.completed);
    return matchFilter && task.title.toLowerCase().includes(search.toLowerCase());
  });

  function showDate(date) {
    if (!date) return "No due date";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#top" className="logo"><span className="logo-icon">✓</span> Taskly</a>
        <p className="side-label">MENU</p>
        {["All", "Pending", "Completed"].map((item) => (
          <button key={item} className={`side-link ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>
            <span>{item === "All" ? "▦" : item === "Pending" ? "◷" : "✓"}</span>
            {item === "All" ? "All Tasks" : `${item} Tasks`}
            {item === "All" && <b>{tasks.length}</b>}
          </button>
        ))}
        <div className="side-note"><span>💡</span><p>Small steps every day lead to big results.</p></div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar"><span>MY PERSONAL PLANNER</span><span className="profile">😊</span></header>
        <section className="welcome">
          <div><p className="today-label">YOUR DAY, YOUR WAY ✨</p><h1>My To-Do List</h1><p className="subtitle">Get things done, one task at a time.</p></div>
          <div className="welcome-art">📝</div>
        </section>

        {error && <div className="message error">{error}</div>}
        {notice && <div className="message success">{notice}</div>}

        <section className="stats">
          <div className="stat"><span className="stat-icon green-icon">▦</span><p>Total Tasks</p><strong>{tasks.length}</strong></div>
          <div className="stat"><span className="stat-icon orange-icon">◷</span><p>Pending</p><strong>{pending}</strong></div>
          <div className="stat"><span className="stat-icon blue-icon">✓</span><p>Completed</p><strong>{completed}</strong></div>
        </section>

        <section className="workspace">
          <div className="panel add-panel" id="task-form">
            <div className="panel-title"><div><h2>{editingId ? "Edit Task" : "Add a New Task"}</h2><p>Write it down. Get it done.</p></div><span>✏️</span></div>
            <form onSubmit={submitTask}>
              <label htmlFor="title">Task name</label>
              <input id="title" name="title" value={form.title} onChange={changeForm} placeholder="e.g. Morning 7:30 ki bus ekkali 🚌" required maxLength={150} />
              <div className="form-row">
                <div><label htmlFor="date">Due date</label><input id="date" name="date" type="date" value={form.date} onChange={changeForm} /></div>
                <div><label htmlFor="time">Time</label><input id="time" name="time" type="time" value={form.time} onChange={changeForm} /></div>
              </div>
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={form.priority} onChange={changeForm}><option>Low</option><option>Medium</option><option>High</option></select>
              <button className="add-button" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Task" : "+ Add Task"}</button>
              {editingId && <button type="button" className="cancel-button" onClick={() => { setEditingId(null); setForm({ ...emptyForm }); }}>Cancel Edit</button>}
            </form>
          </div>

          <section className="panel tasks-panel">
            <div className="panel-title task-heading"><div><h2>Your Tasks</h2><p>{pending} tasks left. You've got this! 💪</p></div><span className="task-number">{filteredTasks.length}</span></div>
            <input className="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="🔍 Search tasks..." />
            <div className="filters">{["All", "Pending", "Completed"].map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
            {loading ? <p className="empty">Loading your tasks...</p> : filteredTasks.length === 0 ? <div className="empty"><span>🌱</span><p>No tasks here. Add one and get started!</p></div> : (
              <div className="task-list">{filteredTasks.map((task) => (
                <article className={`task-card ${task.completed ? "is-done" : ""}`} key={task.id}>
                  <input className="task-check" type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} aria-label={`Complete ${task.title}`} />
                  <div className="task-details"><h3>{task.title}</h3><p>📅 {showDate(task.date)}{task.time ? ` · ⏰ ${task.time}` : ""}</p></div>
                  <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  <div className="task-actions"><button type="button" onClick={() => editTask(task)} title="Edit task">✏️</button><button type="button" onClick={() => deleteTask(task.id)} title="Delete task">🗑️</button></div>
                </article>
              ))}</div>
            )}
          </section>
        </section>
        <footer className="footer">Made with ☕ and a little procrastination 😂</footer>
      </main>
    </div>
  );
}

export default App;
