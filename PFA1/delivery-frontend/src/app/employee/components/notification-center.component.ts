import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <button 
      mat-icon-button 
      [matMenuTriggerFor]="notificationMenu"
      class="notification-trigger"
      [matTooltip]="getTooltipText()">
      <mat-icon 
        [matBadge]="unreadCount" 
        [matBadgeHidden]="unreadCount === 0"
        matBadgeColor="warn"
        matBadgeSize="small">
        notifications
      </mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu" xPosition="before">
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

      <div class="notification-list" (click)="$event.stopPropagation()">
        <div 
          *ngFor="let notification of notifications; trackBy: trackByNotificationId" 
          class="notification-item"
          [class.unread]="!notification.lue"
          (click)="markAsRead(notification)">
          
          <div class="notification-icon" [style.background-color]="getNotificationColor(notification.type)">
            <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
          </div>

          <div class="notification-content">
            <div class="notification-message">
              {{ formatNotificationMessage(notification) }}
            </div>
            <div class="notification-time">
              {{ formatRelativeTime(notification.dateEnvoi) }}
            </div>
          </div>

          <div class="notification-actions">
            <button 
              mat-icon-button 
              (click)="deleteNotification(notification, $event)"
              matTooltip="Supprimer"
              class="delete-btn">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <div *ngIf="notifications.length === 0" class="empty-notifications">
          <mat-icon>notifications_none</mat-icon>
          <p>Aucune notification</p>
        </div>
      </div>

      <mat-divider *ngIf="notifications.length > 0"></mat-divider>

      <div class="notification-footer" (click)="$event.stopPropagation()">
        <button mat-button class="view-all-btn">
          <mat-icon>visibility</mat-icon>
          Voir toutes les notifications
        </button>
      </div>
    </mat-menu>
  `,
  styles: [`
    .notification-trigger {
      position: relative;
    }

    ::ng-deep .notification-menu {
      width: 400px;
      max-width: 90vw;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px 12px;
      background: rgba(0,0,0,0.02);
    }

    .notification-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: rgba(0,0,0,0.87);
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 8px 0;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 20px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      border-left: 3px solid transparent;
    }

    .notification-item:hover {
      background-color: rgba(0,0,0,0.04);
    }

    .notification-item.unread {
      background-color: rgba(33, 150, 243, 0.05);
      border-left-color: #2196f3;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .notification-icon mat-icon {
      color: white;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-message {
      font-size: 14px;
      line-height: 1.4;
      color: rgba(0,0,0,0.87);
      margin-bottom: 4px;
      word-wrap: break-word;
    }

    .notification-time {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    .notification-actions {
      margin-left: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .notification-item:hover .notification-actions {
      opacity: 1;
    }

    .delete-btn {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }

    .delete-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .empty-notifications {
      text-align: center;
      padding: 40px 20px;
      color: rgba(0,0,0,0.6);
    }

    .empty-notifications mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-notifications p {
      margin: 0;
      font-size: 14px;
    }

    .notification-footer {
      padding: 12px 20px;
      background: rgba(0,0,0,0.02);
    }

    .view-all-btn {
      width: 100%;
      justify-content: center;
      color: #2196f3;
    }

    .view-all-btn mat-icon {
      margin-right: 8px;
    }

    /* Scrollbar styling */
    .notification-list::-webkit-scrollbar {
      width: 6px;
    }

    .notification-list::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.05);
    }

    .notification-list::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.2);
      border-radius: 3px;
    }

    .notification-list::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.3);
    }
  `]
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    console.log('NotificationCenterComponent initialized');
    
    // Subscribe to notifications
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notifications => {
        console.log('NotificationCenter received notifications:', notifications);
        this.notifications = notifications.slice(0, 10); // Show only latest 10
      })
    );

    // Subscribe to unread count
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        console.log('NotificationCenter received unread count:', count);
        this.unreadCount = count;
      })
    );

    // Load initial notifications
    console.log('Loading initial notifications...');
    this.notificationService.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }

  getTooltipText(): string {
    if (this.unreadCount === 0) {
      return 'Aucune nouvelle notification';
    } else if (this.unreadCount === 1) {
      return '1 nouvelle notification';
    } else {
      return `${this.unreadCount} nouvelles notifications`;
    }
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationColor(type: string): string {
    return this.notificationService.getNotificationColor(type);
  }

  formatNotificationMessage(notification: Notification): string {
    return this.notificationService.formatNotificationMessage(notification);
  }

  formatRelativeTime(dateString: string): string {
    return this.notificationService.formatRelativeTime(dateString);
  }

  markAsRead(notification: Notification): void {
    if (!notification.lue) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.lue = true;
          this.notificationService.refreshNotifications();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notificationService.refreshNotifications();
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notificationService.refreshNotifications();
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }
}
