package ma.formation.jdbc.application.service;

import ma.formation.jdbc.application.model.Notification;
import ma.formation.jdbc.application.dto.NotificationResponseDTO;
import ma.formation.jdbc.application.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Notification creerNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsNonLues(Long employeId) {
        return notificationRepository.findByEmployeIdAndLueFalse(employeId);
    }

    @Transactional
    public void marquerNotificationCommeLue(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notification.setLue(true);
        notificationRepository.save(notification);
    }

    public List<Notification> getHistoriqueNotifications(Long employeId) {
        return notificationRepository.findByEmployeId(employeId);
    }

    // Get all notifications for an employee (ordered by date desc)
    public List<Notification> getNotificationsByEmployeId(Long employeId) {
        return notificationRepository.findByEmployeIdOrderByDateEnvoiDesc(employeId);
    }

    // Get unread notifications count for an employee
    public Long getUnreadNotificationsCount(Long employeId) {
        return notificationRepository.countByEmployeIdAndLueFalse(employeId);
    }

    // Mark notification as read
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notification.setLue(true);
        notificationRepository.save(notification);
    }

    // Mark all notifications as read for an employee
    @Transactional
    public void markAllAsRead(Long employeId) {
        List<Notification> unreadNotifications = notificationRepository.findByEmployeIdAndLueFalse(employeId);
        for (Notification notification : unreadNotifications) {
            notification.setLue(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    // Delete notification
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // Get recent notifications (limited number)
    public List<Notification> getRecentNotifications(Long employeId, int limit) {
        return notificationRepository.findTopByEmployeIdOrderByDateEnvoiDesc(employeId, limit);
    }

    // Admin notification methods
    public List<Notification> getNotificationsByAdminId(Long adminId) {
        return notificationRepository.findByAdminIdOrderByDateEnvoiDesc(adminId);
    }

    public Long getUnreadNotificationsCountByAdminId(Long adminId) {
        return notificationRepository.countByAdminIdAndLueFalse(adminId);
    }

    // Chauffeur notification methods
    public List<NotificationResponseDTO> getNotificationsByChauffeurId(Long chauffeurId) {
        List<Notification> notifications = notificationRepository.findByChauffeurIdOrderByDateEnvoiDesc(chauffeurId);
        return notifications.stream()
                .map(NotificationResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Long getUnreadNotificationsCountByChauffeurId(Long chauffeurId) {
        return notificationRepository.countByChauffeurIdAndLueFalse(chauffeurId);
    }

    // Admin notification methods
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByDateEnvoiDesc();
    }

    // Admin-specific methods for leave requests only
    public List<Notification> getAdminLeaveRequestNotifications() {
        // Only return leave request notifications (DEMANDE_CONGE type)
        return notificationRepository.findByTypeOrderByDateEnvoiDesc("DEMANDE_CONGE");
    }

    public Long getAdminUnreadLeaveRequestCount() {
        // Count only unread leave request notifications
        return notificationRepository.countByTypeAndLueFalse("DEMANDE_CONGE");
    }

    public void markAllAdminLeaveRequestsAsRead() {
        // Mark only leave request notifications as read
        List<Notification> unreadLeaveRequests = notificationRepository.findByTypeAndLueFalse("DEMANDE_CONGE");
        for (Notification notification : unreadLeaveRequests) {
            notification.setLue(true);
            notificationRepository.save(notification);
        }
    }

    public Long getAdminUnreadNotificationsCount() {
        // For admin, we might want to count all unread notifications or filter by admin-relevant types
        return notificationRepository.countByLueFalse();
    }

    public void markAllAdminNotificationsAsRead() {
        // Mark all notifications as read (you might want to filter by admin-relevant types)
        List<Notification> unreadNotifications = notificationRepository.findByLueFalse();
        for (Notification notification : unreadNotifications) {
            notification.setLue(true);
            notificationRepository.save(notification);
        }
    }
}
