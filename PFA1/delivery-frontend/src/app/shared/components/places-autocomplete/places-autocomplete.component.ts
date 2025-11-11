import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { GooglePlacesService } from '../../services/google-places.service';
import { debounceTime, distinctUntilChanged, switchMap, startWith, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';

@Component({
  selector: 'app-places-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlacesAutocompleteComponent),
      multi: true
    }
  ],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <input 
        matInput 
        #input
        [formControl]="searchControl"
        [matAutocomplete]="auto"
        [placeholder]="placeholder">
      <mat-icon matSuffix>{{ icon }}</mat-icon>
      <mat-autocomplete 
        #auto="matAutocomplete" 
        [displayWith]="displayFn"
        (optionSelected)="onOptionSelected($event)">
        <mat-option *ngFor="let prediction of filteredPredictions | async" [value]="prediction">
          <div class="prediction-option">
            <div class="main-text">{{ prediction.structured_formatting?.main_text }}</div>
            <div class="secondary-text">{{ prediction.structured_formatting?.secondary_text }}</div>
          </div>
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    
    .prediction-option {
      display: flex;
      flex-direction: column;
      padding: 4px 0;
    }
    
    .main-text {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .secondary-text {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54);
    }
  `]
})
export class PlacesAutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() label = 'Location';
  @Input() placeholder = 'Enter a location';
  @Input() icon = 'location_on';
  @Output() placeSelected = new EventEmitter<any>();

  @ViewChild('input') inputElement!: ElementRef;

  searchControl = new FormControl('');
  filteredPredictions: Observable<any[]> = of([]);
  
  private destroy$ = new Subject<void>();
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private googlePlacesService: GooglePlacesService) {}

  ngOnInit(): void {
    this.filteredPredictions = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.length > 2) {
          return this.googlePlacesService.getPlacePredictions(value);
        }
        return of([]);
      })
    );

    // Listen for direct input changes and emit the value
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (typeof value === 'string') {
        this.onChange(value);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onOptionSelected(event: any): void {
    const prediction = event.option.value;
    this.placeSelected.emit(prediction);
    this.onChange(prediction.description);
    this.onTouched();
  }

  displayFn(prediction: any): string {
    if (typeof prediction === 'string') {
      return prediction;
    }
    return prediction ? prediction.description : '';
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value) {
      // Handle both string values and prediction objects
      if (typeof value === 'string') {
        this.searchControl.setValue(value, { emitEvent: false });
      } else if (value && value.description) {
        this.searchControl.setValue(value.description, { emitEvent: false });
      } else {
        this.searchControl.setValue(value, { emitEvent: false });
      }
    } else {
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }
}
