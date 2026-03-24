import { Component, input } from '@angular/core';
import { type Statistic } from '../../models/task.types';

@Component({
  selector: 'statistic-card',
  standalone: true,
  templateUrl: './statistic-card.html',
  styleUrl: './statistic-card.css',
})
export class StatisticCardComponent {
  readonly stat = input.required<Statistic>();

  get changeColor(): string {
    const type = this.stat().changeType;
    if (type === 'positive') return 'text-emerald-600';
    if (type === 'negative') return 'text-red-500';
    return 'text-slate-500';
  }

  get iconBgClass(): string {
    const colorMap: Record<string, string> = {
      blue:   'bg-blue-50   text-blue-500',
      green:  'bg-emerald-50 text-emerald-500',
      orange: 'bg-orange-50 text-orange-500',
      red:    'bg-red-50    text-red-500',
    };
    return colorMap[this.stat().color] ?? 'bg-slate-100 text-slate-500';
  }
}
