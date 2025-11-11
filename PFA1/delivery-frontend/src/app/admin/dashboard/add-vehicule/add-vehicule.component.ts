import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehiculeService } from '../../../core/services/vehicule.service';

@Component({
  selector: 'app-add-vehicule',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-vehicule.component.html',
  styleUrls: ['./add-vehicule.component.scss']
})
export class AddVehiculeComponent implements OnInit {
  vehiculeForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private vehiculeService: VehiculeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.vehiculeForm = this.fb.group({
      immatriculation: ['', [Validators.required, Validators.minLength(3)]],
      marque: ['', [Validators.required, Validators.minLength(2)]],
      modele: ['', [Validators.required, Validators.minLength(2)]],
      capacite: [0, [Validators.required, Validators.min(1), Validators.max(50000)]],
      disponible: [true]
    });
  }

  onSubmit(): void {
    if (this.vehiculeForm.valid) {
      const vehiculeData = this.vehiculeForm.value;
      
      // Validate immatriculation
      if (!vehiculeData.immatriculation || vehiculeData.immatriculation.trim() === '') {
        alert('L\'immatriculation est requise.');
        return;
      }
      
      // Log the data being sent
      console.log('Sending vehicule data:', vehiculeData);
      
      this.isLoading = true;
      this.vehiculeService.addVehiculeAsAdmin(vehiculeData).subscribe({
        next: () => {
          alert('Véhicule ajouté avec succès!');
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error: any) => {
          this.isLoading = false;
          let errorMessage = 'Erreur lors de l\'ajout du véhicule.';
          
          console.error('Error adding vehicule:', error);
          
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          alert(errorMessage);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  // Helper method to check if a field has errors
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.vehiculeForm.get(fieldName);
    return field ? field.hasError(errorType) && (field.dirty || field.touched) : false;
  }

  // Helper method to get error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.vehiculeForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} est requis`;
      if (field.errors['minlength']) return `${fieldName} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['min']) return `La capacité doit être supérieure à 0`;
      if (field.errors['max']) return `La capacité ne peut pas dépasser 50000 kg`;
    }
    return '';
  }
}
