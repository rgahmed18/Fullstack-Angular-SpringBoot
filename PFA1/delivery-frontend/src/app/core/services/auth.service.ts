import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map} from 'rxjs/operators';

interface UserResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  userType: string;
  employeId?: number;
  chauffeurId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserResponse | null>;
  public currentUser: Observable<UserResponse | null>;

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<UserResponse | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<UserResponse> {
    return this.http.post<{ user: UserResponse; token: string }>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(({ user, token }) => {
        if (user && token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', token);
          this.currentUserSubject.next(user);
        }
      }),
      map(({ user }) => user)
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    const token = localStorage.getItem('token');
    return !!(user && token);
  }

  isAuthenticatedForRole(role: string): boolean {
    const currentUser = this.currentUserValue;
    return !!currentUser && currentUser.userType === role;
  }

  getUserRole(): string {
    return this.currentUserValue?.userType || '';
  }

  // Get current user data
  getCurrentUser(): UserResponse | null {
    return this.currentUserValue;
  }

  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if token exists and is valid format
  hasValidToken(): boolean {
    const token = this.getToken();
    return !!(token && token.length > 0);
  }

  // Force clear all authentication data
  clearAuthData(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }
}
