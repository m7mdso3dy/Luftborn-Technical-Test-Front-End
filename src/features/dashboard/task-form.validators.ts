import {
  AbstractControl,
  FormArray,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { type TaskStatus } from '@shared/models/task.types';

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

/** At least one non-empty tag after trim; max 8 tags; each tag 2–40 chars. */
export const tagsFormArrayValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const fa = control as FormArray<FormControl<string>>;
  const values = fa.controls.map((c) => (c.value ?? '').trim()).filter(Boolean);
  if (values.length < 1) return { tagsMin: { min: 1, actual: 0 } };
  if (values.length > 8) return { tagsMax: { max: 8, actual: values.length } };
  for (const t of values) {
    if (t.length < 2) return { tagTooShort: true };
    if (t.length > 40) return { tagTooLong: true };
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

export function createTagControl(value = ''): FormControl<string> {
  return new FormControl(value, {
    nonNullable: true,
    validators: [Validators.maxLength(40)],
  });
}
