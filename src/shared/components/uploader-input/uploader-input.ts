import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { TranslatePipe, TranslationService } from '@core';
import { ButtonModule } from 'primeng/button';

/**
 * Image file picker that stores a data URL string (for avatars, etc.).
 * Use with reactive forms: `formControlName="avatar"`.
 */
@Component({
  selector: 'app-uploader-input',
  standalone: true,
  imports: [ButtonModule, TranslatePipe],
  templateUrl: './uploader-input.html',
  styleUrl: './uploader-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploaderInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class UploaderInputComponent implements ControlValueAccessor {
  protected readonly i18n = inject(TranslationService);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  /** Comma-separated list passed to the native file input `accept` attribute. */
  readonly accept = input<string>('image/png,image/jpeg,image/webp,image/gif');

  /** Rejects files larger than this (bytes). */
  readonly maxBytes = input<number>(2_097_152);

  /** Accessible label for the choose button (caller supplies translated string). */
  readonly chooseLabel = input<string>('Choose file');

  /** Label for clear action. */
  readonly clearLabel = input<string>('Remove');

  protected readonly previewUrl = signal<string>('');
  protected readonly errorMessage = signal<string>('');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  protected isDisabled = false;

  protected openPicker(): void {
    if (this.isDisabled) {
      return;
    }
    this.fileInput()?.nativeElement.click();
  }

  protected onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) {
      return;
    }
    if (file.size > this.maxBytes()) {
      this.errorMessage.set('uploader.errors.tooLarge');
      return;
    }
    this.errorMessage.set('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.previewUrl.set(result);
      this.onChange(result);
      this.onTouched();
    };
    reader.readAsDataURL(file);
  }

  protected clear(): void {
    if (this.isDisabled) {
      return;
    }
    this.previewUrl.set('');
    this.errorMessage.set('');
    this.onChange('');
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.previewUrl.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
