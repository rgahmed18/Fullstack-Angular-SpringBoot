package ma.formation.jdbc.application.service;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.dto.NotificationResponseDTO;
import ma.formation.jdbc.application.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChauffeurService {
    @Autowired
    private ChauffeurRepository chauffeurRepository;

    @Autowired
    private VehiculeRepository vehiculeRepository;

    @Autowired
    private IndisponibiliteRepository indisponibiliteRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AdminRepository adminRepository;

    @Transactional
    public Chauffeur creerChauffeur(Chauffeur chauffeur) {
        return chauffeurRepository.save(chauffeur);
    }

    public List<Chauffeur> getAllChauffeurs() {
        return chauffeurRepository.findAll();
    }

    public Chauffeur getChauffeurById(Long id) {
        return chauffeurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé"));
    }

    @Transactional
    public Chauffeur affecterVehicule(Long chauffeurId, Long vehiculeId) {
        Chauffeur chauffeur = getChauffeurById(chauffeurId);
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));
        
        if (vehicule.isDisponible()) {
            vehicule.setDisponible(false);
            chauffeur.setVehicule(vehicule);
            return chauffeurRepository.save(chauffeur);
        }
        throw new RuntimeException("Véhicule déjà attribué");
    }

    @Transactional
    public Indisponibilite creerIndisponibilite(Indisponibilite indisponibilite, Long chauffeurId) {
        Chauffeur chauffeur = getChauffeurById(chauffeurId);
        indisponibilite.setChauffeur(chauffeur);
        indisponibilite.setAcceptee(false);
        
        // Save the indisponibilite
        Indisponibilite savedIndisponibilite = indisponibiliteRepository.save(indisponibilite);
        
        // Create notification for admin about new leave request
        creerNotificationPourAdmin(savedIndisponibilite);
        
        return savedIndisponibilite;
    }

    public List<Indisponibilite> getIndisponibilites(Long chauffeurId) {
        return indisponibiliteRepository.findByChauffeurId(chauffeurId);
    }

    @Transactional
    public void marquerIndisponibiliteAcceptee(Long indisponibiliteId) {
        indisponibiliteRepository.findById(indisponibiliteId)
            .ifPresent(indispo -> {
                indispo.setAcceptee(true);
                indisponibiliteRepository.save(indispo);
            });
    }

    // Create notification for admin when driver submits leave request
    private void creerNotificationPourAdmin(Indisponibilite indisponibilite) {
        try {
            // Get the first admin (assuming single admin system)
            List<Admin> admins = adminRepository.findAll();
            if (!admins.isEmpty()) {
                Admin admin = admins.get(0);
                
                Chauffeur chauffeur = indisponibilite.getChauffeur();
                String chauffeurName = chauffeur.getNom() + " " + chauffeur.getPrenom();
                
                Notification notification = new Notification();
                notification.setAdmin(admin);
                notification.setIndisponibilite(indisponibilite);
                notification.setType("DEMANDE_CONGE");
                notification.setMessage(String.format("Nouvelle demande de congé de %s (%s) du %s au %s. Raison: %s", 
                    chauffeurName,
                    getTypeLabel(indisponibilite.getType()),
                    indisponibilite.getDateDebut().toLocalDate(),
                    indisponibilite.getDateFin().toLocalDate(),
                    indisponibilite.getRaison() != null ? indisponibilite.getRaison() : "Non spécifiée"));
                notification.setDateEnvoi(LocalDateTime.now());
                notification.setLue(false);
                
                notificationService.creerNotification(notification);
            }
        } catch (Exception e) {
            // Log error but don't fail the leave request creation
            System.err.println("Erreur lors de la création de la notification admin: " + e.getMessage());
        }
    }

    // Chauffeur notification methods
    public List<NotificationResponseDTO> getChauffeurNotifications(Long chauffeurId) {
        return notificationService.getNotificationsByChauffeurId(chauffeurId);
    }

    public Long getChauffeurUnreadNotificationsCount(Long chauffeurId) {
        return notificationService.getUnreadNotificationsCountByChauffeurId(chauffeurId);
    }

    @Transactional
    public void markChauffeurNotificationAsRead(Long notificationId) {
        notificationService.markAsRead(notificationId);
    }

    // Helper method for leave type labels
    private String getTypeLabel(String type) {
        switch (type) {
            case "CONGE_ANNUEL": return "Congé annuel";
            case "CONGE_MALADIE": return "Congé maladie";
            case "CONGE_PERSONNEL": return "Congé personnel";
            case "CONGE_URGENCE": return "Congé d'urgence";
            case "AUTRE": return "Autre";
            default: return type;
        }
    }
}
