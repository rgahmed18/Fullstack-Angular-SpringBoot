import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChauffeurService } from '../../../core/services/chauffeur.service';

@Component({
  selector: 'app-add-chauffeur',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  providers: [ChauffeurService],
  templateUrl: './add-chauffeur.component.html',
  styleUrls: ['./add-chauffeur.component.scss']
})
export class AddChauffeurComponent {
  chauffeurForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private chauffeurService: ChauffeurService
  ) {
    this.chauffeurForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      actif: [true],
      dateEmbauche: [null, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.chauffeurForm.valid) {
      const chauffeurData = this.chauffeurForm.value;
      
      // Validate password
      if (!chauffeurData.password || chauffeurData.password.trim() === '') {
        alert('Le mot de passe est requis.');
        return;
      }
      
      // Convert the date to ISO 8601 format (e.g., "2025-08-02T17:44:57.208Z")
      if (chauffeurData.dateEmbauche) {
        const date = new Date(chauffeurData.dateEmbauche);
        chauffeurData.dateEmbauche = date.toISOString();
      }
      
      // Log the data being sent
      console.log('Sending chauffeur data:', chauffeurData);
      
      this.isLoading = true;
      this.chauffeurService.addChauffeurAsAdmin(chauffeurData).subscribe({
        next: () => {
          alert('Chauffeur ajouté avec succès!');
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error: any) => {
          this.isLoading = false;
          let errorMessage = 'Erreur lors de l\'ajout du chauffeur.';
          
          console.error('Error adding chauffeur:', error);
          
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
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  // Helper method to check if a field has errors
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.chauffeurForm.get(fieldName);
    return field ? field.hasError(errorType) && (field.dirty || field.touched) : false;
  }

  // Helper method to get error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.chauffeurForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} est requis`;
      if (field.errors['minlength']) return `${fieldName} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['email']) return 'Format d\'email invalide';
      if (field.errors['pattern']) return 'Format de téléphone invalide';
    }
    return '';
  }
} 