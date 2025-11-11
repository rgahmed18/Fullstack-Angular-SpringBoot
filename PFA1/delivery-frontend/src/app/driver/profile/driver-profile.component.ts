import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DriverDashboardService } from '../services/driver-dashboard.service';

@Component({
  selector: 'app-driver-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTabsModule,
    ReactiveFormsModule
  ],
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.scss']
})
export class DriverProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  chauffeurProfile: any = null;
  loading = true;
  updating = false;
  error: string | null = null;
  stats: any = {
    totalMissions: 0,
    completedMissions: 0,
    successRate: 0,
    totalKm: 0
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private driverService: DriverDashboardService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]+$/)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadStats();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors!['passwordMismatch'];
      if (Object.keys(confirmPassword.errors!).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    const currentUser = this.authService.currentUserValue;
    const chauffeurId = currentUser?.chauffeurId;

    if (chauffeurId) {
      this.driverService.getChauffeurProfile(chauffeurId).subscribe({
        next: (profile: any) => {
          this.chauffeurProfile = profile;
          this.populateForm(profile);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading profile:', error);
          this.error = 'Erreur lors du chargement du profil';
          this.loading = false;
        }
      });
    } else {
      this.error = 'Utilisateur non trouvé';
      this.loading = false;
    }
  }

  loadStats(): void {
    this.driverService.getDashboardStats().subscribe({
      next: (stats: any) => {
        this.stats = {
          totalMissions: stats.totalMissions || 0,
          completedMissions: stats.completedMissions || 0,
          successRate: stats.successRate || 0,
          totalKm: Math.floor(Math.random() * 5000) + 1000 // Mock data for now
        };
      },
      error: (error: any) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  populateForm(profile: any): void {
    this.profileForm.patchValue({
      nom: profile.nom || '',
      prenom: profile.prenom || '',
      telephone: profile.telephone || '',
      email: profile.user?.email || ''
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.updating = true;
      
      const formData = this.profileForm.value;
      const currentUser = this.authService.currentUserValue;
      const chauffeurId = currentUser?.chauffeurId;

      if (chauffeurId) {
        // Mock update - replace with actual service call
        setTimeout(() => {
          this.updating = false;
          this.showSuccessMessage('Profil mis à jour avec succès');
        }, 1000);
      }
    } else {
      this.showErrorMessage('Veuillez corriger les erreurs dans le formulaire');
    }
  }

  updatePassword(): void {
    if (this.passwordForm.valid) {
      this.updating = true;
      
      // Mock password update - replace with actual service call
      setTimeout(() => {
        this.updating = false;
        this.passwordForm.reset();
        this.showSuccessMessage('Mot de passe mis à jour avec succès');
      }, 1000);
    } else {
      this.showErrorMessage('Veuillez corriger les erreurs dans le formulaire de mot de passe');
    }
  }

  getProfileCompletionPercentage(): number {
    if (!this.chauffeurProfile) return 0;
    
    let completedFields = 0;
    const totalFields = 6; // nom, prenom, telephone, email, dateEmbauche, vehicule
    
    if (this.chauffeurProfile.nom) completedFields++;
    if (this.chauffeurProfile.prenom) completedFields++;
    if (this.chauffeurProfile.telephone) completedFields++;
    if (this.chauffeurProfile.user?.email) completedFields++;
    if (this.chauffeurProfile.dateEmbauche) completedFields++;
    if (this.chauffeurProfile.vehicule) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  }

  getStatusColor(): string {
    const status = this.getDriverStatus();
    switch (status) {
      case 'EN_MISSION': return 'primary';
      case 'ACTIF': return 'success';
      case 'INACTIF': return 'warn';
      default: return 'warn';
    }
  }

  getStatusText(): string {
    return this.getDriverStatus();
  }

  private getDriverStatus(): string {
    if (!this.chauffeurProfile) return 'INACTIF';
    
    // Check if driver has active missions (priority over actif status)
    const hasActiveMissions = this.stats.totalMissions > this.stats.completedMissions;
    
    if (hasActiveMissions) return 'EN_MISSION';
    
    // Only check actif status if no active missions
    return this.chauffeurProfile.actif ? 'ACTIF' : 'INACTIF';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Non défini';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getExperienceYears(): number {
    if (!this.chauffeurProfile?.dateEmbauche) return 0;
    const startDate = new Date(this.chauffeurProfile.dateEmbauche);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 7000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
