import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AdminNotification {
  id: number;
  type: string;
  message: string;
  dateEnvoi: string;
  lue: boolean;
  chauffeurId?: number;
  chauffeurNom?: string;
  indisponibilite?: {
    id: number;
    dateDebut: string;
    dateFin: string;
    type: string;
    raison?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationService {
  private notifications$ = new BehaviorSubject<AdminNotification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private pollingSubscription?: Subscription;
  private readonly POLLING_INTERVAL = 10000; // 10 seconds

  constructor(private http: HttpClient) {}

  getNotifications() {
    return this.notifications$.asObservable();
  }

  getUnreadCount() {
    return this.unreadCount$.asObservable();
  }

  startPolling() {
    if (this.pollingSubscription) {
      return; // Already polling
    }

    // Initial load
    this.loadNotifications();

    // Start polling every 10 seconds
    this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(() => {
      this.loadNotifications();
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  private loadNotifications() {
    this.http.get<AdminNotification[]>(`${environment.apiUrl}/admin/notifications`).subscribe({
      next: (notifications) => {
        this.notifications$.next(notifications);
        const unreadCount = notifications.filter(n => !n.lue).length;
        this.unreadCount$.next(unreadCount);
      },
      error: (error) => {
        console.error('Error loading admin notifications:', error);
      }
    });
  }

  markAsRead(notificationId: number) {
    return this.http.put(`${environment.apiUrl}/admin/notifications/${notificationId}/mark-read`, {});
  }

  markAllAsRead() {
    return this.http.put(`${environment.apiUrl}/admin/notifications/mark-all-read`, {});
  }

  deleteNotification(notificationId: number) {
    return this.http.delete(`${environment.apiUrl}/admin/notifications/${notificationId}`);
  }

  // Force refresh notifications
  refreshNotifications() {
    this.loadNotifications();
  }
}
