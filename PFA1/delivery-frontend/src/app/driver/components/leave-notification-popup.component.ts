import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { LeaveNotificationPopupService, PopupNotification } from '../services/leave-notification-popup.service';

@Component({
  selector: 'app-leave-notification-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="popup-container">
      <div 
        *ngFor="let notification of popupNotifications; trackBy: trackByNotificationId"
        class="popup-notification"
        [class.popup-accepted]="notification.type === 'CONGE_ACCEPTE'"
        [class.popup-refused]="notification.type === 'CONGE_REFUSE'">
        
        <div class="popup-header">
          <div class="popup-icon">
            <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
          </div>
          <div class="popup-title">
            {{ notification.title }}
          </div>
          <button 
            mat-icon-button 
            class="close-button"
            (click)="closeNotification(notification.id)">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="popup-content">
          <p class="popup-message">{{ notification.message }}</p>
          
          <div class="popup-details" *ngIf="notification.indisponibilite">
            <div class="detail-item">
              <mat-icon>date_range</mat-icon>
              <span>{{ formatDateRange(notification.indisponibilite.dateDebut, notification.indisponibilite.dateFin) }}</span>
            </div>
            <div class="detail-item">
              <mat-icon>category</mat-icon>
              <span>{{ getLeaveTypeLabel(notification.indisponibilite.type) }}</span>
            </div>
            <div class="detail-item" *ngIf="notification.indisponibilite.raison">
              <mat-icon>note</mat-icon>
              <span>{{ notification.indisponibilite.raison }}</span>
            </div>
          </div>
        </div>

        <div class="popup-actions">
          <button 
            mat-button 
            color="primary"
            (click)="markAsReadAndClose(notification.id)">
            <mat-icon>done</mat-icon>
            Marquer comme lu
          </button>
        </div>

        <div class="popup-progress">
          <div class="progress-bar"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .popup-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      pointer-events: none;
    }

    .popup-notification {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      margin-bottom: 16px;
      overflow: hidden;
      pointer-events: all;
      position: relative;
      animation: slideIn 0.5s ease-out;
      border-left: 5px solid #3b82f6;
    }

    .popup-notification.popup-accepted {
      border-left-color: #10b981;
    }

    .popup-notification.popup-refused {
      border-left-color: #ef4444;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .popup-header {
      display: flex;
      align-items: center;
      padding: 16px 16px 12px 16px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .popup-accepted .popup-header {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    }

    .popup-refused .popup-header {
      background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
    }

    .popup-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      background: #3b82f6;
      color: white;
    }

    .popup-accepted .popup-icon {
      background: #10b981;
    }

    .popup-refused .popup-icon {
      background: #ef4444;
    }

    .popup-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .popup-title {
      flex: 1;
      font-weight: 600;
      font-size: 16px;
      color: #1e293b;
    }

    .close-button {
      width: 32px;
      height: 32px;
      color: #64748b;
    }

    .close-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .popup-content {
      padding: 0 16px 16px 16px;
    }

    .popup-message {
      color: #475569;
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 12px 0;
    }

    .popup-details {
      background: #f8fafc;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #64748b;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #94a3b8;
    }

    .popup-actions {
      padding: 0 16px 16px 16px;
      display: flex;
      justify-content: flex-end;
    }

    .popup-actions button {
      font-size: 13px;
      height: 36px;
    }

    .popup-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: #3b82f6;
      animation: progress 8s linear;
      transform-origin: left;
    }

    .popup-accepted .progress-bar {
      background: #10b981;
    }

    .popup-refused .progress-bar {
      background: #ef4444;
    }

    @keyframes progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .popup-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .popup-notification {
        margin-bottom: 12px;
      }

      .popup-header {
        padding: 12px;
      }

      .popup-content {
        padding: 0 12px 12px 12px;
      }

      .popup-actions {
        padding: 0 12px 12px 12px;
      }
    }
  `]
})
export class LeaveNotificationPopupComponent implements OnInit, OnDestroy {
  popupNotifications: PopupNotification[] = [];
  private subscription?: Subscription;

  constructor(private popupService: LeaveNotificationPopupService) {}

  ngOnInit() {
    // Subscribe to popup notifications
    this.subscription = this.popupService.getPopupNotifications().subscribe(
      notifications => {
        this.popupNotifications = notifications;
      }
    );

    // Start polling for new notifications
    this.popupService.startPolling();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.popupService.stopPolling();
  }

  trackByNotificationId(index: number, notification: PopupNotification): number {
    return notification.id;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'CONGE_ACCEPTE': return 'check_circle';
      case 'CONGE_REFUSE': return 'cancel';
      default: return 'info';
    }
  }

  closeNotification(notificationId: number) {
    this.popupService.hidePopupNotification(notificationId);
  }

  markAsReadAndClose(notificationId: number) {
    this.popupService.markNotificationAsRead(notificationId);
  }

  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startStr = start.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
    const endStr = end.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
    
    return `${startStr} - ${endStr}`;
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
}
