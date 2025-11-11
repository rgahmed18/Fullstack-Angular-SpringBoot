package ma.formation.jdbc.application.controller;

import ma.formation.jdbc.application.model.Notification;
import ma.formation.jdbc.application.dto.NotificationDTO;
import ma.formation.jdbc.application.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;

    // Get all notifications for an employee
    @GetMapping("/employes/{employeId}/notifications")
    public ResponseEntity<List<NotificationDTO>> getEmployeeNotifications(@PathVariable Long employeId) {
        try {
            List<Notification> notifications = notificationService.getNotificationsByEmployeId(employeId);
            List<NotificationDTO> notificationDTOs = notifications.stream()
                    .map(NotificationDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get unread notifications count for an employee
    @GetMapping("/employes/{employeId}/notifications/unread-count")
    public ResponseEntity<Long> getUnreadNotificationsCount(@PathVariable Long employeId) {
        try {
            Long count = notificationService.getUnreadNotificationsCount(employeId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Mark a notification as read
    @PutMapping("/notifications/{notificationId}/mark-read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Mark all notifications as read for an employee
    @PutMapping("/employes/{employeId}/notifications/mark-all-read")
    public ResponseEntity<Void> markAllNotificationsAsRead(@PathVariable Long employeId) {
        try {
            notificationService.markAllAsRead(employeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete a notification
    @DeleteMapping("/notifications/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get recent notifications for an employee (last 10)
    @GetMapping("/employes/{employeId}/notifications/recent")
    public ResponseEntity<List<NotificationDTO>> getRecentNotifications(@PathVariable Long employeId) {
        try {
            List<Notification> notifications = notificationService.getRecentNotifications(employeId, 10);
            List<NotificationDTO> notificationDTOs = notifications.stream()
                    .map(NotificationDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Admin notification endpoints
    @GetMapping("/admin/notifications")
    public ResponseEntity<List<NotificationDTO>> getAdminNotifications() {
        try {
            // Get only leave request notifications for admin (DEMANDE_CONGE type)
            List<Notification> notifications = notificationService.getAdminLeaveRequestNotifications();
            List<NotificationDTO> notificationDTOs = notifications.stream()
                    .map(NotificationDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin/notifications/unread-count")
    public ResponseEntity<Long> getAdminUnreadNotificationsCount() {
        try {
            Long count = notificationService.getAdminUnreadLeaveRequestCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/admin/notifications/mark-all-read")
    public ResponseEntity<Void> markAllAdminNotificationsAsRead() {
        try {
            notificationService.markAllAdminLeaveRequestsAsRead();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/admin/notifications/{notificationId}")
    public ResponseEntity<Void> deleteAdminNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Test endpoint to create a sample notification (for testing purposes)
    @PostMapping("/employes/{employeId}/notifications/test")
    public ResponseEntity<NotificationDTO> createTestNotification(@PathVariable Long employeId) {
        try {
            Notification testNotification = new Notification();
            testNotification.setType("TEST");
            testNotification.setMessage("Ceci est une notification de test pour vérifier le système");
            testNotification.setDateEnvoi(java.time.LocalDateTime.now());
            testNotification.setLue(false);
            
            // Set employee (you'll need to fetch it)
            // For now, we'll create a basic notification
            Notification created = notificationService.creerNotification(testNotification);
            return ResponseEntity.ok(new NotificationDTO(created));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
