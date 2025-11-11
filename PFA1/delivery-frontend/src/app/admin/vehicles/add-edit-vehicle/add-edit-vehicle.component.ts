import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VehicleService, Vehicle } from '../../../services/vehicle.service';

@Component({
  selector: 'app-add-edit-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './add-edit-vehicle.component.html',
  styleUrl: './add-edit-vehicle.component.scss'
})
export class AddEditVehicleComponent implements OnInit {
  vehicleForm: FormGroup;
  isEdit: boolean;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddEditVehicleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { vehicle: Vehicle | null, isEdit: boolean }
  ) {
    this.isEdit = data.isEdit;
    this.vehicleForm = this.createForm();
  }

  ngOnInit() {
    if (this.isEdit && this.data.vehicle) {
      this.vehicleForm.patchValue(this.data.vehicle);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      immatriculation: ['', [Validators.required, Validators.minLength(2)]],
      marque: ['', [Validators.required, Validators.minLength(2)]],
      modele: ['', [Validators.required, Validators.minLength(2)]],
      capacite: [0, [Validators.required, Validators.min(1), Validators.max(50000)]],
      disponible: [true]
    });
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      this.loading = true;
      const vehicleData: Vehicle = this.vehicleForm.value;

      const operation = this.isEdit 
        ? this.vehicleService.updateVehicle(this.data.vehicle!.id!, vehicleData)
        : this.vehicleService.createVehicle(vehicleData);

      operation.subscribe({
        next: (result: any) => {
          this.loading = false;
          this.dialogRef.close(result);
        },
        error: (error: { error: { message: string; }; }) => {
          this.loading = false;
          console.error('Error saving vehicle:', error);
          const message = error.error?.message || 'Erreur lors de la sauvegarde du véhicule';
          this.snackBar.open(message, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  private markFormGroupTouched() {
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.vehicleForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} est requis`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} doit contenir au moins ${control.errors?.['minlength']?.requiredLength} caractères`;
    }
    if (control?.hasError('min')) {
      return `La capacité doit être supérieure à 0`;
    }
    if (control?.hasError('max')) {
      return `La capacité ne peut pas dépasser 50000 kg`;
    }
    return '';
  }
}
