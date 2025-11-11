import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChauffeurDTO } from './mission.service';

export interface DashboardStats {
  totalMissions: number;
  totalChauffeurs: number;
  totalVehicules: number;
  totalEmployes: number;
  availableVehicules: number;
  activeMissions: number;
}

export interface RecentActivity {
  id: number;
  type: 'mission' | 'chauffeur' | 'vehicule' | 'employe';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'new' | 'warning' | 'info';
}

export interface MissionResponseDTO {
  id: number;
  destination: string;
  depart: string;
  dateHeure: string;
  typeMission: string;
  instructions?: string;
  etat: string;
  probleme?: string;
  employe?: {
    id: number;
    nom: string;
    prenom: string;
  };
  chauffeur?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/admin/dashboard/stats`);
  }

  getRecentActivity(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/admin/dashboard/recent-activity`);
  }

  // Individual count methods as fallback
  getMissionsCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/admin/missions/count`);
  }

  getChauffeursCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/admin/chauffeurs/count`);
  }

  getVehiculesCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/admin/vehicules/count`);
  }

  getEmployesCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/admin/employes/count`);
  }

  // Get all missions for admin dashboard - using admin endpoint
  getAllMissions(): Observable<MissionResponseDTO[]> {
    return this.http.get<MissionResponseDTO[]>(`${this.apiUrl}/admin/missions`);
  }

  // Get recent missions (last 10) - fallback to all missions
  getRecentMissions(): Observable<MissionResponseDTO[]> {
    // Since /admin/missions/recent might not exist, use all missions and filter in frontend
    return this.getAllMissions();
  }

  // Get missions with problems (for reassignment)
  getMissionsWithProblems(): Observable<MissionResponseDTO[]> {
    return this.http.get<MissionResponseDTO[]>(`${this.apiUrl}/admin/missions/with-problems`);
  }

  // Reassign mission to new driver
  reassignMission(missionId: number, chauffeurId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/missions/${missionId}/reassign/${chauffeurId}`, {});
  }

  // Get available drivers for reassignment
  getAvailableDrivers(): Observable<ChauffeurDTO[]> {
    return this.http.get<ChauffeurDTO[]>(`${this.apiUrl}/admin/chauffeurs`);
  }
}
