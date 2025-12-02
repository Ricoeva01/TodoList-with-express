/**
 * =============================================================================
 * 1. CONFIGURATION & CONSTANTS
 * =============================================================================
 */
const STORAGE_KEYS = {
  BACKGROUND: "bgImage",
  THEME: "ThemeMode",
};

const API_URL = "http://localhost:3000/todos";

const ICONS = {
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>`,
  delete: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  save: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save-icon lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" /><path d="M7 3v4a1 1 0 0 0 1 1h7" /></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  stop: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-timer-off-icon lucide-timer-off"><path d="M10 2h4"/><path d="M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7"/><path d="M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2"/><path d="m2 2 20 20"/><path d="M12 12v-2"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
};

// DOM Elements
const elements = {
  form: document.querySelector("#add_form"),
  inputForm: document.querySelector(".input_text"),
  todoList: document.querySelector(".todo_list"),
  bgSelector: document.querySelector(".background_selector"),
  audio: document.querySelector("#timer-sound"),
};

// STATE
let todoItems = [];
const runningTimers = {};

/**
 * =============================================================================
 * 2. API FUNCTIONS (CRUD)
 * =============================================================================
 */

async function fetchTodos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Server Error");
    const data = await res.json();
    return data.map((todo) => ({
      ...todo,
      // Si le serveur renvoie 'title' au lieu de 'text', on gère les deux
      text: todo.text || todo.title,
      isEditing: false,
      timerState: null,
    }));
  } catch (err) {
    console.error("Erreur Fetch:", err);
    return [];
  }
}

async function apiCreateTodo(textValue) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textValue }),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

async function apiUpdateTodo(id, updates) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  } catch (err) {
    console.error(err);
  }
}

async function apiDeleteTodo(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  } catch (err) {
    console.error(err);
  }
}

/**
 * =============================================================================
 * 3. HELPER FUNCTIONS
 * =============================================================================
 */

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
}

async function initApp() {
  const savedBG = localStorage.getItem(STORAGE_KEYS.BACKGROUND);
  if (savedBG) document.body.style.backgroundImage = savedBG;

  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme === "light") applyTheme(true);

  todoItems = await fetchTodos();
  displayTodos();
}

/**
 * =============================================================================
 * 4. LOGIQUE TIMER
 * =============================================================================
 */

function startCountdown(todoId, minutes) {
  if (runningTimers[todoId]) clearInterval(runningTimers[todoId]);

  let remaining = minutes * 60;
  const item = todoItems.find((t) => t.id === todoId);
  if (item) item.timerState = "running";

  updateTimerDisplay(todoId, remaining);

  runningTimers[todoId] = setInterval(() => {
    remaining--;
    updateTimerDisplay(todoId, remaining);

    if (remaining <= 0) {
      clearInterval(runningTimers[todoId]);
      delete runningTimers[todoId];
      elements.audio.play();
      if (item) item.timerState = null;
      displayTodos();
    }
  }, 1000);
}

function updateTimerDisplay(todoId, remaining) {
  const timerText = document.getElementById(`timer-val-${todoId}`);
  if (timerText) timerText.innerText = formatTime(remaining);
}

function stopCountdown(todoId) {
  if (runningTimers[todoId]) {
    clearInterval(runningTimers[todoId]);
    delete runningTimers[todoId];
  }
  const item = todoItems.find((t) => t.id === todoId);
  if (item) item.timerState = null;
  displayTodos();
}

function updateOrderFromDOM() {
  const newOrderIds = [...elements.todoList.querySelectorAll(".todo_item")].map(
    (item) => Number(item.dataset.id)
  );
  todoItems = newOrderIds
    .map((id) => todoItems.find((t) => t.id === id))
    .filter((t) => t !== undefined);
}

/**
 * =============================================================================
 * 5. RENDU DOM (DISPLAY)
 * =============================================================================
 */

function displayTodos() {
  // Optionnel: Trier les tâches (désactive cette ligne si tu veux que ça bouge moins)
  todoItems.sort((a, b) =>
    a.completed === b.completed ? 0 : a.completed ? 1 : -1
  );

  elements.todoList.innerHTML = "";

  todoItems.forEach((todo) => {
    const listItem = createTodoElement(todo);
    elements.todoList.appendChild(listItem);
  });
}

function createTodoElement(todo) {
  const div = document.createElement("div");
  div.className = "todo_item";
  div.dataset.id = todo.id;

  // Configuration Drag & Drop
  const isBusy = todo.isEditing || todo.timerState;
  div.setAttribute("draggable", !isBusy);
  div.style.cursor = isBusy ? "default" : "grab";

  // Classes CSS - J'ai vérifié avec ton CSS, ces classes sont OK
  if (todo.timerState) div.classList.add("timing_active");
  if (todo.completed) div.classList.add("checked");
  if (todo.isEditing) div.classList.add("editing");

  div.addEventListener("dragstart", () => div.classList.add("dragging"));
  div.addEventListener("dragend", () => {
    div.classList.remove("dragging");
    // updateOrderFromDOM(); // Désactivé avec API simple
  });

  // --- RENDU HTML SELON ÉTAT ---

  // A. MODE ÉDITION
  if (todo.isEditing) {
    div.innerHTML = `
      <input class="text_editing" type="text" />
      <button class="save_button">${ICONS.save}</button>
    `;
    const input = div.querySelector(".text_editing");
    input.value = todo.text;
    setTimeout(() => input.focus(), 0);

    const handleSave = async () => {
      if (input.value.trim()) {
        const newText = input.value;
        // UX Smooth : Mise à jour immédiate
        todo.text = newText;
        todo.isEditing = false;
        // displayTodos();
        const newDiv = createTodoElement(todo);
        elements.todoList.replaceChild(newDiv, div);
        // Backend
        await apiUpdateTodo(todo.id, { text: newText });
      }
    };

    div.querySelector(".save_button").addEventListener("click", handleSave);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSave();
    });
  }
  // B. MODE TIMER SETUP
  else if (todo.timerState === "setup") {
    div.innerHTML = `
      <div class="timer_setup_container">
        <span style="font-weight:bold; margin-right:auto;">⏱️ Timer (min):</span>
        <input type="number" class="timer_input" value="25" min="1" max="120" />
        <button class="btn_timer_action btn_timer_start">${ICONS.play}</button>
        <button class="btn_timer_action btn_timer_stop">${ICONS.stop}</button>
      </div>
    `;
    const inputTime = div.querySelector(".timer_input");
    setTimeout(() => {
      inputTime.focus();
      inputTime.select();
    }, 0);

    div.querySelector(".btn_timer_start").addEventListener("click", () => {
      const mins = parseInt(inputTime.value);
      if (mins > 0) {
        startCountdown(todo.id, mins);
        displayTodos();
      }
    });
    div.querySelector(".btn_timer_stop").addEventListener("click", () => {
      todo.timerState = null;
      displayTodos();
    });
  }
  // C. MODE TIMER RUNNING
  else if (todo.timerState === "running") {
    div.innerHTML = `
      <div class="timer_running_container">
         <div class="todoCheckbox_circle" style="opacity:1; background:#ff4d4d; animation: pulse 1s infinite;"></div>
         <span class="timer_display" id="timer-val-${todo.id}">00:00</span>
         <span style="opacity:0.7; font-size:0.9rem;">${todo.text}</span>
         <button class="btn_timer_action btn_timer_stop" style="margin-left:auto;">${ICONS.stop}</button>
      </div>
    `;
    div
      .querySelector(".btn_timer_stop")
      .addEventListener("click", () => stopCountdown(todo.id));
  }
  // D. MODE NORMAL (AVEC TES CLASSES CSS CORRECTES)
  else {
    const checkedAttr = todo.completed ? "checked" : "";
    div.innerHTML = `
      <div class="todo_checkbox">
        <input type="checkbox" ${checkedAttr} />
        <div class="todoCheckbox_circle"></div>
      </div>
      <span class="text_todo"></span>
      <button class="timer_button">${ICONS.clock}</button>
      <button class="edit_button">${ICONS.edit}</button>
      <button class="delete_button">${ICONS.delete}</button>
    `;
    div.querySelector(".text_todo").textContent = todo.text || "";

    // --- ÉVÉNEMENTS ---

    // Checkbox avec effet "Smooth" (setTimeout)
    div
      .querySelector('input[type="checkbox"]')
      .addEventListener("change", async (e) => {
        const isChecked = e.currentTarget.checked;
        todo.completed = isChecked;

        if (isChecked) {
          div.classList.add("checked");
        } else {
          div.classList.remove("checked");
        }
        // displayTodos();
        await apiUpdateTodo(todo.id, { completed: isChecked });
      });

    // Boutons avec les bonnes classes
    div.querySelector(".timer_button").addEventListener("click", () => {
      todo.timerState = "setup";
      displayTodos();
    });
    div.querySelector(".edit_button").addEventListener("click", () => {
      todo.isEditing = true;
      displayTodos();
    });
    div.querySelector(".delete_button").addEventListener("click", async () => {
      if (runningTimers[todo.id]) clearInterval(runningTimers[todo.id]);

      // Optimistic delete
      todoItems = todoItems.filter((t) => t.id !== todo.id);
      // displayTodos();
      div.remove();
      await apiDeleteTodo(todo.id);
    });
  }

  return div;
}

/**
 * =============================================================================
 * 6. GLOBAL LISTENERS
 * =============================================================================
 */

elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const newText = formData.get("first_text");

  if (newText) {
    // 1. Créer la donnée serveur
    const newTodoFromServer = await apiCreateTodo(newText);

    // 2. Hydrater pour le local
    const todoComplete = {
      ...newTodoFromServer,
      isEditing: false,
      timerState: null,
    };

    // 3. Ajouter et afficher
    todoItems.push(todoComplete);
    // displayTodos();
    elements.todoList.appendChild(createTodoElement(todoComplete));
    e.currentTarget.reset();
  }
});

// Drag & Drop
elements.todoList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(elements.todoList, e.clientY);
  const draggable = document.querySelector(".dragging");
  if (afterElement == null) {
    elements.todoList.appendChild(draggable);
  } else {
    elements.todoList.insertBefore(draggable, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".todo_item:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset)
        return { offset: offset, element: child };
      else return closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// Background
elements.bgSelector.addEventListener("click", (e) => {
  if (e.target.classList.contains("bg_button_item")) {
    const bg = e.target.style.backgroundImage;
    document.body.style.backgroundImage = bg;
    localStorage.setItem(STORAGE_KEYS.BACKGROUND, bg);
  }
});

// Theme
const themeBtn = document.querySelector(".theme_toggle_btn");
function applyTheme(isLight) {
  if (isLight) {
    document.body.classList.add("light-mode");
    themeBtn.innerHTML = ICONS.moon;
    localStorage.setItem(STORAGE_KEYS.THEME, "light");
  } else {
    document.body.classList.remove("light-mode");
    themeBtn.innerHTML = ICONS.sun;
    localStorage.setItem(STORAGE_KEYS.THEME, "dark");
  }
}
themeBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light-mode");
  applyTheme(!isLight);
});

// --- START ---
initApp();
