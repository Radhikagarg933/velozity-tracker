import { Task, Priority, Status, PRIORITIES, STATUSES } from '../types';
import { USERS } from './users';

const TASK_VERBS = [
  'Build', 'Fix', 'Design', 'Review', 'Test', 'Deploy', 'Refactor', 'Document',
  'Integrate', 'Optimize', 'Implement', 'Migrate', 'Configure', 'Analyze', 'Create',
  'Update', 'Remove', 'Investigate', 'Patch', 'Audit', 'Upgrade', 'Debug',
];

const TASK_SUBJECTS = [
  'authentication flow', 'dashboard widgets', 'REST API endpoints', 'database schema',
  'user onboarding', 'payment gateway', 'notification system', 'search functionality',
  'file upload feature', 'email templates', 'admin panel', 'mobile responsiveness',
  'performance bottleneck', 'security audit', 'CI/CD pipeline', 'unit test coverage',
  'accessibility issues', 'localization support', 'dark mode toggle', 'caching layer',
  'error handling middleware', 'logging system', 'analytics integration', 'social login',
  'data export module', 'rate limiter', 'GraphQL schema', 'WebSocket connection',
  'image compression', 'PDF generation', 'token refresh flow', 'RBAC permissions',
  'audit trail', 'feature flags', 'A/B test setup', 'onboarding checklist',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateOffset(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export function generateTasks(count: number = 500): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const rand = Math.random();

    // Due date distribution: 25% heavily overdue, 15% slightly overdue, 5% today, 55% future
    let dueOffset: number;
    if (rand < 0.08) {
      dueOffset = -Math.floor(Math.random() * 30) - 8; // 8–38 days overdue
    } else if (rand < 0.25) {
      dueOffset = -Math.floor(Math.random() * 7) - 1; // 1–7 days overdue
    } else if (rand < 0.30) {
      dueOffset = 0; // due today
    } else {
      dueOffset = Math.floor(Math.random() * 60) + 1; // 1–60 days ahead
    }

    const dueDate = dateOffset(dueOffset);

    // 20% of tasks have no start date (edge case testing)
    let startDate: string | null = null;
    if (Math.random() > 0.2) {
      const startOffset = dueOffset - Math.floor(Math.random() * 14) - 1;
      startDate = dateOffset(startOffset);
    }

    const verb = randomFrom(TASK_VERBS);
    const subject = randomFrom(TASK_SUBJECTS);

    tasks.push({
      id: `task-${i + 1}`,
      title: `${verb} ${subject} #${i + 1}`,
      assigneeId: randomFrom(USERS).id,
      priority: randomFrom(PRIORITIES),
      status: randomFrom(STATUSES),
      startDate,
      dueDate,
    });
  }

  return tasks;
}
