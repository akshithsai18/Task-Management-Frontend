const TASKS_KEY = 'daymark_tasks_';
const USER_KEY = 'daymark_mock_user';
const accounts = new Map();
const demoEmail = 'alex.morgan@example.com';
const demoPassword = 'Taskflow123!';

const pause = (duration = 180) => new Promise((resolve) => window.setTimeout(resolve, duration));
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

function seedTasks() {
  const now = new Date().toISOString();
  return [
    { id: 'sample-1', title: 'Finalize Q3 product brief', description: 'Consolidate the research notes and align the final scope with the product team.', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: dateOffset(1), createdAt: now, updatedAt: now },
    { id: 'sample-2', title: 'Review onboarding flow', description: 'Walk through the new user journey and capture any friction points.', priority: 'MEDIUM', status: 'PENDING', dueDate: dateOffset(2), createdAt: now, updatedAt: now },
    { id: 'sample-3', title: 'Send design handoff', description: 'Share component specs and responsive states with engineering.', priority: 'HIGH', status: 'PENDING', dueDate: dateOffset(4), createdAt: now, updatedAt: now },
    { id: 'sample-4', title: 'Update project timeline', description: 'Move milestone dates based on this week’s delivery review.', priority: 'LOW', status: 'COMPLETED', dueDate: dateOffset(-1), createdAt: now, updatedAt: now },
    { id: 'sample-5', title: 'Prepare weekly team notes', description: 'Collect decisions, owners, and follow-up items for Friday.', priority: 'LOW', status: 'PENDING', dueDate: dateOffset(6), createdAt: now, updatedAt: now },
    { id: 'sample-6', title: 'Audit component library', description: 'Check shared components for consistency and document small improvements.', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: dateOffset(3), createdAt: now, updatedAt: now },
  ];
}

function currentUser() {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
}

function readTasks() {
  const user = currentUser();
  if (!user) return [];
  const key = `${TASKS_KEY}${user.email}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* Replace malformed development data with a clean seed. */ }
  const seeded = seedTasks();
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

function writeTasks(tasks) {
  const user = currentUser();
  if (!user) throw new Error('Please sign in to manage tasks.');
  localStorage.setItem(`${TASKS_KEY}${user.email}`, JSON.stringify(tasks));
}

export const mockApi = {
  async register({ name, email, password }) {
    await pause();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === demoEmail || accounts.has(normalizedEmail)) throw new Error('An account with this email already exists.');
    accounts.set(normalizedEmail, { name: name.trim(), password });
    return { message: 'Account created.' };
  },

  async login({ email, password }) {
    await pause();
    const normalizedEmail = email.trim().toLowerCase();
    const account = normalizedEmail === demoEmail ? { name: 'Alex Morgan', password: demoPassword } : accounts.get(normalizedEmail);
    if (!account || account.password !== password) throw new Error('The email or password you entered is incorrect.');
    const user = { id: normalizedEmail, name: account.name, email: normalizedEmail };
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return { token: `mock-${makeId()}`, user };
  },

  async me() {
    await pause(80);
    const user = currentUser();
    if (!user) throw new Error('Your session has ended. Please sign in again.');
    return user;
  },

  async logout() {
    sessionStorage.removeItem(USER_KEY);
  },

  async getTasks() {
    await pause(120);
    return readTasks();
  },

  async getTask(id) {
    await pause(100);
    const task = readTasks().find((item) => String(item.id) === String(id));
    if (!task) throw new Error('This task could not be found.');
    return task;
  },

  async createTask(payload) {
    await pause();
    const now = new Date().toISOString();
    const task = { ...payload, id: makeId(), createdAt: now, updatedAt: now };
    writeTasks([task, ...readTasks()]);
    return task;
  },

  async updateTask(id, payload) {
    await pause();
    const tasks = readTasks();
    const index = tasks.findIndex((item) => String(item.id) === String(id));
    if (index < 0) throw new Error('This task could not be found.');
    const updated = { ...tasks[index], ...payload, id: tasks[index].id, updatedAt: new Date().toISOString() };
    tasks[index] = updated;
    writeTasks(tasks);
    return updated;
  },

  async deleteTask(id) {
    await pause();
    const tasks = readTasks();
    if (!tasks.some((item) => String(item.id) === String(id))) throw new Error('This task could not be found.');
    writeTasks(tasks.filter((item) => String(item.id) !== String(id)));
  },
};
