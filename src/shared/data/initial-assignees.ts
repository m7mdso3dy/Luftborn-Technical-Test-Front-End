import { type Assignee } from '../models/task.types';

/** Default team members (seed for `TeamStoreService` and legacy task mocks). */
export const INITIAL_ASSIGNEES: readonly Assignee[] = [
  { id: 'a1', name: 'Sarah', avatar: '', email: 'sarah@example.com' },
  { id: 'a2', name: 'John', avatar: '', email: 'john@example.com' },
  { id: 'a3', name: 'Mike', avatar: '', email: 'mike@example.com' },
];
