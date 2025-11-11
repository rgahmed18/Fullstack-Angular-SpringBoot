import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChauffeurService } from '../../core/services/chauffeur.service';
import { Subscription, interval } from 'rxjs';

export interface ChauffeurNotification {
  id: number;
  message: string;
  dateEnvoi: string;
  lue: boolean;
  type: string;
  indisponibilite?: {
    id: number;
    dateDebut: string;
    dateFin: string;
    type: string;
    raison?: string;
  };
  missionId?: number;
  missionDestination?: string;
}

@Component({
  selector: 'app-notification-center',
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
      class="notification-button"
      [class.notification-bell-pulse]="hasNewLeaveNotifications">
      <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn">
        notifications
      </mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header" (click)="$event.stopPropagation()">
        <h3>Notifications</h3>
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
              <span class="leave-period">
                {{ formatDateRange(notification.indisponibilite.dateDebut, notification.indisponibilite.dateFin) }}
              </span>
              <span class="leave-type">{{ getLeaveTypeLabel(notification.indisponibilite.type) }}</span>
            </div>
            
            <!-- Mission notification details -->
            <div matListItemLine class="notification-details" *ngIf="notification.missionId">
              <span class="mission-id">Mission #{{ notification.missionId }}</span>
              <span class="mission-destination" *ngIf="notification.missionDestination">
                {{ notification.missionDestination }}
              </span>
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
      color: #57751e ;
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

    .mission-id {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .mission-destination {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
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
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: ChauffeurNotification[] = [];
  unreadCount = 0;
  loading = false;
  hasNewLeaveNotifications: any;
  private pollingSubscription?: Subscription;
  private readonly POLLING_INTERVAL = 10000; // 10 seconds

  constructor(private chauffeurService: ChauffeurService) {}

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling() {
    // Start polling every 10 seconds for real-time updates
    this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(() => {
      this.loadNotifications();
      this.loadUnreadCount();
    });
  }

  private stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  loadNotifications() {
    this.loading = true;
    const chauffeurId = this.getChauffeurId();
    
    if (chauffeurId) {
      this.chauffeurService.getChauffeurNotifications(chauffeurId).subscribe({
        next: (notifications: any[]) => {
          this.notifications = notifications.slice(0, 10); // Show last 10
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading notifications:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  loadUnreadCount() {
    const chauffeurId = this.getChauffeurId();
    
    if (chauffeurId) {
      this.chauffeurService.getChauffeurUnreadNotificationsCount(chauffeurId).subscribe({
        next: (count: number) => {
          this.unreadCount = count;
        },
        error: (error: any) => {
          console.error('Error loading unread count:', error);
        }
      });
    }
  }

  markAsRead(notification: ChauffeurNotification) {
    if (!notification.lue) {
      this.chauffeurService.markChauffeurNotificationAsRead(notification.id).subscribe({
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
    // For now, mark each notification individually since we don't have a bulk endpoint
    if (this.unreadCount > 0) {
      const unreadNotifications = this.notifications.filter(n => !n.lue);
      
      unreadNotifications.forEach(notification => {
        this.chauffeurService.markChauffeurNotificationAsRead(notification.id).subscribe({
          next: () => {
            notification.lue = true;
          },
          error: (error: any) => {
            console.error('Error marking notification as read:', error);
          }
        });
      });
      
      this.unreadCount = 0;
    }
  }

  deleteNotification(notification: ChauffeurNotification, event: Event) {
    event.stopPropagation();
    
    // Remove from local array immediately for better UX
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      if (!notification.lue) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    }
  }

  viewAllNotifications() {
    // TODO: Navigate to full notifications page
    console.log('Navigate to all notifications');
  }

  trackByNotificationId(index: number, notification: ChauffeurNotification): number {
    return notification.id;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'CONGE_ACCEPTE': return 'check_circle';
      case 'CONGE_REFUSE': return 'cancel';
      case 'CONGE_DEMANDE': return 'schedule';
      case 'MISSION_ASSIGNEE': return 'assignment';
      case 'MISSION_ACCEPTEE': return 'check';
      case 'MISSION_COMMENCEE': return 'play_arrow';
      case 'MISSION_TERMINEE': return 'done_all';
      case 'MISSION_REFUSEE': return 'block';
      default: return 'info';
    }
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'CONGE_ACCEPTE': return 'icon-success';
      case 'CONGE_REFUSE': return 'icon-error';
      case 'CONGE_DEMANDE': return 'icon-info';
      case 'MISSION_ASSIGNEE': return 'icon-info';
      case 'MISSION_ACCEPTEE': return 'icon-success';
      case 'MISSION_COMMENCEE': return 'icon-info';
      case 'MISSION_TERMINEE': return 'icon-success';
      case 'MISSION_REFUSEE': return 'icon-error';
      default: return 'icon-info';
    }
  }

  getNotificationTitle(notification: ChauffeurNotification): string {
    switch (notification.type) {
      case 'CONGE_ACCEPTE': return 'Demande de congé acceptée';
      case 'CONGE_REFUSE': return 'Demande de congé refusée';
      case 'CONGE_DEMANDE': return 'Demande de congé envoyée';
      case 'MISSION_ASSIGNEE': return 'Nouvelle mission assignée';
      case 'MISSION_ACCEPTEE': return 'Mission acceptée';
      case 'MISSION_COMMENCEE': return 'Mission commencée';
      case 'MISSION_TERMINEE': return 'Mission terminée';
      case 'MISSION_REFUSEE': return 'Mission refusée';
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

  private getChauffeurId(): number | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.chauffeurId || user.id;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    return null;
  }
}
