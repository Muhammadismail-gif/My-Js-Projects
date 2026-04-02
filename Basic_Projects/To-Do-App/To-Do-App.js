const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const clearAll = document.getElementById("clearAll");
const themeToggle = document.getElementById("themeToggle");

// Load tasks from localStorage
document.addEventListener("DOMContentLoaded", loadTasks);

addBtn.addEventListener("click", addTask);
taskList.addEventListener("click", handleTaskClick);
clearAll.addEventListener("click", clearAllTasks);
themeToggle.addEventListener("click", toggleTheme);

function addTask() {
  const text = taskInput.value.trim();
  if (text === "") return;

  const task = { text, completed: false };
  saveTask(task);
  renderTasks();
  taskInput.value = "";
}

function handleTaskClick(e) {
  const li = e.target.closest("li");
  const index = li.dataset.index;
  let tasks = getTasks();

  if (e.target.classList.contains("fa-trash")) {
    tasks.splice(index, 1);
  } 
  else if (e.target.classList.contains("fa-pen")) {
    const newText = prompt("Edit task:", tasks[index].text);
    if (newText !== null && newText.trim() !== "") {
      tasks[index].text = newText.trim();
    }
  } 
  else if (e.target.classList.contains("task-text")) {
    tasks[index].completed = !tasks[index].completed;
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function saveTask(task) {
  let tasks = getTasks();
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function renderTasks() {
  taskList.innerHTML = "";
  let tasks = getTasks();
  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.dataset.index = i;
    li.className = task.completed ? "completed" : "";
    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="action-btns">
        <i class="fa-solid fa-pen"></i>
        <i class="fa-solid fa-trash"></i>
      </div>`;
    taskList.appendChild(li);
  });
}

function clearAllTasks() {
  if (confirm("Clear all tasks?")) {
    localStorage.removeItem("tasks");
    renderTasks();
  }
}

function loadTasks() {
  renderTasks();
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const icon = themeToggle.querySelector("i");
  icon.classList.toggle("fa-sun");
  icon.classList.toggle("fa-moon");
}
