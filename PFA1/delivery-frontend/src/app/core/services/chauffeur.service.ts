import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IndisponibiliteRequest {
  dateDebut: string;
  dateFin: string;
  type: string;
  raison: string;
}

export interface Indisponibilite {
  id: number;
  dateDebut: string;
  dateFin: string;
  type: string;
  raison: string;
  acceptee: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChauffeurService {
  private apiEndpoint = `${environment.apiUrl}/admin/create-chauffeur`;
  private chauffeurApiUrl = `${environment.apiUrl}/chauffeurs`;

  constructor(private http: HttpClient) {}

  addChauffeurAsAdmin(chauffeurData: any): Observable<any> {
    // Format the data to match the backend ChauffeurRegistrationDTO
    const chauffeurDTO = {
      nom: chauffeurData.nom,
      prenom: chauffeurData.prenom,
      telephone: chauffeurData.telephone,
      email: chauffeurData.email,
      password: chauffeurData.password,
      dateEmbauche: chauffeurData.dateEmbauche,
      actif: chauffeurData.actif
    };
    
    // Since the endpoint is public, no authentication headers needed
    // Set responseType to handle both JSON and text responses
    return this.http.post<any>(this.apiEndpoint, chauffeurDTO, { 
      observe: 'response',
      responseType: 'json'
    }).pipe(
      map((response: HttpResponse<any>) => response.body)
    );
  }

  // Create indisponibilite (leave request) for chauffeur
  creerIndisponibilite(chauffeurId: number, indisponibilite: IndisponibiliteRequest): Observable<Indisponibilite> {
    return this.http.post<Indisponibilite>(`${this.chauffeurApiUrl}/${chauffeurId}/indisponibilite`, indisponibilite);
  }

  // Get chauffeur's indisponibilites
  getIndisponibilites(chauffeurId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.chauffeurApiUrl}/${chauffeurId}/indisponibilites`);
  }

  // Chauffeur notification methods
  getChauffeurNotifications(chauffeurId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.chauffeurApiUrl}/${chauffeurId}/notifications`);
  }

  getChauffeurUnreadNotificationsCount(chauffeurId: number): Observable<number> {
    return this.http.get<number>(`${this.chauffeurApiUrl}/${chauffeurId}/notifications/unread-count`);
  }

  markChauffeurNotificationAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.chauffeurApiUrl}/notifications/${notificationId}/mark-read`, {});
  }

  // Get all chauffeurs for admin management
  getAllChauffeurs(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/chauffeurs`);
  }

  // Delete chauffeur
  deleteChauffeur(chauffeurId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/chauffeurs/${chauffeurId}`);
  }

  // Get missions for a specific chauffeur
  getChauffeurMissions(chauffeurId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/historique/chauffeur/${chauffeurId}`);
  }

  // Get chauffeur by ID for editing
  getChauffeurById(chauffeurId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/admin/chauffeurs/${chauffeurId}`);
  }

  // Update chauffeur
  updateChauffeur(chauffeurId: number, chauffeurData: any): Observable<any> {
    const chauffeurDTO = {
      nom: chauffeurData.nom,
      prenom: chauffeurData.prenom,
      telephone: chauffeurData.telephone,
      email: chauffeurData.email,
      password: chauffeurData.password, // Optional - will be ignored if empty
      dateEmbauche: chauffeurData.dateEmbauche,
      actif: chauffeurData.actif
    };
    
    return this.http.put<any>(`${environment.apiUrl}/admin/chauffeurs/${chauffeurId}`, chauffeurDTO);
  }
}