import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ChauffeurService } from '../../../core/services/chauffeur.service';

@Component({
  selector: 'app-edit-chauffeur',
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
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-chauffeur.component.html',
  styleUrls: ['./edit-chauffeur.component.scss']
})
export class EditChauffeurComponent implements OnInit {
  chauffeurForm: FormGroup;
  isLoading = false;
  isLoadingData = false;
  hidePassword = true;
  chauffeurId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private chauffeurService: ChauffeurService,
    private snackBar: MatSnackBar
  ) {
    this.chauffeurForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: [''], // Optional for editing
      actif: [true],
      dateEmbauche: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.chauffeurId = +params['id'];
      if (this.chauffeurId) {
        this.loadChauffeurData();
      }
    });
  }

  loadChauffeurData(): void {
    if (!this.chauffeurId) return;
    
    this.isLoadingData = true;
    this.chauffeurService.getChauffeurById(this.chauffeurId).subscribe({
      next: (chauffeur) => {
        this.chauffeurForm.patchValue({
          nom: chauffeur.nom,
          prenom: chauffeur.prenom,
          email: chauffeur.email,
          telephone: chauffeur.telephone,
          actif: chauffeur.actif,
          dateEmbauche: chauffeur.dateEmbauche ? new Date(chauffeur.dateEmbauche) : null
        });
        this.isLoadingData = false;
      },
      error: (error) => {
        console.error('Error loading chauffeur data:', error);
        this.snackBar.open('Erreur lors du chargement des données du chauffeur', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoadingData = false;
        this.router.navigate(['/admin/chauffeurs']);
      }
    });
  }

  onSubmit(): void {
    if (this.chauffeurForm.valid && this.chauffeurId) {
      const chauffeurData = this.chauffeurForm.value;
      
      // Remove password if empty (don't change password)
      if (!chauffeurData.password || chauffeurData.password.trim() === '') {
        delete chauffeurData.password;
      }
      
      // Convert the date to ISO 8601 format
      if (chauffeurData.dateEmbauche) {
        const date = new Date(chauffeurData.dateEmbauche);
        chauffeurData.dateEmbauche = date.toISOString();
      }
      
      console.log('Updating chauffeur data:', chauffeurData);
      
      this.isLoading = true;
      this.chauffeurService.updateChauffeur(this.chauffeurId, chauffeurData).subscribe({
        next: (response) => {
          this.snackBar.open('Chauffeur modifié avec succès!', 'Fermer', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/admin/chauffeurs']);
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Erreur lors de la modification du chauffeur.';
          
          console.error('Error updating chauffeur:', error);
          
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 6000,
            panelClass: ['error-snackbar']
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/chauffeurs']);
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
