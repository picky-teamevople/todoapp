/**
 * UI 연결 전용 — DOM 조작/이벤트 바인딩만 담당한다.
 * 실제 데이터 변경 규칙(추가/토글/삭제/필터/저장)은 전부 ./todo-logic.js의 순수 함수에 위임하고,
 * 여기서는 "무엇을 언제 호출할지"만 결정한다.
 */
import {
  CATEGORY_IDS,
  addTodo,
  toggleTodo,
  deleteTodo,
  deleteCompleted,
  filterByStatus,
  filterByCategory,
  saveToStorage,
  loadFromStorage,
} from "./todo-logic.js";

const CATEGORY_LABELS = {
  work: "업무",
  personal: "개인",
  meeting: "회의/미팅",
  etc: "기타",
};

const state = {
  todos: [],
  statusFilter: "all",
  categoryFilters: new Set(),
};

const categorySelect = document.getElementById("new-todo-category");
const textInput = document.getElementById("new-todo-text");
const addButton = document.getElementById("add-todo-button");
const errorMessage = document.getElementById("new-todo-error");
const statusTabs = Array.from(document.querySelectorAll("[data-status-filter]"));
const categoryTabs = Array.from(document.querySelectorAll("[data-category-filter]"));
const listRoot = document.getElementById("todo-list-root");
const emptyState = document.getElementById("empty-state");
const deleteCompletedButton = document.getElementById("delete-completed-button");

function getVisibleTodos() {
  const byStatus = filterByStatus(state.todos, state.statusFilter);
  return filterByCategory(byStatus, state.categoryFilters);
}

function persist() {
  saveToStorage(state.todos);
}

function createTodoItemElement(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " todo-item--completed" : "");
  li.dataset.id = todo.id;

  li.innerHTML = `
    <label class="checkbox">
      <input type="checkbox" class="checkbox__input" aria-label="할 일 완료 표시" ${todo.completed ? "checked" : ""} />
      <span class="checkbox__box">
        <svg class="checkbox__icon" viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5L4.5 8.5L11 1" /></svg>
      </span>
    </label>
    <div class="todo-item__content">
      <p class="todo-item__text"></p>
      <span class="category-pill category-pill--${todo.categoryId} todo-item__tag">${CATEGORY_LABELS[todo.categoryId]}</span>
    </div>
    <div class="todo-item__actions">
      <button type="button" class="todo-item__action" data-action="edit" aria-label="수정">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11.3 1.7a1.5 1.5 0 0 1 2.1 2.1L5.5 11.7l-2.8.9.9-2.8Z" /></svg>
      </button>
      <button type="button" class="todo-item__action todo-item__action--delete" data-action="delete" aria-label="삭제">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4h10M6 4V2.5A.5.5 0 0 1 6.5 2h3a.5.5 0 0 1 .5.5V4M4.5 4l.6 8.5a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9L12 4" /></svg>
      </button>
    </div>
  `;

  // 사용자 입력 텍스트는 textContent로만 넣어 XSS를 방지한다.
  li.querySelector(".todo-item__text").textContent = todo.text;

  li.querySelector(".checkbox__input").addEventListener("change", () => handleToggle(todo.id));
  li.querySelector('[data-action="delete"]').addEventListener("click", () => handleDelete(todo.id));
  // 인라인 수정(더블클릭)은 이번 구현 범위(순수 로직 함수 8종)에 없어 버튼만 배치하고 로직은 연결하지 않았다.

  return li;
}

function createCategoryGroupElement(categoryId, items) {
  const wrapper = document.createElement("div");
  wrapper.className = "category-group";
  wrapper.innerHTML = `
    <div class="category-group-header category-group-header--${categoryId}">
      <span class="category-group-header__dot" aria-hidden="true"></span>
      <span class="category-group-header__label">${CATEGORY_LABELS[categoryId]}</span>
      <span class="category-group-header__count"></span>
    </div>
    <ul class="todo-list"></ul>
  `;
  wrapper.querySelector(".category-group-header__count").textContent = `${items.length}개`;

  const ul = wrapper.querySelector(".todo-list");
  items.forEach((todo) => ul.appendChild(createTodoItemElement(todo)));

  return wrapper;
}

function render() {
  const visible = getVisibleTodos();
  listRoot.innerHTML = "";

  if (visible.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    CATEGORY_IDS.forEach((categoryId) => {
      const items = visible.filter((todo) => todo.categoryId === categoryId);
      if (items.length === 0) return;
      listRoot.appendChild(createCategoryGroupElement(categoryId, items));
    });
  }

  deleteCompletedButton.disabled = !state.todos.some((todo) => todo.completed);
}

function handleAddTodo() {
  const before = state.todos;
  const next = addTodo(before, { text: textInput.value, categoryId: categorySelect.value });

  if (next === before) {
    errorMessage.hidden = false;
    textInput.focus();
    return;
  }

  errorMessage.hidden = true;
  state.todos = next;
  textInput.value = "";
  persist();
  render();
}

function handleToggle(id) {
  state.todos = toggleTodo(state.todos, id);
  persist();
  render();
}

function handleDelete(id) {
  state.todos = deleteTodo(state.todos, id);
  persist();
  render();
}

function handleDeleteCompleted() {
  state.todos = deleteCompleted(state.todos);
  persist();
  render();
}

function handleStatusFilterChange(value) {
  state.statusFilter = value;
  statusTabs.forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset.statusFilter === value));
  });
  render();
}

function handleCategoryFilterToggle(categoryId, buttonEl) {
  if (state.categoryFilters.has(categoryId)) {
    state.categoryFilters.delete(categoryId);
    buttonEl.setAttribute("aria-pressed", "false");
  } else {
    state.categoryFilters.add(categoryId);
    buttonEl.setAttribute("aria-pressed", "true");
  }
  render();
}

addButton.addEventListener("click", handleAddTodo);
textInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleAddTodo();
});
textInput.addEventListener("input", () => {
  if (!errorMessage.hidden) errorMessage.hidden = true;
});

statusTabs.forEach((tab) => {
  tab.addEventListener("click", () => handleStatusFilterChange(tab.dataset.statusFilter));
});

categoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => handleCategoryFilterToggle(tab.dataset.categoryFilter, tab));
});

deleteCompletedButton.addEventListener("click", handleDeleteCompleted);

state.todos = loadFromStorage();
render();
