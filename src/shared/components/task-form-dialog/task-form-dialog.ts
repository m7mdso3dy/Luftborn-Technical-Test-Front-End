import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  model,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControlOptions,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { TranslatePipe, TranslationService } from '@core';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { type Task, type TaskPriority, type TaskStatus } from '../../models/task.types';

import { TASK_ASSIGNEES } from './task-assignees';
import { computeDueDisplay } from './task-due.helpers';
import {
  descriptionBlacklistValidator,
  taskFormCrossFieldValidator,
  taskTitleValidator,
} from './task-form.validators';

const taskFormGroupOptions: AbstractControlOptions = {
  validators: [taskFormCrossFieldValidator],
};

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Dialog,
    Select,
    DatePicker,
    Button,
    InputText,
    Textarea,
    TranslatePipe,
    PrimeTemplate,
  ],
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(TranslationService);

  readonly visible = model(false);
  readonly task = input<Task | null>(null);
  readonly saved = output<Task>();

  readonly assigneeSelectOptions = TASK_ASSIGNEES.map((a) => ({
    label: a.name,
    value: a.id,
  }));

  protected readonly dialogHeader = computed(() => {
    void this.i18n.locale();
    return this.task()
      ? this.i18n.translate('taskForm.titleEdit')
      : this.i18n.translate('taskForm.titleCreate');
  });

  protected readonly prioritySelectOptions = computed(() => {
    void this.i18n.locale();
    return [
      { label: this.i18n.translate('taskForm.priority.high'), value: 'high' as const },
      { label: this.i18n.translate('taskForm.priority.medium'), value: 'medium' as const },
      { label: this.i18n.translate('taskForm.priority.low'), value: 'low' as const },
    ];
  });

  protected readonly statusSelectOptions = computed(() => {
    void this.i18n.locale();
    return [
      { label: this.i18n.translate('taskForm.status.todo'), value: 'todo' as const },
      { label: this.i18n.translate('taskForm.status.inProgress'), value: 'in_progress' as const },
      { label: this.i18n.translate('taskForm.status.done'), value: 'done' as const },
    ];
  });

  readonly form = this.fb.group(
    {
      title: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), taskTitleValidator],
      }),
      description: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(10),
          descriptionBlacklistValidator,
        ],
      }),
      priority: this.fb.control<TaskPriority | null>(null, Validators.required),
      status: this.fb.control<TaskStatus | null>(null, Validators.required),
      dueDate: this.fb.control<Date | null>(null),
      assigneeId: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      completionNote: this.fb.control('', { nonNullable: true }),
    },
    taskFormGroupOptions,
  );

  protected readonly submitting = signal(false);

  constructor() {
    this.form
      .get('status')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.updateValueAndValidity({ emitEvent: false });
      });

    effect(() => {
      const open = this.visible();
      const t = this.task();
      if (!open) {
        untracked(() => this.resetTouchState());
        return;
      }
      untracked(() => this.hydrateForm(t));
    });
  }

  close(): void {
    this.visible.set(false);
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    const v = this.form.getRawValue();
    const assignee = TASK_ASSIGNEES.find((a) => a.id === v.assigneeId)!;

    const dueAt =
      v.dueDate instanceof Date && !Number.isNaN(v.dueDate.getTime())
        ? toDateOnlyIso(v.dueDate)
        : undefined;

    const completedAt =
      v.status === 'done' ? (v.completionNote.trim() || 'Completed') : '';

    const { dueDate, isOverdue, overdueBy } = computeDueDisplay(dueAt, v.status!, completedAt);

    const existing = this.task();
    const task: Task = {
      id: existing?.id ?? `t-${newId()}`,
      title: v.title.trim(),
      description: v.description.trim(),
      status: v.status!,
      priority: v.priority!,
      dueAt,
      dueDate,
      isOverdue,
      overdueBy,
      completedAt,
      assignee,
      tags: existing?.tags ?? [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    queueMicrotask(() => {
      this.submitting.set(false);
      this.saved.emit(task);
      this.visible.set(false);
    });
  }

  showError(path: string, errorCode: string): boolean {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.dirty || c.touched) && c.hasError(errorCode);
  }

  showGroupError(code: string): boolean {
    return this.form.invalid && this.form.touched && this.form.hasError(code);
  }

  private hydrateForm(task: Task | null): void {
    this.form.reset(
      {
        title: '',
        description: '',
        priority: null,
        status: null,
        dueDate: null,
        assigneeId: '',
        completionNote: '',
      },
      { emitEvent: false },
    );

    if (task) {
      this.form.patchValue(
        {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueAt ? new Date(task.dueAt + 'T12:00:00') : null,
          assigneeId: task.assignee.id,
          completionNote: task.completedAt || '',
        },
        { emitEvent: false },
      );
    } else {
      this.form.patchValue({ status: 'todo', priority: 'medium' }, { emitEvent: false });
    }

    this.form.updateValueAndValidity({ emitEvent: false });
    this.resetTouchState();
  }

  private resetTouchState(): void {
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }
}

function toDateOnlyIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? String(Date.now());
}
