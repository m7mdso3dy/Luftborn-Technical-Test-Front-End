import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Lets shell actions (e.g. sidebar "New Task") open the dashboard task dialog without tight coupling. */
@Injectable({ providedIn: 'root' })
export class TaskModalBridgeService {
  private readonly newTask$ = new Subject<void>();

  /** Subscribe on the dashboard (or any host of the task form) to open create mode. */
  readonly newTaskRequested = this.newTask$.asObservable();

  requestNewTask(): void {
    this.newTask$.next();
  }
}
