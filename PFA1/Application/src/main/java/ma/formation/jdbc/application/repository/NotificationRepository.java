package ma.formation.jdbc.application.repository;

import ma.formation.jdbc.application.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByEmployeIdAndLueFalse(Long employeId);

    List<Notification> findByEmployeId(Long employeId);

    // Get notifications ordered by date descending
    List<Notification> findByEmployeIdOrderByDateEnvoiDesc(Long employeId);

    // Count unread notifications for an employee
    Long countByEmployeIdAndLueFalse(Long employeId);

    // Get recent notifications with limit
    @Query(value = "SELECT * FROM notifications WHERE employe_id = :employeId ORDER BY date_envoi DESC LIMIT :limit", nativeQuery = true)
    List<Notification> findTopByEmployeIdOrderByDateEnvoiDesc(@Param("employeId") Long employeId, @Param("limit") int limit);

    // Admin notification methods
    List<Notification> findByAdminIdOrderByDateEnvoiDesc(Long adminId);
    Long countByAdminIdAndLueFalse(Long adminId);

    // Chauffeur notification methods
    List<Notification> findByChauffeurIdOrderByDateEnvoiDesc(Long chauffeurId);
    Long countByChauffeurIdAndLueFalse(Long chauffeurId);

    // Global admin notification methods
    @Query("SELECT n FROM Notification n ORDER BY n.dateEnvoi DESC")
    List<Notification> findAllByOrderByDateEnvoiDesc();
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.lue = false")
    Long countByLueFalse();
    
    @Query("SELECT n FROM Notification n WHERE n.lue = false")
    List<Notification> findByLueFalse();
    
    // Admin leave request specific methods
    @Query("SELECT n FROM Notification n WHERE n.type = ?1 ORDER BY n.dateEnvoi DESC")
    List<Notification> findByTypeOrderByDateEnvoiDesc(String type);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.type = ?1 AND n.lue = false")
    Long countByTypeAndLueFalse(String type);
    
    @Query("SELECT n FROM Notification n WHERE n.type = ?1 AND n.lue = false")
    List<Notification> findByTypeAndLueFalse(String type);
}
