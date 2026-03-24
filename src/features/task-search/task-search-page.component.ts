import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, map, timer } from 'rxjs';

import { TranslatePipe, TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import { TaskCardComponent, TaskFormCoordinatorService, TaskStoreService } from '@shared';
import { type Task } from '@shared/models/task.types';
import { SkeletonModule } from 'primeng/skeleton';

function taskMatchesQuery(task: Task, q: string): boolean {
  const n = q.toLowerCase();
  if (!n) return false;
  if (task.title.toLowerCase().includes(n)) return true;
  if (task.description.toLowerCase().includes(n)) return true;
  if (task.assignee.name.toLowerCase().includes(n)) return true;
  if (task.assignee.email.toLowerCase().includes(n)) return true;
  if (task.tags.some((t) => t.toLowerCase().includes(n))) return true;
  return false;
}

@Component({
  selector: 'app-task-search-page',
  standalone: true,
  imports: [RouterLink, TaskCardComponent, SkeletonModule, TranslatePipe],
  templateUrl: './task-search-page.component.html',
  styleUrl: './task-search-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskSearchPageComponent implements OnInit {
  protected readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);
  private readonly taskStore = inject(TaskStoreService);
  private readonly taskForm = inject(TaskFormCoordinatorService);

  protected readonly showSkeleton = signal(true);
  protected readonly skeletonSlots = [0, 1, 2, 3, 4, 5] as const;

  /** Query string from the URL (`?q=`). */
  protected readonly searchQuery = toSignal(
    this.route.queryParams.pipe(map((p) => String(p['q'] ?? '').trim())),
    { initialValue: '' },
  );

  protected readonly matches = computed(() => {
    const q = this.searchQuery();
    const tasks = this.taskStore.tasks();
    if (!q) return [];
    return tasks.filter((t) => taskMatchesQuery(t, q));
  });

  ngOnInit(): void {
    forkJoin({
      data: this.taskStore.refresh(),
      minDelay: timer(SKELETON_MIN_DISPLAY_MS),
    }).subscribe({
      complete: () => this.showSkeleton.set(false),
    });
  }

  protected openTask(task: Task): void {
    this.taskForm.openEdit(task);
  }
}
