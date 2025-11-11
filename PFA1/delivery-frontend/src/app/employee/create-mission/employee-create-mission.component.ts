import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MissionService, CreateMissionRequest, MissionFormData } from '../../core/services/mission.service';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeDashboardService } from '../services/employee-dashboard.service';
import { HttpClient } from '@angular/common/http';
import { PlacesAutocompleteComponent } from '../../shared/components/places-autocomplete/places-autocomplete.component';

@Component({
  selector: 'app-employee-create-mission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    PlacesAutocompleteComponent
  ],
  templateUrl: './employee-create-mission.component.html',
  styleUrl: './employee-create-mission.component.scss'
})
export class EmployeeCreateMissionComponent implements OnInit {
  missionForm: FormGroup;
  formData: MissionFormData = { chauffeurs: [], employes: [], vehicules: [] };
  loading = false;
  submitting = false;
  error: string | null = null;
  currentEmployeeName = '';

  missionTypes = [
    { value: 'materiel', label: 'Matériel' },
    { value: 'document', label: 'Document' },
    { value: 'personnel', label: 'Personnel' }
  ];

  heuresDisponibles = [
    { value: '08:00', label: '08:00' },
    { value: '08:30', label: '08:30' },
    { value: '09:00', label: '09:00' },
    { value: '09:30', label: '09:30' },
    { value: '10:00', label: '10:00' },
    { value: '10:30', label: '10:30' },
    { value: '11:00', label: '11:00' },
    { value: '11:30', label: '11:30' },
    { value: '12:00', label: '12:00' },
    { value: '12:30', label: '12:30' },
    { value: '13:00', label: '13:00' },
    { value: '13:30', label: '13:30' },
    { value: '14:00', label: '14:00' },
    { value: '14:30', label: '14:30' },
    { value: '15:00', label: '15:00' },
    { value: '15:30', label: '15:30' },
    { value: '16:00', label: '16:00' },
    { value: '16:30', label: '16:30' },
    { value: '17:00', label: '17:00' },
    { value: '17:30', label: '17:30' },
    { value: '18:00', label: '18:00' }
  ];

  constructor(
    private fb: FormBuilder,
    private missionService: MissionService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.missionForm = this.fb.group({
      depart: ['', Validators.required],
      destination: ['', Validators.required],
      dateMission: ['', Validators.required],
      heureMission: ['', Validators.required],
      typeMission: ['', Validators.required],
      instructions: [''],
      chauffeurId: [''],
      vehiculeId: ['']
    });
  }

  ngOnInit(): void {
    this.setCurrentEmployee();
    this.loadFormData();
  }

  setCurrentEmployee(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      // Try to get name from auth response first
      if (currentUser.nom && currentUser.prenom) {
        this.currentEmployeeName = `${currentUser.nom} ${currentUser.prenom}`;
      } else {
        // Fallback: fetch employee details from backend
        this.fetchEmployeeDetails();
      }
    }
  }

  fetchEmployeeDetails(): void {
    const employeeId = this.getCurrentEmployeeId();
    console.log('Fetching employee details for ID:', employeeId);
    if (employeeId) {
      this.http.get<any>(`http://localhost:8080/api/employes/${employeeId}`).subscribe({
        next: (employee) => {
          console.log('Employee details received:', employee);
          if (employee && employee.nom && employee.prenom) {
            this.currentEmployeeName = `${employee.nom} ${employee.prenom}`;
            console.log('Employee name set to:', this.currentEmployeeName);
          } else {
            console.warn('Employee data incomplete:', employee);
            this.currentEmployeeName = 'Employé';
          }
        },
        error: (error) => {
          console.error('Error fetching employee details:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.currentEmployeeName = 'Employé';
        }
      });
    } else {
      console.warn('No employee ID found');
      this.currentEmployeeName = 'Employé';
    }
  }

  loadFormData(): void {
    this.loading = true;
    this.error = null;
    
    this.missionService.getMissionFormData().subscribe({
      next: (data) => {
        this.formData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading form data:', error);
        this.error = `Erreur lors du chargement des données: ${error.status || 'Connexion impossible'}`;
        this.loading = false;
      }
    });
  }

  getCurrentEmployeeId(): number {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.employeId) {
      return currentUser.employeId;
    }
    return currentUser?.id || 0;
  }

  onSubmit(): void {
    if (this.missionForm.valid) {
      this.submitting = true;
      this.error = null;

      const formValue = this.missionForm.value;
      
      // Combine date and time into a single datetime
      const missionDate = new Date(formValue.dateMission);
      const [hours, minutes] = formValue.heureMission.split(':');
      missionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const request: CreateMissionRequest = {
        destination: formValue.destination,
        depart: formValue.depart,
        dateHeure: missionDate.toISOString(),
        typeMission: formValue.typeMission,
        instructions: formValue.instructions || undefined,
        employeId: this.getCurrentEmployeeId(), // Use current employee ID
        chauffeurId: formValue.chauffeurId ? parseInt(formValue.chauffeurId) : undefined,
        vehiculeId: formValue.vehiculeId ? parseInt(formValue.vehiculeId) : undefined
      };

      this.missionService.createMission(request).subscribe({
        next: (response) => {
          console.log('Mission created successfully:', response);
          alert('Mission créée avec succès!');
          this.router.navigate(['/employee/dashboard']);
        },
        error: (error) => {
          console.error('Error creating mission:', error);
          this.error = error.error?.error || 'Erreur lors de la création de la mission';
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employee/dashboard']);
  }

  getChauffeurName(chauffeur: any): string {
    return (chauffeur.nom && chauffeur.prenom) ? `${chauffeur.nom} ${chauffeur.prenom}` : `Chauffeur #${chauffeur.id}`;
  }

  getVehiculeDisplay(vehicule: any): string {
    return `${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation})`;
  }

}
