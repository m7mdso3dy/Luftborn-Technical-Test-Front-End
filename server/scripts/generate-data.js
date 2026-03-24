#!/usr/bin/env node

/**
 * Generates JSON seed files under server/data/ with dates relative to today.
 * Usage: node scripts/generate-data.js (from server directory)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function isOverdue(dueDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < now;
}

function generateStatistics() {
  return {
    statistics: [
      {
        id: 'stat-001',
        title: 'Total Tasks',
        icon: '📊',
        value: 156,
        change: '+12',
        changeLabel: 'this week',
        changeType: 'positive',
        color: '#1976D2',
      },
      {
        id: 'stat-002',
        title: 'Completed',
        icon: '✅',
        value: 89,
        change: '+8',
        changeLabel: 'today',
        changeType: 'positive',
        color: '#388E3C',
      },
      {
        id: 'stat-003',
        title: 'In Progress',
        icon: '🔄',
        value: 42,
        change: '0',
        changeLabel: 'Same as yesterday',
        changeType: 'neutral',
        color: '#FF6F00',
      },
      {
        id: 'stat-004',
        title: 'Overdue',
        icon: '⚠️',
        value: 25,
        change: '+3',
        changeLabel: 'today',
        changeType: 'negative',
        color: '#D32F2F',
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

function generateTasks() {
  const now = new Date();

  const tasks = [
    {
      id: 'task-001',
      title: 'Design new homepage layout',
      description:
        'Create wireframes and mockups for the new homepage redesign with modern UI elements',
      status: 'todo',
      priority: 'high',
      dueDate: formatDate(addDays(now, 2)),
      assignee: {
        id: 'user-001',
        name: 'John Doe',
        avatar: 'JD',
        email: 'john.doe@company.com',
      },
      tags: ['Design'],
      createdAt: addDays(now, -2).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-002',
      title: 'Update documentation',
      description: 'Review and update API documentation for v2.0 release',
      status: 'todo',
      priority: 'medium',
      dueDate: formatDate(addDays(now, 5)),
      assignee: {
        id: 'user-002',
        name: 'Sarah Smith',
        avatar: 'SS',
        email: 'sarah.smith@company.com',
      },
      tags: ['Documentation'],
      createdAt: addDays(now, -3).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-003',
      title: 'Organize team meeting',
      description: 'Schedule and prepare agenda for quarterly planning session',
      status: 'todo',
      priority: 'low',
      dueDate: formatDate(addDays(now, 7)),
      assignee: {
        id: 'user-003',
        name: 'Mike Johnson',
        avatar: 'MJ',
        email: 'mike.johnson@company.com',
      },
      tags: ['Admin'],
      createdAt: addDays(now, -4).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-015',
      title: 'Prepare Q4 budget report',
      description: 'Compile and analyze financial data for quarterly budget presentation',
      status: 'todo',
      priority: 'high',
      dueDate: formatDate(addDays(now, -2)),
      isOverdue: true,
      assignee: {
        id: 'user-002',
        name: 'Sarah Smith',
        avatar: 'SS',
        email: 'sarah.smith@company.com',
      },
      tags: ['Finance'],
      createdAt: addDays(now, -16).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-016',
      title: 'Review client feedback',
      description: 'Analyze customer feedback from user testing sessions',
      status: 'todo',
      priority: 'medium',
      dueDate: formatDate(addDays(now, -3)),
      isOverdue: true,
      assignee: {
        id: 'user-004',
        name: 'Emily Davis',
        avatar: 'ED',
        email: 'emily.davis@company.com',
      },
      tags: ['Research'],
      createdAt: addDays(now, -15).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-004',
      title: 'Fix responsive design issues',
      description: 'Address layout problems on mobile and tablet devices',
      status: 'todo',
      priority: 'high',
      dueDate: formatDate(addDays(now, 3)),
      assignee: {
        id: 'user-004',
        name: 'Emily Davis',
        avatar: 'ED',
        email: 'emily.davis@company.com',
      },
      tags: ['Frontend'],
      createdAt: addDays(now, -5).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-005',
      title: 'Implement user authentication',
      description: 'Add JWT-based authentication system with refresh tokens',
      status: 'in_progress',
      priority: 'high',
      dueDate: formatDate(addDays(now, 3)),
      assignee: {
        id: 'user-001',
        name: 'John Doe',
        avatar: 'JD',
        email: 'john.doe@company.com',
      },
      tags: ['Backend'],
      createdAt: addDays(now, -7).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-006',
      title: 'Optimize database queries',
      description: 'Review and optimize slow queries identified in performance audit',
      status: 'in_progress',
      priority: 'medium',
      dueDate: formatDate(addDays(now, 4)),
      assignee: {
        id: 'user-002',
        name: 'Sarah Smith',
        avatar: 'SS',
        email: 'sarah.smith@company.com',
      },
      tags: ['Performance'],
      createdAt: addDays(now, -6).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-007',
      title: 'Create API endpoints',
      description: 'Develop RESTful API endpoints for task management features',
      status: 'in_progress',
      priority: 'high',
      dueDate: formatDate(addDays(now, 2)),
      assignee: {
        id: 'user-003',
        name: 'Mike Johnson',
        avatar: 'MJ',
        email: 'mike.johnson@company.com',
      },
      tags: ['Backend'],
      createdAt: addDays(now, -8).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-008',
      title: 'Add dark mode support',
      description: 'Implement theme toggle with dark/light mode preferences',
      status: 'in_progress',
      priority: 'medium',
      dueDate: formatDate(addDays(now, 6)),
      assignee: {
        id: 'user-004',
        name: 'Emily Davis',
        avatar: 'ED',
        email: 'emily.davis@company.com',
      },
      tags: ['Frontend'],
      createdAt: addDays(now, -9).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-017',
      title: 'Update payment gateway integration',
      description: 'Migrate to new payment provider API and update billing logic',
      status: 'in_progress',
      priority: 'high',
      dueDate: formatDate(addDays(now, -1)),
      isOverdue: true,
      assignee: {
        id: 'user-001',
        name: 'John Doe',
        avatar: 'JD',
        email: 'john.doe@company.com',
      },
      tags: ['Backend', 'Critical'],
      createdAt: addDays(now, -14).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-009',
      title: 'Fix critical login bug',
      description: 'Resolved issue preventing users from logging in on mobile devices',
      status: 'done',
      priority: 'high',
      dueDate: formatDate(addDays(now, -1)),
      completedAt: now.toISOString(),
      assignee: {
        id: 'user-003',
        name: 'Mike Johnson',
        avatar: 'MJ',
        email: 'mike.johnson@company.com',
      },
      tags: ['Bug Fix'],
      createdAt: addDays(now, -2).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-010',
      title: 'Setup CI/CD pipeline',
      description: 'Configured GitHub Actions for automated testing and deployment',
      status: 'done',
      priority: 'medium',
      dueDate: formatDate(addDays(now, -2)),
      completedAt: addDays(now, -1).toISOString(),
      assignee: {
        id: 'user-001',
        name: 'John Doe',
        avatar: 'JD',
        email: 'john.doe@company.com',
      },
      tags: ['DevOps'],
      createdAt: addDays(now, -9).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-011',
      title: 'Write unit tests',
      description: 'Add comprehensive unit tests for authentication module',
      status: 'done',
      priority: 'high',
      dueDate: formatDate(addDays(now, -3)),
      completedAt: addDays(now, -2).toISOString(),
      assignee: {
        id: 'user-002',
        name: 'Sarah Smith',
        avatar: 'SS',
        email: 'sarah.smith@company.com',
      },
      tags: ['Testing'],
      createdAt: addDays(now, -10).toISOString(),
      updatedAt: addDays(now, -2).toISOString(),
    },
    {
      id: 'task-012',
      title: 'Refactor payment module',
      description: 'Clean up and optimize payment processing code',
      status: 'done',
      priority: 'medium',
      dueDate: formatDate(addDays(now, -4)),
      completedAt: addDays(now, -3).toISOString(),
      assignee: {
        id: 'user-004',
        name: 'Emily Davis',
        avatar: 'ED',
        email: 'emily.davis@company.com',
      },
      tags: ['Refactoring'],
      createdAt: addDays(now, -12).toISOString(),
      updatedAt: addDays(now, -3).toISOString(),
    },
    {
      id: 'task-013',
      title: 'Security audit',
      description: 'Conduct comprehensive security review of the application',
      status: 'done',
      priority: 'high',
      dueDate: formatDate(addDays(now, -5)),
      completedAt: addDays(now, -4).toISOString(),
      assignee: {
        id: 'user-001',
        name: 'John Doe',
        avatar: 'JD',
        email: 'john.doe@company.com',
      },
      tags: ['Security'],
      createdAt: addDays(now, -13).toISOString(),
      updatedAt: addDays(now, -4).toISOString(),
    },
    {
      id: 'task-014',
      title: 'Update dependencies',
      description: 'Update all npm packages to latest stable versions',
      status: 'done',
      priority: 'low',
      dueDate: formatDate(addDays(now, -6)),
      completedAt: addDays(now, -5).toISOString(),
      assignee: {
        id: 'user-003',
        name: 'Mike Johnson',
        avatar: 'MJ',
        email: 'mike.johnson@company.com',
      },
      tags: ['Maintenance'],
      createdAt: addDays(now, -14).toISOString(),
      updatedAt: addDays(now, -5).toISOString(),
    },
  ];

  return {
    tasks,
    meta: {
      totalCount: tasks.length,
      lastUpdated: now.toISOString(),
    },
  };
}

function extractUsersFromTasks(taskList) {
  const map = new Map();
  for (const t of taskList) {
    const a = t.assignee;
    if (!map.has(a.id)) {
      const email = a.email;
      const username = email.split('@')[0].replace(/[^a-z0-9._-]/gi, '') || `user_${a.id}`;
      map.set(a.id, {
        id: a.id,
        name: a.name,
        email,
        username,
        avatar: String(a.avatar ?? ''),
        password: 'demo',
      });
    }
  }
  return [...map.values()];
}

function enrichTaskForApi(t) {
  const dueAt = t.dueDate;
  const overdueCalc =
    (t.status === 'todo' || t.status === 'in_progress') && isOverdue(dueAt);
  const isOverdueFlag = !!t.isOverdue || overdueCalc;
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueAt,
    dueDate: dueAt,
    isOverdue: isOverdueFlag,
    overdueBy: isOverdueFlag ? 'Overdue' : undefined,
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : '',
    assignee: {
      id: t.assignee.id,
      name: t.assignee.name,
      email: t.assignee.email,
      avatar: String(t.assignee.avatar ?? ''),
    },
    tags: t.tags,
    createdAt: new Date(t.createdAt).toISOString(),
    updatedAt: new Date(t.updatedAt).toISOString(),
  };
}

function writeJsonFile(filename, data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Generated: ${filePath}`);
}

function main() {
  console.log('Generating data...\n');

  const statistics = generateStatistics();
  writeJsonFile('statistics.json', statistics);

  const { tasks: rawTasks, meta } = generateTasks();
  const users = extractUsersFromTasks(rawTasks);
  const tasks = rawTasks.map(enrichTaskForApi);

  writeJsonFile(
    'users.json',
    users.map((u) => ({ ...u })),
  );
  writeJsonFile('tasks.json', { tasks, meta: { ...meta, lastUpdated: new Date().toISOString() } });

  console.log('\nDone.');
}

main();
