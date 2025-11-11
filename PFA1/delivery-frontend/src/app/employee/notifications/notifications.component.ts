import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { EmployeeDashboardService, Notification } from '../services/employee-dashboard.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(
    private router: Router,
    private dashboardService: EmployeeDashboardService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.dashboardService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'mission': return 'assignment';
      case 'alert': return 'warning';
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'info':
      default: return 'info';
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date non définie';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  markNotificationAsRead(notificationId: number): void {
    this.dashboardService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        // Update the notification in the local array
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.lue = true;
        }
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.lue);
  }

  markAllAsRead(): void {
    const unreadNotifications = this.notifications.filter(n => !n.lue);
    unreadNotifications.forEach(notification => {
      this.markNotificationAsRead(notification.id);
    });
  }

  goBack(): void {
    this.router.navigate(['/employee/dashboard']);
  }
}
