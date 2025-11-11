import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminNotificationService, AdminNotification } from '../services/admin-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <button 
      mat-icon-button 
      [matMenuTriggerFor]="notificationMenu"
      matTooltip="Notifications"
      class="notification-button">
      <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn">
        notifications
      </mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header" (click)="$event.stopPropagation()">
        <h3>Notifications Admin</h3>
        <button 
          mat-icon-button 
          *ngIf="unreadCount > 0"
          (click)="markAllAsRead()"
          matTooltip="Marquer tout comme lu">
          <mat-icon>done_all</mat-icon>
        </button>
      </div>
      
      <mat-divider></mat-divider>
      
      <div class="notification-content" (click)="$event.stopPropagation()">
        <div *ngIf="loading" class="loading-state">
          <mat-icon>hourglass_empty</mat-icon>
          <span>Chargement...</span>
        </div>
        
        <div *ngIf="!loading && notifications.length === 0" class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <span>Aucune notification</span>
        </div>
        
        <mat-list *ngIf="!loading && notifications.length > 0" class="notification-list">
          <mat-list-item 
            *ngFor="let notification of notifications; trackBy: trackByNotificationId"
            class="notification-item"
            [class.unread]="!notification.lue"
            (click)="markAsRead(notification)">
            
            <mat-icon matListIcon [ngClass]="getNotificationIconClass(notification.type)">
              {{ getNotificationIcon(notification.type) }}
            </mat-icon>
            
            <div matListItemTitle class="notification-title">
              {{ getNotificationTitle(notification) }}
            </div>
            
            <div matListItemLine class="notification-message">
              {{ notification.message }}
            </div>
            
            <!-- Leave notification details -->
            <div matListItemLine class="notification-details" *ngIf="notification.indisponibilite">
              <span class="chauffeur-name" *ngIf="notification.chauffeurNom">
                {{ notification.chauffeurNom }}
              </span>
              <span class="leave-period">
                {{ formatDateRange(notification.indisponibilite.dateDebut, notification.indisponibilite.dateFin) }}
              </span>
              <span class="leave-type">{{ getLeaveTypeLabel(notification.indisponibilite.type) }}</span>
            </div>
            
            <div matListItemLine class="notification-time">
              {{ formatTime(notification.dateEnvoi) }}
            </div>
            
            <button 
              mat-icon-button 
              class="delete-button"
              (click)="deleteNotification(notification, $event)"
              matTooltip="Supprimer">
              <mat-icon>close</mat-icon>
            </button>
          </mat-list-item>
        </mat-list>
      </div>
      
      <mat-divider *ngIf="notifications.length > 0"></mat-divider>
      
      <div class="notification-footer" *ngIf="notifications.length > 0" (click)="$event.stopPropagation()">
        <button mat-button color="primary" (click)="viewAllNotifications()">
          Voir toutes les notifications
        </button>
      </div>
    </mat-menu>
  `,
  styles: [`
    .notification-button {
      color: #64748b;
      transition: color 0.2s ease;
    }
    
    .notification-button:hover {
      color:  #57751e ;
    }

    ::ng-deep .notification-menu {
      .mat-mdc-menu-panel {
        max-width: 400px;
        min-width: 350px;
        max-height: 500px;
      }
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, #2d2f36 0%, #57751e 100%);
      color: white;
      margin: -8px -8px 0 -8px;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .notification-content {
      max-height: 350px;
      overflow-y: auto;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      color: #64748b;
      gap: 8px;
    }

    .loading-state mat-icon, .empty-state mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .notification-list {
      padding: 0;
    }

    .notification-item {
      position: relative;
      border-bottom: 1px solid #f1f5f9;
      padding: 16px !important;
      min-height: auto !important;
      height: auto !important;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .notification-item:hover {
      background-color: #f8fafc;
    }

    .notification-item.unread {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
    }

    .notification-item.unread::before {
      content: '';
      position: absolute;
      top: 20px;
      right: 16px;
      width: 8px;
      height: 8px;
      background: #3b82f6;
      border-radius: 50%;
    }

    .notification-title {
      font-weight: 600;
      color: #1e293b;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .notification-message {
      color: #475569;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .notification-details {
      display: flex;
      gap: 12px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }

    .chauffeur-name {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .leave-period {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .leave-type {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .notification-time {
      color: #94a3b8;
      font-size: 11px;
      margin-top: 4px;
    }

    .delete-button {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .notification-item:hover .delete-button {
      opacity: 1;
    }

    .delete-button mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .notification-footer {
      padding: 12px 16px;
      text-align: center;
      background: #f8fafc;
      margin: 0 -8px -8px -8px;
    }

    .icon-success {
      color: #10b981;
    }

    .icon-warning {
      color: #f59e0b;
    }

    .icon-info {
      color: #3b82f6;
    }

    .icon-error {
      color: #ef4444;
    }
  `]
})
export class AdminNotificationCenterComponent implements OnInit, OnDestroy {
  notifications: AdminNotification[] = [];
  unreadCount = 0;
  loading = false;
  private notificationSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  constructor(private adminNotificationService: AdminNotificationService) {}

  ngOnInit() {
    this.adminNotificationService.startPolling();
    
    this.notificationSubscription = this.adminNotificationService.getNotifications().subscribe(
      notifications => {
        this.notifications = notifications.slice(0, 10); // Show last 10
      }
    );

    this.unreadCountSubscription = this.adminNotificationService.getUnreadCount().subscribe(
      count => {
        this.unreadCount = count;
      }
    );
  }

  ngOnDestroy() {
    this.adminNotificationService.stopPolling();
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
  }

  markAsRead(notification: AdminNotification) {
    if (!notification.lue) {
      this.adminNotificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.lue = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: (error: any) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  markAllAsRead() {
    if (this.unreadCount > 0) {
      this.adminNotificationService.markAllAsRead().subscribe({
        next: () => {
          this.notifications.forEach(n => n.lue = true);
          this.unreadCount = 0;
        },
        error: (error: any) => {
          console.error('Error marking all notifications as read:', error);
        }
      });
    }
  }

  deleteNotification(notification: AdminNotification, event: Event) {
    event.stopPropagation();
    
    this.adminNotificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        const index = this.notifications.findIndex(n => n.id === notification.id);
        if (index > -1) {
          this.notifications.splice(index, 1);
          if (!notification.lue) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        }
      },
      error: (error: any) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  viewAllNotifications() {
    // TODO: Navigate to full notifications page
    console.log('Navigate to all admin notifications');
  }

  trackByNotificationId(index: number, notification: AdminNotification): number {
    return notification.id;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'DEMANDE_CONGE': return 'schedule';
      case 'CONGE_ACCEPTE': return 'check_circle';
      case 'CONGE_REFUSE': return 'cancel';
      case 'MISSION_ASSIGNEE': return 'assignment';
      default: return 'info';
    }
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'DEMANDE_CONGE': return 'icon-warning';
      case 'CONGE_ACCEPTE': return 'icon-success';
      case 'CONGE_REFUSE': return 'icon-error';
      case 'MISSION_ASSIGNEE': return 'icon-info';
      default: return 'icon-info';
    }
  }

  getNotificationTitle(notification: AdminNotification): string {
    switch (notification.type) {
      case 'DEMANDE_CONGE': return 'Nouvelle demande de congé';
      case 'CONGE_ACCEPTE': return 'Congé accepté';
      case 'CONGE_REFUSE': return 'Congé refusé';
      case 'MISSION_ASSIGNEE': return 'Mission assignée';
      default: return 'Notification';
    }
  }

  getLeaveTypeLabel(type: string): string {
    switch (type) {
      case 'CONGE_ANNUEL': return 'Congé annuel';
      case 'CONGE_MALADIE': return 'Congé maladie';
      case 'CONGE_PERSONNEL': return 'Congé personnel';
      case 'CONGE_URGENCE': return 'Congé d\'urgence';
      case 'AUTRE': return 'Autre';
      default: return type;
    }
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days}j`;
    }
  }

  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startStr = start.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const endStr = end.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    
    return `${startStr} - ${endStr}`;
  }
}
