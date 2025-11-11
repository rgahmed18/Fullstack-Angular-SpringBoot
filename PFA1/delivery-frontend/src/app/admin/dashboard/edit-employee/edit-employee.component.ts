import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService, EmployeeResponseDTO } from '../../../core/services/employee.service';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  employeeId!: number;
  employee: EmployeeResponseDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadEmployee();
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: [''], // Optional for updates
      actif: [true]
    });
  }

  private loadEmployee(): void {
    this.isLoading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.employeeForm.patchValue({
          nom: employee.nom,
          prenom: employee.prenom,
          email: employee.email,
          telephone: employee.telephone,
          actif: employee.actif
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.snackBar.open('Erreur lors du chargement de l\'employé', 'Fermer', { duration: 3000 });
        this.router.navigate(['/admin/employees']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const employeeData = {
        ...this.employeeForm.value,
        dateEmbauche: this.employee?.dateEmbauche || new Date().toISOString()
      };
      
      // Remove password if empty
      if (!employeeData.password || employeeData.password.trim() === '') {
        delete employeeData.password;
      }
      
      console.log('Updating employee data:', employeeData);
      
      this.isLoading = true;
      this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
        next: (response) => {
          this.snackBar.open('Employé modifié avec succès!', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/employees']);
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Erreur lors de la modification de l\'employé.';
          
          console.error('Error updating employee:', error);
          
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/employees']);
  }

  // Helper method to check if a field has errors
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return field ? field.hasError(errorType) && (field.dirty || field.touched) : false;
  }

  // Helper method to get error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} est requis`;
      if (field.errors['minlength']) return `${fieldName} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['email']) return 'Format d\'email invalide';
      if (field.errors['pattern']) return 'Format de téléphone invalide';
    }
    return '';
  }
}
