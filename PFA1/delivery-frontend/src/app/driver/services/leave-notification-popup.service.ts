import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { ChauffeurService } from '../../core/services/chauffeur.service';

export interface PopupNotification {
  id: number;
  type: 'CONGE_ACCEPTE' | 'CONGE_REFUSE' | 'MISSION_ASSIGNEE' | 'MISSION_ACCEPTEE' | 'MISSION_COMMENCEE' | 'MISSION_TERMINEE' | 'MISSION_REFUSEE';
  title: string;
  message: string;
  dateEnvoi: string;
  indisponibilite?: {
    id: number;
    dateDebut: string;
    dateFin: string;
    type: string;
    raison?: string;
  };
  missionId?: number;
  missionDestination?: string;
  isVisible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveNotificationPopupService {
  private popupNotifications$ = new BehaviorSubject<PopupNotification[]>([]);
  private pollingSubscription?: Subscription;
  private lastCheckedNotificationId = 0;
  private readonly POLLING_INTERVAL = 10000; // 10 seconds for faster updates

  constructor(private chauffeurService: ChauffeurService) {}

  getPopupNotifications() {
    return this.popupNotifications$.asObservable();
  }

  startPolling() {
    if (this.pollingSubscription) {
      return; // Already polling
    }

    // Initial check
    this.checkForNewNotifications();

    // Start polling every 30 seconds
    this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(() => {
      this.checkForNewNotifications();
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  private checkForNewNotifications() {
    const chauffeurId = this.getChauffeurId();
    
    if (!chauffeurId) {
      return;
    }

    this.chauffeurService.getChauffeurNotifications(chauffeurId).subscribe({
      next: (notifications: any[]) => {
        // Filter for all important notifications that are newer than last checked
        const importantNotifications = notifications.filter(notification => 
          (notification.type === 'CONGE_ACCEPTE' || 
           notification.type === 'CONGE_REFUSE' ||
           notification.type === 'MISSION_ASSIGNEE') &&
          notification.id > this.lastCheckedNotificationId &&
          !notification.lue // Only show unread notifications
        );

        if (importantNotifications.length > 0) {
          // Update last checked ID
          this.lastCheckedNotificationId = Math.max(...notifications.map(n => n.id));

          // Convert to popup notifications
          const popupNotifications: PopupNotification[] = importantNotifications.map((notification: any) => ({
            id: notification.id,
            type: notification.type,
            title: this.getNotificationTitle(notification.type),
            message: notification.message,
            dateEnvoi: notification.dateEnvoi,
            indisponibilite: notification.indisponibilite,
            missionId: notification.missionId,
            missionDestination: notification.missionDestination,
            isVisible: true
          }));

          // Add to current popup notifications
          const currentNotifications = this.popupNotifications$.value;
          this.popupNotifications$.next([...currentNotifications, ...popupNotifications]);

          // Auto-hide each notification after 8 seconds
          popupNotifications.forEach(popup => {
            setTimeout(() => {
              this.hidePopupNotification(popup.id);
            }, 8000);
          });
        }
      },
      error: (error) => {
        console.error('Error checking for new notifications:', error);
      }
    });
  }

  hidePopupNotification(notificationId: number) {
    const currentNotifications = this.popupNotifications$.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
    this.popupNotifications$.next(updatedNotifications);
  }

  markNotificationAsRead(notificationId: number) {
    // Mark as read in backend
    this.chauffeurService.markChauffeurNotificationAsRead(notificationId).subscribe({
      next: () => {
        // Remove from popup notifications
        this.hidePopupNotification(notificationId);
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  private getNotificationTitle(type: string): string {
    switch (type) {
      case 'CONGE_ACCEPTE': return 'Demande de congé acceptée ✅';
      case 'CONGE_REFUSE': return 'Demande de congé refusée ❌';
      case 'MISSION_ASSIGNEE': return 'Nouvelle mission assignée 🚚';
      case 'MISSION_ACCEPTEE': return 'Mission acceptée ✅';
      case 'MISSION_COMMENCEE': return 'Mission commencée 🚀';
      case 'MISSION_TERMINEE': return 'Mission terminée ✅';
      case 'MISSION_REFUSEE': return 'Mission refusée ❌';
      default: return 'Notification';
    }
  }

  private getChauffeurId(): number | null {
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
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
