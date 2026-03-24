import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { type TaskStatus } from '../../models/task.types';

/** Rejects titles that are empty after trim or contain angle brackets. */
export const taskTitleValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const v = (control.value as string | null | undefined)?.trim() ?? '';
  if (!v.length) return { titleRequired: true };
  if (/[<>]/.test(v)) return { titleInvalidChars: true };
  return null;
};

/** Blocks common placeholder / forbidden phrases in descriptions (demo custom rule). */
export const descriptionBlacklistValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = (control.value as string | null | undefined) ?? '';
  const v = raw.trim().toLowerCase();
  if (!v.length) return null;
  const forbidden = ['lorem ipsum', 'asdf'];
  if (forbidden.some((w) => v.includes(w))) {
    return { descriptionForbidden: true };
  }
  return null;
};

/** Cross-field: open statuses need a due date; done needs a completion note. */
export const taskFormCrossFieldValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const status = group.get('status')?.value as TaskStatus | null | undefined;
  const due = group.get('dueDate')?.value as Date | null | undefined;
  if (status === 'todo' || status === 'in_progress') {
    if (!due || !(due instanceof Date) || Number.isNaN(due.getTime())) {
      return { dueDateRequired: true };
    }
  }
  if (status === 'done') {
    const note = (group.get('completionNote')?.value as string | undefined)?.trim();
    if (!note) {
      return { completionRequired: true };
    }
  }
  return null;
};
