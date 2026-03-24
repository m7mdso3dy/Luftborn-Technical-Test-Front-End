import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type AppLocale = 'en' | 'ar';

interface TranslationNode {
  [key: string]: string | TranslationNode;
}

const STORAGE_KEY = 'app.locale';

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

function readStoredLocale(): AppLocale | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'ar' || raw === 'en' ? raw : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly translations = signal<TranslationNode>({});

  /** Current UI locale; use in templates with the `tr` pipe as the second argument. */
  readonly locale = signal<AppLocale>('en');

  constructor(
    private readonly http: HttpClient,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  /** `true` when layout should use RTL (Arabic). */
  isRtl(): boolean {
    return this.locale() === 'ar';
  }

  translate(key: string, fallback?: string): string {
    return resolveKey(this.translations(), key) ?? fallback ?? key;
  }

  async load(locale: string): Promise<void> {
    const normalized: AppLocale = locale === 'ar' ? 'ar' : 'en';
    const data = await firstValueFrom(
      this.http.get<TranslationNode>(`/i18n/${normalized}.json`),
    );
    this.translations.set(data);
    this.locale.set(normalized);
    this.applyDocumentLocale(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      /* ignore quota / private mode */
    }
  }

  /** Apply stored or default locale on startup (no HTTP if already loaded). */
  async initializeFromStorage(): Promise<void> {
    const stored = readStoredLocale();
    const initial: AppLocale = stored ?? 'en';
    await this.load(initial);
  }

  async setLocale(next: AppLocale): Promise<void> {
    if (next === this.locale()) {
      this.applyDocumentLocale(next);
      return;
    }
    await this.load(next);
  }

  async toggleLocale(): Promise<void> {
    const next: AppLocale = this.locale() === 'en' ? 'ar' : 'en';
    await this.setLocale(next);
  }

  private applyDocumentLocale(locale: AppLocale): void {
    const html = this.document.documentElement;
    html.lang = locale === 'ar' ? 'ar' : 'en';
    html.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }
}
