import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, Subscription } from 'rxjs';
import { AuthService } from './auth.service';

export interface Notification {
  id: number;
  type: string;
  message: string;
  dateEnvoi: string;
  lue: boolean;
  mission?: {
    id: number;
    destination: string;
    depart: string;
  };
  employe?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private apiUrl = 'http://localhost:8080/api';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private pollingSubscription?: Subscription;
  private readonly POLLING_INTERVAL = 5000; // 5 seconds for real-time updates

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load notifications on service initialization
    this.loadNotifications();
    // Start real-time polling
    this.startPolling();
  }

  private getCurrentEmployeeId(): number {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.employeId) {
      return currentUser.employeId;
    }
    return currentUser?.id || 0;
  }

  // Get all notifications for current employee
  getNotifications(): Observable<Notification[]> {
    const employeId = this.getCurrentEmployeeId();
    return this.http.get<Notification[]>(`${this.apiUrl}/employes/${employeId}/notifications`);
  }

  // Get unread notifications count
  getUnreadCount(): Observable<number> {
    const employeId = this.getCurrentEmployeeId();
    return this.http.get<number>(`${this.apiUrl}/employes/${employeId}/notifications/unread-count`);
  }

  // Mark notification as read
  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${notificationId}/mark-read`, {});
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<void> {
    const employeId = this.getCurrentEmployeeId();
    return this.http.put<void>(`${this.apiUrl}/employes/${employeId}/notifications/mark-all-read`, {});
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notifications/${notificationId}`);
  }

  // Load and update notifications
  loadNotifications(): void {
    const employeId = this.getCurrentEmployeeId();
    console.log('Loading notifications for employee ID:', employeId);
    console.log('Current user:', this.authService.currentUserValue);
    
    if (!employeId) {
      console.warn('No employee ID found, cannot load notifications');
      return;
    }
    
    this.getNotifications().subscribe({
      next: (notifications) => {
        console.log('Loaded notifications:', notifications);
        this.notificationsSubject.next(notifications);
        const unreadCount = notifications.filter(n => !n.lue).length;
        this.unreadCountSubject.next(unreadCount);
        console.log('Unread count:', unreadCount);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        console.error('API URL attempted:', `${this.apiUrl}/employes/${employeId}/notifications`);
      }
    });
  }

  // Start real-time polling for notifications
  private startPolling(): void {
    // Stop any existing polling
    this.stopPolling();
    
    // Start polling every 5 seconds
    this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(() => {
      const employeId = this.getCurrentEmployeeId();
      if (employeId) {
        this.loadNotifications();
      }
    });
    
    console.log('Employee notification polling started (5 seconds interval)');
  }

  // Stop polling
  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  // Refresh notifications (call this after mission status changes)
  refreshNotifications(): void {
    this.loadNotifications();
  }

  // Cleanup method to stop polling when service is destroyed
  ngOnDestroy(): void {
    this.stopPolling();
  }

  // Get notification icon based on type
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'MISSION_ACCEPTEE': return 'check_circle';
      case 'MISSION_REFUSEE': return 'cancel';
      case 'MISSION_COMMENCEE': return 'play_arrow';
      case 'MISSION_TERMINEE': return 'done_all';
      default: return 'notifications';
    }
  }

  // Get notification color based on type
  getNotificationColor(type: string): string {
    switch (type) {
      case 'MISSION_ACCEPTEE': return '#4caf50'; // Green
      case 'MISSION_REFUSEE': return '#f44336'; // Red
      case 'MISSION_COMMENCEE': return '#2196f3'; // Blue
      case 'MISSION_TERMINEE': return '#ff9800'; // Orange
      default: return '#757575'; // Gray
    }
  }

  // Format notification message
  formatNotificationMessage(notification: Notification): string {
    // Use the message from the backend directly, as it now contains proper details
    return notification.message;
  }

  // Format relative time (e.g., "Il y a 2 heures")
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }
}
