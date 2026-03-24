'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'luftborn-dev-secret-change-in-production';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

function ensureDataFiles() {
  if (!fs.existsSync(USERS_FILE) || !fs.existsSync(TASKS_FILE)) {
    console.log('Seeding data (users.json / tasks.json missing)...');
    execSync('node scripts/generate-data.js', { cwd: ROOT, stdio: 'inherit' });
  }
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function loadUsers() {
  const list = readJson(USERS_FILE, []);
  return Array.isArray(list) ? list : [];
}

function loadTasksPayload() {
  const data = readJson(TASKS_FILE, { tasks: [], meta: {} });
  return {
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    meta: data.meta && typeof data.meta === 'object' ? data.meta : {},
  };
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

function saveTasks(tasks, meta) {
  writeJson(TASKS_FILE, {
    tasks,
    meta: {
      ...meta,
      totalCount: tasks.length,
      lastUpdated: new Date().toISOString(),
    },
  });
}

function publicUser(u) {
  if (!u) return null;
  const { password: _p, ...rest } = u;
  return rest;
}

function findUserByLogin(users, username) {
  const q = String(username || '').trim().toLowerCase();
  if (!q) return null;
  return (
    users.find(
      (u) =>
        u.username?.toLowerCase() === q ||
        u.email?.toLowerCase() === q ||
        u.name?.toLowerCase() === q,
    ) || null
  );
}

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const TASK_STATUSES = ['todo', 'in_progress', 'done'];

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Aligns overdue flags with status + due date (same rules as the Angular client). */
function derivedOverdueForTask(task, status) {
  if (status === 'done') {
    return { isOverdue: false, overdueBy: undefined };
  }
  const dueRaw = task.dueAt || task.dueDate;
  if (!dueRaw) return { isOverdue: false, overdueBy: undefined };
  const due = new Date(dueRaw);
  if (Number.isNaN(due.getTime())) return { isOverdue: false, overdueBy: undefined };
  const today = startOfDay(new Date());
  const dueDay = startOfDay(due);
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) {
    const n = -diffDays;
    const label = `Overdue by ${n} day${n === 1 ? '' : 's'}`;
    return { isOverdue: true, overdueBy: label };
  }
  return { isOverdue: false, overdueBy: undefined };
}

ensureDataFiles();

let users = loadUsers();
let { tasks, meta } = loadTasksPayload();

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'luftborn-test-api' });
});

/** POST /api/auth/login { username, password } */
app.post('/api/auth/login', (req, res) => {
  users = loadUsers();
  const { username, password } = req.body || {};
  const user = findUserByLogin(users, username);
  if (!user || user.password !== String(password || '')) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const accessToken = jwt.sign(
    { sub: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
  res.json({
    accessToken,
    tokenType: 'Bearer',
    user: publicUser(user),
  });
});

/** Users CRUD */
app.get('/api/users', (_req, res) => {
  users = loadUsers();
  res.json(users.map(publicUser));
});

app.get('/api/users/:id', (req, res) => {
  users = loadUsers();
  const u = users.find((x) => x.id === req.params.id);
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json(publicUser(u));
});

app.post('/api/users', (req, res) => {
  users = loadUsers();
  const { name, email, username, password, avatar } = req.body || {};
  if (!name || !email || !username || !password) {
    return res.status(400).json({ message: 'name, email, username, and password are required' });
  }
  if (users.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'Email already in use' });
  }
  if (users.some((u) => u.username?.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ message: 'Username already in use' });
  }
  const user = {
    id: newId('user'),
    name: String(name).trim(),
    email: String(email).trim(),
    username: String(username).trim(),
    password: String(password),
    avatar: avatar != null ? String(avatar) : '',
  };
  users.push(user);
  saveUsers(users);
  res.status(201).json(publicUser(user));
});

app.put('/api/users/:id', (req, res) => {
  users = loadUsers();
  const i = users.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ message: 'User not found' });
  const patch = req.body || {};
  const next = { ...users[i] };
  if (patch.name != null) next.name = String(patch.name).trim();
  if (patch.email != null) next.email = String(patch.email).trim();
  if (patch.username != null) next.username = String(patch.username).trim();
  if (patch.avatar != null) next.avatar = String(patch.avatar);
  if (patch.password != null) next.password = String(patch.password);
  const emailTaken = users.some(
    (u, j) => j !== i && u.email?.toLowerCase() === next.email?.toLowerCase(),
  );
  if (emailTaken) return res.status(409).json({ message: 'Email already in use' });
  const userTaken = users.some(
    (u, j) => j !== i && u.username?.toLowerCase() === next.username?.toLowerCase(),
  );
  if (userTaken) return res.status(409).json({ message: 'Username already in use' });
  users[i] = next;
  saveUsers(users);
  res.json(publicUser(next));
});

app.delete('/api/users/:id', (req, res) => {
  users = loadUsers();
  const i = users.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ message: 'User not found' });
  users.splice(i, 1);
  saveUsers(users);
  res.status(204).send();
});

/** Tasks CRUD */
app.get('/api/tasks', (_req, res) => {
  const data = loadTasksPayload();
  tasks = data.tasks;
  meta = data.meta;
  res.json({ tasks, meta });
});

app.get('/api/tasks/:id', (req, res) => {
  const data = loadTasksPayload();
  const t = data.tasks.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ message: 'Task not found' });
  res.json(t);
});

/** PATCH /api/tasks/:id/status { status } — Kanban / status-only updates */
app.patch('/api/tasks/:id/status', (req, res) => {
  const status = req.body?.status;
  if (!TASK_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'status must be todo, in_progress, or done' });
  }
  const data = loadTasksPayload();
  tasks = data.tasks;
  meta = data.meta;
  const i = tasks.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ message: 'Task not found' });
  const prev = tasks[i];
  let completedAt = prev.completedAt || '';
  if (status === 'done') {
    if (!completedAt) completedAt = new Date().toISOString();
  } else {
    completedAt = '';
  }
  const { isOverdue, overdueBy } = derivedOverdueForTask(prev, status);
  const next = {
    ...prev,
    status,
    completedAt,
    isOverdue,
    overdueBy,
    updatedAt: new Date().toISOString(),
  };
  tasks[i] = next;
  saveTasks(tasks, meta);
  res.json(next);
});

app.post('/api/tasks', (req, res) => {
  const data = loadTasksPayload();
  tasks = data.tasks;
  meta = data.meta;
  const body = req.body || {};
  if (!body.title || !body.assignee?.id) {
    return res.status(400).json({ message: 'title and assignee.id are required' });
  }
  const userList = loadUsers();
  const assigneeUser = userList.find((u) => u.id === body.assignee.id);
  const assignee = assigneeUser
    ? {
        id: assigneeUser.id,
        name: assigneeUser.name,
        email: assigneeUser.email,
        avatar: assigneeUser.avatar ?? '',
      }
    : body.assignee;
  const now = new Date().toISOString();
  const dueAt = body.dueAt || body.dueDate || null;
  const task = {
    id: body.id || newId('task'),
    title: String(body.title),
    description: body.description != null ? String(body.description) : '',
    status: body.status || 'todo',
    priority: body.priority || 'medium',
    dueAt,
    dueDate: dueAt || '',
    isOverdue: !!body.isOverdue,
    overdueBy: body.overdueBy,
    completedAt: body.completedAt != null ? String(body.completedAt) : '',
    assignee,
    tags: Array.isArray(body.tags) ? body.tags : [],
    createdAt: body.createdAt || now,
    updatedAt: now,
  };
  if (tasks.some((x) => x.id === task.id)) {
    return res.status(409).json({ message: 'Task id already exists' });
  }
  tasks.push(task);
  saveTasks(tasks, meta);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const data = loadTasksPayload();
  tasks = data.tasks;
  meta = data.meta;
  const i = tasks.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ message: 'Task not found' });
  const body = req.body || {};
  const prev = tasks[i];
  const userList = loadUsers();
  let assignee = prev.assignee;
  if (body.assignee?.id) {
    const u = userList.find((x) => x.id === body.assignee.id);
    assignee = u
      ? { id: u.id, name: u.name, email: u.email, avatar: u.avatar ?? '' }
      : body.assignee;
  }
  const dueAt = body.dueAt ?? body.dueDate ?? prev.dueAt ?? prev.dueDate;
  const next = {
    ...prev,
    ...body,
    id: prev.id,
    assignee,
    dueAt: dueAt || undefined,
    dueDate: dueAt != null ? dueAt : prev.dueDate,
    updatedAt: new Date().toISOString(),
  };
  tasks[i] = next;
  saveTasks(tasks, meta);
  res.json(next);
});

app.delete('/api/tasks/:id', (req, res) => {
  const data = loadTasksPayload();
  tasks = data.tasks;
  meta = data.meta;
  const i = tasks.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ message: 'Task not found' });
  tasks.splice(i, 1);
  saveTasks(tasks, meta);
  res.status(204).send();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});
