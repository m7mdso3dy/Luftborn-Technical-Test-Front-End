import { TestBed } from '@angular/core/testing';

import { TranslationService } from '@core';
import { createTranslationServiceMock } from '../../../testing/test-utils';
import { UploaderInputComponent } from './uploader-input';

describe('UploaderInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploaderInputComponent],
      providers: [{ provide: TranslationService, useValue: createTranslationServiceMock() }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UploaderInputComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should apply writeValue to internal preview state', () => {
    const fixture = TestBed.createComponent(UploaderInputComponent);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    cmp.writeValue('data:image/png;base64,AAA');
    expect(cmp['previewUrl']()).toBe('data:image/png;base64,AAA');
  });
});
