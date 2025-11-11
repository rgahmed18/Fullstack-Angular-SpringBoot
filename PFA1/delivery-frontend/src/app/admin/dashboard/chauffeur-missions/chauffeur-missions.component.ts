import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChauffeurService } from '../../../core/services/chauffeur.service';

export interface MissionData {
  id: number;
  destination: string;
  depart: string;
  dateHeure: string;
  typeMission: string;
  instructions?: string;
  etat: string;
  employe?: {
    id: number;
    nom: string;
    prenom: string;
  };
  vehicule?: {
    id: number;
    immatriculation: string;
    marque: string;
    modele: string;
  };
  probleme?: string;
  acceptee: boolean;
}

@Component({
  selector: 'app-chauffeur-missions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './chauffeur-missions.component.html',
  styleUrls: ['./chauffeur-missions.component.scss']
})
export class ChauffeurMissionsComponent implements OnInit {
  chauffeurId: number | null = null;
  chauffeurNom: string = '';
  chauffeurPrenom: string = '';
  isLoading = false;
  
  allMissions: MissionData[] = [];
  pendingMissions: MissionData[] = [];
  activeMissions: MissionData[] = [];
  completedMissions: MissionData[] = [];
  refusedMissions: MissionData[] = [];
  currentTabMissions: MissionData[] = [];
  selectedTabIndex: number = 0;

  displayedColumns: string[] = ['id', 'route', 'type', 'employe', 'dateHeure', 'status'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chauffeurService: ChauffeurService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.chauffeurId = +params['id'];
    });

    this.route.queryParams.subscribe(params => {
      this.chauffeurNom = params['nom'] || '';
      this.chauffeurPrenom = params['prenom'] || '';
    });

    if (this.chauffeurId) {
      this.loadChauffeurMissions();
    }
  }

  loadChauffeurMissions(): void {
    if (!this.chauffeurId) return;

    this.isLoading = true;
    this.chauffeurService.getChauffeurMissions(this.chauffeurId).subscribe({
      next: (missions) => {
        this.allMissions = missions;
        this.categorizeMissions(missions);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chauffeur missions:', error);
        this.snackBar.open('Erreur lors du chargement des missions', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  categorizeMissions(missions: MissionData[]): void {
    this.pendingMissions = missions.filter(m => m.etat === 'EN_ATTENTE');
    this.activeMissions = missions.filter(m => m.etat === 'COMMENCEE' || m.etat === 'EN_COURS');
    this.completedMissions = missions.filter(m => m.etat === 'TERMINEE');
    this.refusedMissions = missions.filter(m => m.etat === 'REFUSEE');
    
    // Set initial tab data
    this.updateCurrentTabMissions();
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    this.updateCurrentTabMissions();
  }

  updateCurrentTabMissions(): void {
    switch (this.selectedTabIndex) {
      case 0: // All missions
        this.currentTabMissions = this.allMissions;
        break;
      case 1: // Pending missions
        this.currentTabMissions = this.pendingMissions;
        break;
      case 2: // Active missions
        this.currentTabMissions = this.activeMissions;
        break;
      case 3: // Completed missions
        this.currentTabMissions = this.completedMissions;
        break;
      default:
        this.currentTabMissions = this.allMissions;
    }
  }

  getEmptyStateIcon(): string {
    switch (this.selectedTabIndex) {
      case 0: return 'assignment';
      case 1: return 'schedule';
      case 2: return 'directions_car';
      case 3: return 'check_circle';
      default: return 'assignment';
    }
  }

  getEmptyStateTitle(): string {
    switch (this.selectedTabIndex) {
      case 0: return 'Aucune mission';
      case 1: return 'Aucune mission en attente';
      case 2: return 'Aucune mission en cours';
      case 3: return 'Aucune mission terminée';
      default: return 'Aucune mission';
    }
  }

  getEmptyStateMessage(): string {
    switch (this.selectedTabIndex) {
      case 0: return 'Ce chauffeur n\'a pas encore de missions assignées.';
      case 1: return 'Toutes les missions ont été traitées.';
      case 2: return 'Aucune mission n\'est actuellement en cours d\'exécution.';
      case 3: return 'Aucune mission n\'a encore été terminée.';
      default: return 'Ce chauffeur n\'a pas encore de missions assignées.';
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/chauffeurs']);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'COMMENCEE': return 'Commencée';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'REFUSEE': return 'Refusée';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'status-pending';
      case 'COMMENCEE': 
      case 'EN_COURS': return 'status-active';
      case 'TERMINEE': return 'status-completed';
      case 'REFUSEE': return 'status-refused';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'schedule';
      case 'COMMENCEE': return 'play_arrow';
      case 'EN_COURS': return 'directions_car';
      case 'TERMINEE': return 'check_circle';
      case 'REFUSEE': return 'cancel';
      default: return 'help';
    }
  }

  getTypeIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'documents': return 'description';
      case 'matériel': 
      case 'materiel': return 'build';
      case 'personnel': return 'person';
      default: return 'local_shipping';
    }
  }

  getTypeClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'documents': return 'type-documents';
      case 'matériel': 
      case 'materiel': return 'type-materiel';
      case 'personnel': return 'type-personnel';
      default: return 'type-default';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  formatRoute(mission: MissionData): string {
    return `${mission.depart} → ${mission.destination}`;
  }

  formatEmploye(employe?: { nom: string; prenom: string }): string {
    if (!employe) return 'Non assigné';
    return `${employe.prenom} ${employe.nom}`;
  }

  formatVehicule(mission: MissionData): string {
    if (!mission.vehicule || !mission.vehicule.immatriculation) return 'Non assigné';
    const marque = mission.vehicule.marque || '';
    const modele = mission.vehicule.modele || '';
    const immat = mission.vehicule.immatriculation || '';
    return `${marque} ${modele} (${immat})`.trim();
  }

  viewMissionDetails(mission: MissionData): void {
    // TODO: Implement mission details view
    this.snackBar.open(`Détails de la mission #${mission.id}`, 'Fermer', {
      duration: 3000
    });
  }
}
