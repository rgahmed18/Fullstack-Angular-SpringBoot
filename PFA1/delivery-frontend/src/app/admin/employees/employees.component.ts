import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteEmployeeDialogComponent } from './confirm-delete-employee-dialog.component';
import { Router } from '@angular/router';
import { EmployeeService, EmployeeResponseDTO as BaseEmployeeResponseDTO, MissionSummary, EmployeeResponseDTO } from '../../core/services/employee.service';

// Extended interface for component use
interface EmployeeWithMissions extends BaseEmployeeResponseDTO {
  missions?: MissionSummary[];
  totalMissions?: number;
  activeMissions?: number;
  completedMissions?: number;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: EmployeeWithMissions[] = [];
  loading = true;
  error: string | null = null;

  displayedColumns: string[] = ['employee', 'contact', 'missions', 'status', 'actions'];

  constructor(
    private employeeService: EmployeeService,
    public router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.error = null;

    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        // Load mission statistics for each employee
        this.loadEmployeeMissionStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.error = 'Erreur lors du chargement des employés';
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des employés', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadEmployeeMissionStats() {
    this.employees.forEach(employee => {
      this.employeeService.getEmployeeMissions(employee.id).subscribe({
        next: (missions) => {
          employee.missions = missions;
          employee.totalMissions = missions.length;
          employee.activeMissions = missions.filter(m => 
            m.etat === 'EN_ATTENTE' || m.etat === 'COMMENCEE' || m.etat === 'EN_COURS'
          ).length;
          employee.completedMissions = missions.filter(m => 
            m.etat === 'TERMINEE'
          ).length;
        },
        error: (error) => {
          console.warn(`Could not load missions for employee ${employee.id}:`, error);
          employee.totalMissions = 0;
          employee.activeMissions = 0;
          employee.completedMissions = 0;
        }
      });
    });
  }

  editEmployee(employee: EmployeeWithMissions): void {
    this.router.navigate(['/admin/edit-employee', employee.id]);
  }

  viewEmployeeMissions(employee: EmployeeWithMissions) {
    this.router.navigate(['/admin/employee-missions', employee.id], {
      queryParams: { name: `${employee.prenom} ${employee.nom}` }
    });
  }

  deleteEmployee(employee: EmployeeWithMissions): void {
    const dialogRef = this.dialog.open(ConfirmDeleteEmployeeDialogComponent, {
      width: '500px',
      data: {
        employee: {
          id: employee.id,
          nom: employee.nom,
          prenom: employee.prenom,
          activeMissions: employee.activeMissions || 0
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Attempting to delete employee:', employee.id);
        this.employeeService.deleteEmployee(employee.id).subscribe({
          next: (response) => {
            console.log('Delete response:', response);
            this.snackBar.open(
              `Employé ${employee.prenom} ${employee.nom} supprimé avec succès`,
              'Fermer',
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
            this.loadEmployees(); // Reload the list
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
            let errorMessage = 'Erreur lors de la suppression de l\'employé';
            
            if (error.error && error.error.error) {
              errorMessage = error.error.error;
            } else if (error.status === 400 && error.error) {
              errorMessage = error.error.error || error.error.message || errorMessage;
            }
            
            this.snackBar.open(
              errorMessage,
              'Fermer',
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
          }
        });
      }
    });
  }

  getStatusColor(employee: EmployeeWithMissions): string {
    if (!employee.actif) return 'warn';
    if (employee.activeMissions && employee.activeMissions > 0) return 'primary';
    return 'accent';
  }

  getStatusText(employee: EmployeeWithMissions): string {
    if (!employee.actif) return 'Inactif';
    if (employee.activeMissions && employee.activeMissions > 0) return 'Actif';
    return 'Disponible';
  }

  getStatusIcon(employee: EmployeeWithMissions): string {
    if (!employee.actif) return 'person_off';
    if (employee.activeMissions && employee.activeMissions > 0) return 'work';
    return 'person';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
