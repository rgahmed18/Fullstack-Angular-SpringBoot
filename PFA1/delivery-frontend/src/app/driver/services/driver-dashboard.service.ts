import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

export interface MissionResponseDTO {
  id: number;
  destination: string;
  depart: string;
  dateHeure: string;
  typeMission: string;
  instructions: string;
  etat: string;
  chauffeurNom: string;
  chauffeurPrenom: string;
  chauffeurTelephone: string;
  vehiculeImmatriculation: string;
  vehiculeMarque: string;
  vehiculeModele: string;
  probleme: string;
  acceptee: boolean;
  employeNom?: string;
  employePrenom?: string;
}

export interface DashboardStats {
  totalMissions: number;
  activeMissions: number;
  pendingMissions: number;
  completedMissions: number;
  refusedMissions: number;
  successRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class DriverDashboardService {
  private apiUrl = 'http://localhost:8080/api/chauffeurs';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getChauffeurProfile(chauffeurId: number): Observable<any> {
    return this.http.get(`http://localhost:8080/api/admin/chauffeurs/${chauffeurId}`);
  }

  private getCurrentChauffeurId(): number {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.chauffeurId) {
      return currentUser.chauffeurId;
    }
    // Fallback to user ID if chauffeurId is not available
    return currentUser?.id || 0;
  }

  getDashboardStats(): Observable<DashboardStats> {
    const chauffeurId = this.getCurrentChauffeurId();
    return this.http.get<DashboardStats>(`${this.apiUrl}/${chauffeurId}/dashboard/stats`);
  }

  getMissions(): Observable<MissionResponseDTO[]> {
    const chauffeurId = this.getCurrentChauffeurId();
    return this.http.get<MissionResponseDTO[]>(`${this.apiUrl}/${chauffeurId}/missions`);
  }

  // Accept mission - driver accepts assigned mission
  acceptMission(missionId: number): Observable<MissionResponseDTO> {
    const chauffeurId = this.getCurrentChauffeurId();
    return this.http.post<MissionResponseDTO>(`http://localhost:8080/api/missions/${missionId}/accepter`, null, {
      params: { chauffeurId: chauffeurId.toString() }
    });
  }

  // Start mission - driver starts the mission
  startMission(missionId: number): Observable<MissionResponseDTO> {
    return this.http.post<MissionResponseDTO>(`http://localhost:8080/api/missions/${missionId}/commencer`, {});
  }

  // Complete mission
  completeMission(missionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/missions/${missionId}/complete`, {});
  }

  // Report problem
  reportProblem(missionId: number, probleme: string): Observable<any> {
    return this.http.post(`http://localhost:8080/api/missions/${missionId}/signaler-probleme`, probleme, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Refuse mission - driver refuses mission with reason
  refuseMission(missionId: number, reason: string): Observable<MissionResponseDTO> {
    return this.http.post<MissionResponseDTO>(`http://localhost:8080/api/missions/${missionId}/refuser`, reason, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Get missions assigned to current driver
  getDriverMissions(): Observable<MissionResponseDTO[]> {
    const chauffeurId = this.getCurrentChauffeurId();
    return this.http.get<MissionResponseDTO[]>(`http://localhost:8080/api/missions/chauffeur/${chauffeurId}`);
  }

  // Get pending missions (waiting for driver acceptance)
  getPendingMissions(): Observable<MissionResponseDTO[]> {
    return this.http.get<MissionResponseDTO[]>(`http://localhost:8080/api/missions/en-attente`);
  }
}
