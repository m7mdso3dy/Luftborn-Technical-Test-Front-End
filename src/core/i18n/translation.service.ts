import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface TranslationNode {
  [key: string]: string | TranslationNode;
}

function resolveKey(tree: TranslationNode, path: string): string | undefined {
  const parts = path.split('.').filter(Boolean);
  let current: string | TranslationNode | undefined = tree;
  for (const p of parts) {
    if (current === undefined || typeof current === 'string') {
      return undefined;
    }
    current = current[p];
  }
  return typeof current === 'string' ? current : undefined;
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly translations = signal<TranslationNode>({});

  constructor(private readonly http: HttpClient) {}

  async load(locale: string): Promise<void> {
    const data = await firstValueFrom(
      this.http.get<TranslationNode>(`/i18n/${locale}.json`),
    );
    this.translations.set(data);
  }

  translate(key: string, fallback?: string): string {
    return resolveKey(this.translations(), key) ?? fallback ?? key;
  }
}
