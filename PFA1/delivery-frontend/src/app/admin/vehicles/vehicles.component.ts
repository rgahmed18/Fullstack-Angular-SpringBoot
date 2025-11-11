import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteVehicleDialogComponent } from './confirm-delete-vehicle-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { AddEditVehicleComponent } from './add-edit-vehicle/add-edit-vehicle.component';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  loading = false;
  displayedColumns: string[] = ['immatriculation', 'marque', 'modele', 'capacite', 'disponible', 'chauffeur', 'actions'];

  constructor(
    private vehicleService: VehicleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading = true;
    this.vehicleService.getAllVehicles().subscribe({
      next: (vehicles: Vehicle[]) => {
        this.vehicles = vehicles;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading vehicles:', error);
        this.snackBar.open('Erreur lors du chargement des véhicules', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  addVehicle() {
    const dialogRef = this.dialog.open(AddEditVehicleComponent, {
      width: '600px',
      data: { vehicle: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVehicles();
        this.snackBar.open('Véhicule ajouté avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  editVehicle(vehicle: Vehicle) {
    const dialogRef = this.dialog.open(AddEditVehicleComponent, {
      width: '600px',
      data: { vehicle: { ...vehicle }, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVehicles();
        this.snackBar.open('Véhicule modifié avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  deleteVehicle(vehicle: Vehicle) {
    const dialogRef = this.dialog.open(ConfirmDeleteVehicleDialogComponent, {
      width: '500px',
      data: {
        vehicle: {
          id: vehicle.id!,
          immatriculation: vehicle.immatriculation,
          marque: vehicle.marque,
          modele: vehicle.modele,
          chauffeur: vehicle.chauffeur,
          isInActiveMission: vehicle.isInActiveMission,
          currentMissionStatus: vehicle.currentMissionStatus
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vehicleService.deleteVehicle(vehicle.id!).subscribe({
          next: () => {
            this.loadVehicles();
            this.snackBar.open('Véhicule supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error: any) => {
            console.error('Error deleting vehicle:', error);
            this.snackBar.open('Erreur lors de la suppression du véhicule', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  getChauffeurName(vehicle: Vehicle): string {
    if (vehicle.isInActiveMission && vehicle.chauffeur) {
      return `${vehicle.chauffeur.nom} ${vehicle.chauffeur.prenom}`;
    } else if (vehicle.chauffeur && !vehicle.isInActiveMission) {
      return `${vehicle.chauffeur.nom} ${vehicle.chauffeur.prenom}`;
    }
    return 'Non assigné';
  }

  getChauffeurStatus(vehicle: Vehicle): string {
    if (vehicle.isInActiveMission && vehicle.currentMissionStatus) {
      switch (vehicle.currentMissionStatus) {
        case 'COMMENCEE':
          return 'En mission (Commencée)';
        case 'EN_COURS':
          return 'En mission (En cours)';
        default:
          return 'En mission';
      }
    } else if (vehicle.chauffeur && !vehicle.isInActiveMission) {
      return 'Assigné (Disponible)';
    }
    return 'Non assigné';
  }

  getStatusColor(vehicle: Vehicle): string {
    if (vehicle.isInActiveMission) {
      return 'accent'; // Orange/yellow for active mission
    } else if (vehicle.chauffeur) {
      return 'primary'; // Blue for assigned but available
    }
    return 'warn'; // Red/gray for unassigned
  }
}
