import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DemandeConge {
  id: number;
  dateDebut: string;
  dateFin: string;
  type: string;
  raison?: string;
  acceptee: boolean;
  statut: string; // EN_ATTENTE, ACCEPTEE, REFUSEE
  chauffeurId: number;
  chauffeurNom: string;
  chauffeurPrenom: string;
  chauffeurTelephone: string;
}

export interface AdminNotification {
  id: number;
  type: string;
  message: string;
  dateEnvoi: string;
  lue: boolean;
  indisponibilite?: {
    id: number;
    dateDebut: string;
    dateFin: string;
    type: string;
    raison: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // Leave request management
  getDemandesConge(): Observable<DemandeConge[]> {
    return this.http.get<DemandeConge[]>(`${this.apiUrl}/demandes-conge`);
  }

  accepterDemandeConge(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/demandes-conge/${id}/accepter`, {});
  }

  refuserDemandeConge(id: number, raison: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/demandes-conge/${id}/refuser`, { raison });
  }

  // Admin notifications
  getAdminNotifications(): Observable<AdminNotification[]> {
    return this.http.get<AdminNotification[]>(`${this.apiUrl}/notifications`);
  }

  getAdminUnreadNotificationsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/notifications/unread-count`);
  }

  markAdminNotificationAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${id}/mark-read`, {});
  }

  // Dashboard statistics
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/stats`);
  }

  getAllMissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/missions`);
  }

  getMissionsCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/missions/count`);
  }

  getChauffeursCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chauffeurs/count`);
  }

  getVehiculesCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vehicules/count`);
  }

  getEmployesCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/employes/count`);
  }

  // Mission management
  deleteMission(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/missions/${id}`);
  }

  getMissionById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/missions/${id}`);
  }

  updateMission(id: number, mission: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/missions/${id}`, mission);
  }

  createMission(mission: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/missions`, mission);
  }

  getChauffeurs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chauffeurs`);
  }

  getVehicles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vehicules`);
  }

  getEmployees(): Observable<any> {
    return this.http.get(`${this.apiUrl}/employes`);
  }
}
