import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { PlacesAutocompleteComponent } from '../../../shared/components/places-autocomplete/places-autocomplete.component';

interface Mission {
  id: number;
  depart: string;
  destination: string;
  dateHeure: string;
  etat: string;
  typeMission: string;
  chauffeur?: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
  };
  vehicule?: {
    id: number;
    immatriculation: string;
    marque: string;
    modele: string;
  };
  employe?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

interface Chauffeur {
  id: number;
  nom: string;
  prenom: string;
}

interface Vehicule {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
}

interface Employe {
  id: number;
  nom: string;
  prenom: string;
}

@Component({
  selector: 'app-edit-mission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PlacesAutocompleteComponent
  ],
  templateUrl: './edit-mission.component.html',
  styleUrls: ['./edit-mission.component.scss']
})
export class EditMissionComponent implements OnInit {
  editMissionForm: FormGroup;
  isLoading = false;
  missionId: number;
  mission: Mission | null = null;
  chauffeurs: Chauffeur[] = [];
  vehicules: Vehicule[] = [];
  employes: Employe[] = [];

  typeMissions = [
    { value: 'materiel', label: 'Matériel' },
    { value: 'document', label: 'Document' },
    { value: 'personnel', label: 'Personnel' }
  ];

  etats = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'ACCEPTEE', label: 'Acceptée' },
    { value: 'COMMENCEE', label: 'Commencée' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINEE', label: 'Terminée' },
    { value: 'REFUSEE', label: 'Refusée' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.editMissionForm = this.fb.group({
      depart: ['', Validators.required],
      destination: ['', Validators.required],
      dateHeure: ['', Validators.required],
      etat: ['', Validators.required],
      typeMission: ['', Validators.required],
      chauffeurId: [''],
      vehiculeId: [''],
      employeId: ['']
    });

    this.missionId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadFormData();
    this.loadMissionData();
  }

  loadMissionData(): void {
    this.isLoading = true;
    this.adminService.getMissionById(this.missionId).subscribe({
      next: (mission) => {
        this.mission = mission;
        // Populate form after all data is loaded
        this.populateFormWhenReady(mission);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading mission:', error);
        this.snackBar.open('Erreur lors du chargement de la mission', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  loadFormData(): void {
    let loadedCount = 0;
    const totalLoads = 3;

    // Load chauffeurs
    this.adminService.getChauffeurs().subscribe({
      next: (chauffeurs) => {
        console.log('Chauffeurs loaded:', chauffeurs);
        this.chauffeurs = chauffeurs;
        loadedCount++;
        this.checkIfAllDataLoaded(loadedCount, totalLoads);
      },
      error: (error) => {
        console.error('Error loading chauffeurs:', error);
        loadedCount++;
        this.checkIfAllDataLoaded(loadedCount, totalLoads);
      }
    });

    // Load vehicules
    this.adminService.getVehicles().subscribe({
      next: (vehicules) => {
        console.log('Vehicules loaded:', vehicules);
        this.vehicules = vehicules;
        loadedCount++;
        this.checkIfAllDataLoaded(loadedCount, totalLoads);
      },
      error: (error) => {
        console.error('Error loading vehicules:', error);
        loadedCount++;
        this.checkIfAllDataLoaded(loadedCount, totalLoads);
      }
    });

    // Load employes
    this.adminService.getEmployees().subscribe({
      next: (employes) => {
        console.log('Employes loaded:', employes);
        this.employes = employes;
        loadedCount++;
        this.checkIfAllDataLoaded(loadedCount, totalLoads);
      },
      error: (error) => {
        console.error('Error loading employes:', error);
        loadedCount++;
        this.checkIfAllDataLoaded(loadedCount, totalLoads);
      }
    });
  }

  private allDataLoaded = false;

  checkIfAllDataLoaded(loadedCount: number, totalLoads: number): void {
    if (loadedCount === totalLoads) {
      this.allDataLoaded = true;
      console.log('All form data loaded, ready to populate form');
      // If mission is already loaded, populate the form now
      if (this.mission) {
        this.populateForm(this.mission);
      }
    }
  }

  populateFormWhenReady(mission: Mission): void {
    if (this.allDataLoaded) {
      this.populateForm(mission);
    } else {
      // Wait for all data to load
      const checkInterval = setInterval(() => {
        if (this.allDataLoaded) {
          this.populateForm(mission);
          clearInterval(checkInterval);
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!this.allDataLoaded) {
          console.warn('Timeout waiting for form data, populating anyway');
          this.populateForm(mission);
        }
      }, 5000);
    }
  }

  populateForm(mission: Mission): void {
    console.log('Mission data received:', mission);
    console.log('Available chauffeurs:', this.chauffeurs);
    console.log('Available vehicules:', this.vehicules);
    console.log('Available employes:', this.employes);
    
    // Debug: Check if the assigned items exist in the lists
    if (mission.chauffeur?.id) {
      const foundChauffeur = this.chauffeurs.find(c => c.id === mission.chauffeur?.id);
      console.log('Found chauffeur in list:', foundChauffeur);
    }
    if (mission.vehicule?.id) {
      const foundVehicule = this.vehicules.find(v => v.id === mission.vehicule?.id);
      console.log('Found vehicule in list:', foundVehicule);
    }
    if (mission.employe?.id) {
      const foundEmploye = this.employes.find(e => e.id === mission.employe?.id);
      console.log('Found employe in list:', foundEmploye);
    }
    
    const dateHeure = new Date(mission.dateHeure);
    
    const formData = {
      depart: mission.depart,
      destination: mission.destination,
      dateHeure: dateHeure,
      etat: mission.etat,
      typeMission: mission.typeMission,
      chauffeurId: mission.chauffeur?.id?.toString() || '',
      vehiculeId: mission.vehicule?.id?.toString() || '',
      employeId: mission.employe?.id?.toString() || ''
    };
    
    console.log('Form data to populate:', formData);
    this.editMissionForm.patchValue(formData);
    console.log('Form values after patch:', this.editMissionForm.value);
    
    // Force change detection
    setTimeout(() => {
      console.log('Final form values after timeout:', this.editMissionForm.value);
    }, 100);
  }

  onSubmit(): void {
    if (this.editMissionForm.valid) {
      this.isLoading = true;
      
      const formData = { ...this.editMissionForm.value };
      
      // Convert date to ISO string
      if (formData.dateHeure instanceof Date) {
        formData.dateHeure = formData.dateHeure.toISOString();
      }
      
      // Convert empty strings to null for optional fields
      if (!formData.chauffeurId) formData.chauffeurId = null;
      if (!formData.vehiculeId) formData.vehiculeId = null;
      if (!formData.employeId) formData.employeId = null;
      
      console.log('Submitting mission update:', formData);
      
      this.adminService.updateMission(this.missionId, formData).subscribe({
        next: (response) => {
          console.log('Mission updated successfully:', response);
          this.snackBar.open('Mission mise à jour avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/admin/missions']);
        },
        error: (error) => {
          console.error('Error updating mission:', error);
          this.snackBar.open('Erreur lors de la mise à jour de la mission', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/missions']);
  }

  goBack(): void {
    this.router.navigate(['/admin/missions']);
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
