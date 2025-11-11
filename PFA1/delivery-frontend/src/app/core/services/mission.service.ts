import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateMissionRequest {
  destination: string;
  depart: string;
  dateHeure: string;
  typeMission: string;
  instructions?: string;
  employeId: number;
  chauffeurId?: number;
  vehiculeId?: number;
}

export interface MissionFormData {
  chauffeurs: ChauffeurDTO[];
  employes: EmployeDTO[];
  vehicules: VehiculeDTO[];
}

export interface EmployeDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

export interface ChauffeurDTO {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  actif: boolean;
  vehiculeInfo?: string;
}

export interface VehiculeDTO {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  capacite: number;
  disponible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  createMission(request: CreateMissionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-mission`, request);
  }

  getMissionFormData(): Observable<MissionFormData> {
    console.log('Calling API:', `${this.apiUrl}/mission-form-data`);
    return this.http.get<MissionFormData>(`${this.apiUrl}/mission-form-data`);
  }
}
