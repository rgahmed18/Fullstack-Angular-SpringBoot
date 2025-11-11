import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../../models/employee.model';

export interface EmployeeResponseDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateEmbauche: string;
  actif: boolean;
}

export interface MissionSummary {
  id: number;
  destination: string;
  depart: string;
  dateHeure: string;
  etat: string;
  typeMission: string;
  description?: string;
  chauffeurNom?: string;
  chauffeurPrenom?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees';
  private adminApiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  addEmployeeAsAdmin(employeRegistration: any): Observable<any> {
    return this.http.post<any>(`${this.adminApiUrl}/create-employe`, employeRegistration);
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // Admin methods for employee management
  getAllEmployees(): Observable<EmployeeResponseDTO[]> {
    return this.http.get<EmployeeResponseDTO[]>(`${this.adminApiUrl}/employes`);
  }

  getEmployeeMissions(employeeId: number): Observable<MissionSummary[]> {
    return this.http.get<MissionSummary[]>(`${this.adminApiUrl}/employes/${employeeId}/missions`);
  }

  // Get employee by ID (admin only)
  getEmployeeById(id: number): Observable<EmployeeResponseDTO> {
    return this.http.get<EmployeeResponseDTO>(`${this.adminApiUrl}/employes/${id}`);
  }

  // Update employee (admin only)
  updateEmployee(id: number, employeeData: any): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/employes/${id}`, employeeData);
  }

  // Delete employee (admin only)
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.adminApiUrl}/employes/${id}`);
  }
}
