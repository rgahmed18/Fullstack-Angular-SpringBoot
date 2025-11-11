import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ChauffeurDTO } from '../../core/services/mission.service';

export interface MissionResponseDTO {
  id: number;
  destination: string;
  depart: string;
  lieuDepart?: string;
  lieuArrivee?: string;
  dateHeure: string;
  dateDepart?: string;
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
}

export interface DashboardStats {
  totalMissions: number;
  activeMissions: number;
  pendingMissions: number;
  completedMissions: number;
  unreadNotifications: number;
}

export interface Notification {
  id: number;
  message: string;
  dateCreation: string;
  lue: boolean;
  lu?: boolean;
  type?: string;
}

export interface EmployeeInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateEmbauche: string;
  actif: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeDashboardService {
  private apiUrl = 'http://localhost:8080/api/employes';

  getEmployeeProfile(employeeId: number): Observable<any> {
    return this.http.get(`http://localhost:8080/api/admin/employes/${employeeId}`);
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getCurrentEmployeeId(): number {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.employeId) {
      return currentUser.employeId;
    }
    // Fallback to user ID if employeId is not available
    return currentUser?.id || 0;
  }

  getDashboardStats(): Observable<DashboardStats> {
    const employeeId = this.getCurrentEmployeeId();
    console.log('Getting dashboard stats for employee ID:', employeeId);
    return this.http.get<DashboardStats>(`${this.apiUrl}/${employeeId}/dashboard/stats`);
  }

  getMissions(): Observable<MissionResponseDTO[]> {
    const employeeId = this.getCurrentEmployeeId();
    return this.http.get<MissionResponseDTO[]>(`${this.apiUrl}/${employeeId}/missions`);
  }

  getNotifications(): Observable<Notification[]> {
    const employeeId = this.getCurrentEmployeeId();
    return this.http.get<Notification[]>(`${this.apiUrl}/${employeeId}/notifications`);
  }

  getNotificationHistory(): Observable<Notification[]> {
    const employeeId = this.getCurrentEmployeeId();
    return this.http.get<Notification[]>(`${this.apiUrl}/${employeeId}/notifications/historique`);
  }

  markNotificationAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/notification/${notificationId}/lue`, {});
  }

  // Get missions with problems assigned to current employee (for reassignment)
  getMissionsWithProblems(): Observable<MissionResponseDTO[]> {
    const employeId = this.getCurrentEmployeeId();
    return this.http.get<MissionResponseDTO[]>(`${this.apiUrl}/${employeId}/missions/with-problems`);
  }

  // Get available drivers for reassignment
  getAvailableDrivers(): Observable<ChauffeurDTO[]> {
    return this.http.get<ChauffeurDTO[]>(`http://localhost:8080/api/admin/chauffeurs`);
  }

  // Reassign mission to new driver
  reassignMission(missionId: number, chauffeurId: number): Observable<any> {
    const employeId = this.getCurrentEmployeeId();
    return this.http.post(`http://localhost:8080/api/employes/${employeId}/missions/${missionId}/reassign/${chauffeurId}`, {});
  }

  // Get employee details by ID
  getEmployeeById(employeeId: number): Observable<EmployeeInfo> {
    return this.http.get<EmployeeInfo>(`http://localhost:8080/api/admin/employes/${employeeId}`);
  }
}
