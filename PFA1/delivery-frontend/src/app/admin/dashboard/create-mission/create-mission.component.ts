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
import { MissionService, CreateMissionRequest, MissionFormData } from '../../../core/services/mission.service';
import { PlacesAutocompleteComponent } from '../../../shared/components/places-autocomplete/places-autocomplete.component';

@Component({
  selector: 'app-create-mission',
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
  templateUrl: './create-mission.component.html',
  styleUrl: './create-mission.component.scss'
})
export class CreateMissionComponent implements OnInit {
  missionForm: FormGroup;
  formData: MissionFormData = { chauffeurs: [], employes: [], vehicules: [] };
  loading = false;
  submitting = false;
  error: string | null = null;

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
    private router: Router
  ) {
    this.missionForm = this.fb.group({
      depart: ['', Validators.required],
      destination: ['', Validators.required],
      dateMission: ['', Validators.required],
      heureMission: ['', Validators.required],
      typeMission: ['', Validators.required],
      instructions: [''],
      employeId: ['', Validators.required],
      chauffeurId: [''],
      vehiculeId: ['']
    });
  }

  ngOnInit(): void {
    this.loadFormData();
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
        console.error('Error details:', error.message);
        console.error('Error status:', error.status);
        this.error = `Erreur lors du chargement des données: ${error.status || 'Connexion impossible'}`;
        this.loading = false;
      }
    });
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
        employeId: parseInt(formValue.employeId),
        chauffeurId: formValue.chauffeurId ? parseInt(formValue.chauffeurId) : undefined,
        vehiculeId: formValue.vehiculeId ? parseInt(formValue.vehiculeId) : undefined
      };

      this.missionService.createMission(request).subscribe({
        next: (response) => {
          console.log('Mission created successfully:', response);
          // Show success message
          alert('Mission créée avec succès!');
          this.router.navigate(['/admin/dashboard']);
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
    this.router.navigate(['/admin/dashboard']);
  }

  getEmployeName(employe: any): string {
    return (employe.nom && employe.prenom) ? `${employe.nom} ${employe.prenom}` : `Employé #${employe.id}`;
  }

  getChauffeurName(chauffeur: any): string {
    return (chauffeur.nom && chauffeur.prenom) ? `${chauffeur.nom} ${chauffeur.prenom}` : `Chauffeur #${chauffeur.id}`;
  }

  getVehiculeDisplay(vehicule: any): string {
    return `${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation})`;
  }

  onDestinationSelected(place: any): void {
    console.log('Destination selected:', place);
    // The form control value is automatically updated by the component
  }

  onDepartSelected(place: any): void {
    console.log('Depart selected:', place);
    // The form control value is automatically updated by the component
  }
}
