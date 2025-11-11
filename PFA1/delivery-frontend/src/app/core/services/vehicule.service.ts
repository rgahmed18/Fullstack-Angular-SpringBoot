import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  private apiEndpoint = `${environment.apiUrl}/admin/create-vehicule`;

  constructor(private http: HttpClient) {}

  addVehiculeAsAdmin(vehiculeData: any): Observable<any> {
    // Format the data to match the backend VehiculeRegistrationDTO
    const vehiculeDTO = {
      immatriculation: vehiculeData.immatriculation,
      marque: vehiculeData.marque,
      modele: vehiculeData.modele,
      capacite: vehiculeData.capacite,
      disponible: vehiculeData.disponible
    };
    
    // Since the endpoint is public, no authentication headers needed
    return this.http.post<any>(this.apiEndpoint, vehiculeDTO, { 
      observe: 'response',
      responseType: 'json'
    }).pipe(
      map((response: HttpResponse<any>) => response.body)
    );
  }
}
