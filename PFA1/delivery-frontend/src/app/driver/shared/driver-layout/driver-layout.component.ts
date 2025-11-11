import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationCenterComponent } from '../../components/notification-center.component';
import { LeaveNotificationPopupComponent } from '../../components/leave-notification-popup.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-driver-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    NotificationCenterComponent,
    LeaveNotificationPopupComponent
  ],
  templateUrl: './driver-layout.component.html',
  styleUrls: ['./driver-layout.component.scss']
})
export class DriverLayoutComponent implements OnInit {
  currentView = 'mes-missions';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set initial view based on current route
    const currentRoute = this.router.url;
    if (currentRoute.includes('/dashboard')) {
      this.currentView = 'dashboard';
    } else if (currentRoute.includes('/planning')) {
      this.currentView = 'planning';
    } else if (currentRoute.includes('/historique')) {
      this.currentView = 'historique';
    } else if (currentRoute.includes('/conge')) {
      this.currentView = 'conge';
    } else if (currentRoute.includes('/profile')) {
      this.currentView = 'profile';
    } else if (currentRoute.includes('/mes-missions')) {
      this.currentView = 'mes-missions';
    } else {
      this.currentView = 'dashboard';
    }
  }

  navigateToDashboard(): void {
    this.currentView = 'dashboard';
    this.router.navigate(['/driver/dashboard']);
  }

  navigateToMissions(): void {
    this.currentView = 'mes-missions';
    this.router.navigate(['/driver/mes-missions']);
  }

  navigateToPlanning(): void {
    this.currentView = 'planning';
    this.router.navigate(['/driver/planning']);
  }

  navigateToHistorique(): void {
    this.currentView = 'historique';
    this.router.navigate(['/driver/historique']);
  }

  navigateToConge(): void {
    this.currentView = 'conge';
    this.router.navigate(['/driver/conge']);
  }

  navigateToProfile(): void {
    this.currentView = 'profile';
    this.router.navigate(['/driver/profile']);
  }

  getPageTitle(): string {
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard Chauffeur',
      'mes-missions': 'Mes Missions',
      'planning': 'Planning',
      'historique': 'Historique des Missions',
      'conge': 'Demandes de Congé',
      'profile': 'Mon Profil'
    };
    return titles[this.currentView] || 'Dashboard Chauffeur';
  }

  getPageSubtitle(): string {
    const subtitles: { [key: string]: string } = {
      'dashboard': 'Vue d\'ensemble de vos activités',
      'mes-missions': 'Missions d\'aujourd\'hui',
      'planning': 'Emploi du temps de la semaine',
      'historique': 'Historique de vos missions',
      'conge': 'Gérez vos demandes d\'indisponibilité',
      'profile': 'Gérez vos informations personnelles'
    };
    return subtitles[this.currentView] || 'Gérez vos missions et votre planning';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
