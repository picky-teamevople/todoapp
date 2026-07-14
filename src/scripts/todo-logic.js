/**
 * 순수 로직 함수 — DOM을 전혀 참조하지 않고 데이터만 입출력한다.
 * id/시간 생성처럼 원래 비순수한 부분은 옵션 인자로 주입 가능하게 열어두어
 * (기본값은 실제 구현) 나머지 로직은 항상 (입력 → 새 배열) 형태를 유지한다.
 */

export const CATEGORY_IDS = ["work", "personal", "meeting", "etc"];

const STORAGE_KEY = "todo-list:todos";

export function createId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 빈 문자열(공백만 포함)이면 등록을 차단하고 원본 배열을 그대로 반환한다. */
export function addTodo(todos, { text, categoryId, id, createdAt } = {}) {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return todos;

  const newTodo = {
    id: id ?? createId(),
    text: trimmed,
    categoryId: CATEGORY_IDS.includes(categoryId) ? categoryId : "etc",
    completed: false,
    createdAt: createdAt ?? new Date().toISOString(),
    dueDate: null,
    order: todos.length,
  };

  return [...todos, newTodo];
}

/** 빈 문자열(공백만 포함)이면 저장을 차단하고 원본 배열을 그대로 반환한다(addTodo와 동일 정책). */
export function updateTodo(todos, id, text) {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return todos;
  return todos.map((todo) => (todo.id === id ? { ...todo, text: trimmed } : todo));
}

export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
}

export function deleteTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

export function deleteCompleted(todos) {
  return todos.filter((todo) => !todo.completed);
}

export function filterByStatus(todos, statusFilter) {
  if (statusFilter === "active") return todos.filter((todo) => !todo.completed);
  if (statusFilter === "completed") return todos.filter((todo) => todo.completed);
  return todos;
}

/** categoryFilters가 비어 있으면(Set size 0) 전체 카테고리를 보여준다. */
export function filterByCategory(todos, categoryFilters) {
  if (!categoryFilters || categoryFilters.size === 0) return todos;
  return todos.filter((todo) => categoryFilters.has(todo.categoryId));
}

export function saveToStorage(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
