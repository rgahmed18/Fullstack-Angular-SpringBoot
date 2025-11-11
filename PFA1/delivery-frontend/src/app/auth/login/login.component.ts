import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  role: string = '';
  roleTitle: string = '';
  roleSubtitle: string = '';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.role = data['role'];
      this.setRoleSpecificContent();
      
      // Check if user is authenticated for this specific role
      if (this.authService.isAuthenticatedForRole(this.role)) {
        this.router.navigate([`${this.role}/dashboard`]);
      }
    });
  }

  private setRoleSpecificContent() {
    switch (this.role) {
      case 'admin':
        this.roleTitle = 'Administrateur';
        this.roleSubtitle = 'Gestion des employés, chauffeurs, véhicules et missions';
        break;
      case 'employee':
        this.roleTitle = 'Employé';
        this.roleSubtitle = 'Gestion des missions et suivi des coursiers';
        break;
      case 'driver':
        this.roleTitle = 'Chauffeur';
        this.roleSubtitle = 'Gestion des missions et suivi des livraisons';
        break;
      default:
        this.roleTitle = 'Administrateur';
        this.roleSubtitle = 'Gestion des employés, chauffeurs, véhicules et missions';
    }
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    if (this.loginForm.invalid) {
      this.loading = false;
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .subscribe({
        next: (user) => {
          this.loading = false;
          this.success = 'Connexion réussie !';
          
          // Get the current role from the route
          const currentRole = this.role;
          
          // Navigate to the role-specific dashboard immediately
          this.router.navigate([`${currentRole}/dashboard`]);
        },
        error: (error) => {
          this.loading = false;
          if (error.error && error.error.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Erreur lors de la connexion';
          }
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getRoleIcon(): string {
    switch (this.role) {
      case 'admin':
        return 'admin_panel_settings';
      case 'employee':
        return 'person';
      case 'driver':
        return 'drive_eta';
      default:
        return 'person';
    }
  }

  getRoleColor(): string {
    switch (this.role) {
      case 'admin':
        return 'primary';
      case 'employee':
        return 'accent';
      case 'driver':
        return 'warn';
      default:
        return 'primary';
    }
  }
}
