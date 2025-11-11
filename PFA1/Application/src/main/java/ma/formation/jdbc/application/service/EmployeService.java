package ma.formation.jdbc.application.service;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeService {
    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Transactional
    public Employe creerEmploye(Employe employe) {
        return employeRepository.save(employe);
    }

    public List<Employe> getAllEmployes() {
        return employeRepository.findAll();
    }

    public Employe getEmployeById(Long id) {
        return employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
    }


    public List<Mission> getMissionsParEmploye(Long employeId) {
        return missionRepository.findByEmployeId(employeId);
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
}
