const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const summary = document.getElementById("summary");
const warning = document.getElementById("warning");
const progressBar = document.getElementById("progressBar");
const feedback = document.getElementById("feedback");
const resetBtn = document.getElementById("resetBtn");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let dark = localStorage.getItem("theme") === "dark";

if (dark) document.body.classList.add("dark");
renderTasks();
updateSummary();

// live clock
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;
  const category = document.getElementById("category").value;

  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  if (startMin >= endMin) {
    warning.textContent = "⚠️ End time must be after start time.";
    return;
  }

  for (let t of tasks) {
    if ((startMin < t.end && endMin > t.start)) {
      warning.textContent = `⚠️ Overlaps with '${t.name}'`;
      return;
    }
  }

  warning.textContent = "";
  const duration = endMin - startMin;
  const task = { name, start, end, category, startMin, endMin, duration };
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  updateSummary();
  form.reset();
});

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = `task-card ${t.category}`;
    div.innerHTML = `
      <span>${t.name} — ${t.start} to ${t.end} (${(t.duration/60).toFixed(2)}h)</span>
      <button onclick="deleteTask(${i})">🗑️</button>
    `;
    taskList.appendChild(div);
  });
}

function deleteTask(i) {
  tasks.splice(i, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  updateSummary();
}

function updateSummary() {
  const total = tasks.reduce((sum, t) => sum + t.duration, 0);
  const productiveHours = (total / 60).toFixed(2);
  const percent = Math.min((productiveHours / 16) * 100, 100);
  const free = (16 - total / 60).toFixed(2);

  progressBar.style.width = percent + "%";
  let msg =
    percent >= 80
      ? "🔥 Excellent productivity!"
      : percent >= 50
      ? "💪 Good! Keep going."
      : "⚡ Try to plan better!";
  feedback.textContent = msg;

  summary.innerHTML = `
    <p>Total Productive Hours: ${productiveHours} hrs</p>
    <p>Free Time: ${free} hrs</p>
    <p>Productivity: ${percent.toFixed(0)}%</p>
  `;
}

resetBtn.addEventListener("click", () => {
  if (confirm("Clear all tasks?")) {
    tasks = [];
    localStorage.removeItem("tasks");
    renderTasks();
    updateSummary();
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  dark = document.body.classList.contains("dark");
  themeToggle.textContent = dark ? "☀️" : "🌙";
  localStorage.setItem("theme", dark ? "dark" : "light");
});
