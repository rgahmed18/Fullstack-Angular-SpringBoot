import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { NotificationCenterComponent } from '../components/notification-center.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    NotificationCenterComponent
  ],
  template: `
    <div class="employee-layout">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <mat-icon class="logo-icon">business</mat-icon>
            <div class="logo-text">
              <h2>CDG Delivery</h2>
              <p>Espace Employé</p>
            </div>
          </div>
        </div>

        <div class="nav-section">
          <p class="nav-title">NAVIGATION</p>
          <nav class="sidebar-nav">
            <a routerLink="/employee/dashboard" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>dashboard</mat-icon>
              <span>Tableau de Bord</span>
            </a>
            <a routerLink="/employee/missions" class="nav-item" routerLinkActive="active">
              <mat-icon>assignment</mat-icon>
              <span>Mes Missions</span>
            </a>
            <a routerLink="/employee/historique" class="nav-item" routerLinkActive="active">
              <mat-icon>history</mat-icon>
              <span>Historique</span>
            </a>
          </nav>
          
          <!-- User profile and logout moved to bottom -->
          <div class="sidebar-footer">
            <div class="user-profile">
              <div class="user-avatar">
                <mat-icon>person</mat-icon>
              </div>
              <div class="user-info">
                <p class="user-name">{{employeeName}}</p>
                <p class="user-role">CDG Delivery</p>
              </div>
            </div>
            <button mat-button class="logout-btn" (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <div class="content-header">
          <div class="page-title">
            <h1>{{getPageTitle()}}</h1>
            <p>{{getPageSubtitle()}}</p>
          </div>
          <div class="header-actions">
            <app-notification-center></app-notification-center>
          </div>
        </div>
        
        <!-- Router Outlet for Dynamic Content -->
        <div class="content-body">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./employee-layout.component.scss']
})
export class EmployeeLayoutComponent {
  employeeName = 'Employé';
  currentRoute = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.loadEmployeeInfo();
    this.trackRouteChanges();
  }

  loadEmployeeInfo(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.employeeName = `${currentUser.nom || ''} ${currentUser.prenom || ''}`.trim() || 'Employé';
    }
  }

  trackRouteChanges(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  getPageTitle(): string {
    if (this.currentRoute.includes('/employee/missions')) {
      return 'Mes Missions';
    } else if (this.currentRoute.includes('/employee/historique')) {
      return 'Historique des Missions';
    } else if (this.currentRoute.includes('/employee/create-mission')) {
      return 'Nouvelle Mission';
    } else {
      return 'Tableau de Bord Employé';
    }
  }

  getPageSubtitle(): string {
    if (this.currentRoute.includes('/employee/missions')) {
      return 'Gérez vos missions en cours et à venir';
    } else if (this.currentRoute.includes('/employee/historique')) {
      return 'Consultez l\'historique de toutes vos missions terminées';
    } else if (this.currentRoute.includes('/employee/create-mission')) {
      return 'Créer une nouvelle demande de mission';
    } else {
      return 'Gérez vos missions et suivez votre activité';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
