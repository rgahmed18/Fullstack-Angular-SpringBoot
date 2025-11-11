package ma.formation.jdbc.application.service;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MissionService {
    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private ChauffeurRepository chauffeurRepository;

    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private VehicleService vehicleService;

    @Transactional
    public Mission creerMission(Mission mission, Long employeId) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        // Check if vehicle is available before assigning
        if (mission.getVehicule() != null) {
            if (!vehicleService.isVehicleAvailable(mission.getVehicule().getId())) {
                throw new RuntimeException("Véhicule non disponible pour cette mission");
            }
            // Mark vehicle as unavailable when mission is created
            vehicleService.markVehicleAsUnavailable(mission.getVehicule().getId());
        }
        
        mission.setEmploye(employe);
        mission.setAcceptee(false);
        mission.setEtat(Mission.EtatMission.EN_ATTENTE);
        return missionRepository.save(mission);
    }

    @Transactional
    public Mission accepterMission(Long missionId, Long chauffeurId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        
        Chauffeur chauffeur = chauffeurRepository.findById(chauffeurId)
                .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé"));

        if (!mission.isAcceptee()) {
            mission.setChauffeur(chauffeur);
            mission.setAcceptee(true);
            mission.setEtat(Mission.EtatMission.EN_ATTENTE);
            
            // Créer notification pour l'employé
            Notification notification = new Notification();
            notification.setEmploye(mission.getEmploye());
            notification.setMission(mission);
            notification.setType("MISSION_ACCEPTEE");
            notification.setDateEnvoi(LocalDateTime.now());
            String chauffeurNom = chauffeur.getNom() + " " + chauffeur.getPrenom();
            String destination = mission.getDestination();
            notification.setMessage("Mission vers " + destination + " acceptée par " + chauffeurNom);
            notification.setLue(false);
            notificationService.creerNotification(notification);
        }
        
        return missionRepository.save(mission);
    }

    @Transactional
    public Mission commencerMission(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        
        if (mission.getEtat() == Mission.EtatMission.EN_ATTENTE) {
            mission.setEtat(Mission.EtatMission.COMMENCEE);
            
            // Créer notification pour l'employé
            Notification notification = new Notification();
            notification.setEmploye(mission.getEmploye());
            notification.setMission(mission);
            notification.setType("MISSION_COMMENCEE");
            notification.setDateEnvoi(LocalDateTime.now());
            String chauffeurNom = mission.getChauffeur().getNom() + " " + mission.getChauffeur().getPrenom();
            String destination = mission.getDestination();
            notification.setMessage("Mission vers " + destination + " commencée par " + chauffeurNom);
            notification.setLue(false);
            notificationService.creerNotification(notification);
        }
        
        return missionRepository.save(mission);
    }

    @Transactional
    public Mission terminerMission(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        
        if (mission.getEtat() == Mission.EtatMission.COMMENCEE) {
            mission.setEtat(Mission.EtatMission.TERMINEE);
            
            // Mark vehicle as available when mission is completed
            if (mission.getVehicule() != null) {
                vehicleService.markVehicleAsAvailable(mission.getVehicule().getId());
            }
            
            // Créer notification pour l'employé
            Notification notification = new Notification();
            notification.setEmploye(mission.getEmploye());
            notification.setMission(mission);
            notification.setType("MISSION_TERMINEE");
            notification.setDateEnvoi(LocalDateTime.now());
            String chauffeurNom = mission.getChauffeur().getNom() + " " + mission.getChauffeur().getPrenom();
            String destination = mission.getDestination();
            notification.setMessage("Mission vers " + destination + " terminée par " + chauffeurNom);
            notification.setLue(false);
            notificationService.creerNotification(notification);
        }
        
        return missionRepository.save(mission);
    }

    @Transactional
    public Mission refuserMission(Long missionId, String raison) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        
        if (!mission.isAcceptee()) {
            mission.setEtat(Mission.EtatMission.REFUSEE);
            mission.setProbleme(raison);
            
            // Mark vehicle as available when mission is refused
            if (mission.getVehicule() != null) {
                vehicleService.markVehicleAsAvailable(mission.getVehicule().getId());
            }
            
            // Créer notification pour l'employé
            Notification notification = new Notification();
            notification.setEmploye(mission.getEmploye());
            notification.setMission(mission);
            notification.setType("MISSION_REFUSEE");
            notification.setDateEnvoi(LocalDateTime.now());
            String destination = mission.getDestination();
            notification.setMessage("Mission vers " + destination + " refusée. Raison: " + raison);
            notification.setLue(false);
            notificationService.creerNotification(notification);
        }
        
        return missionRepository.save(mission);
    }

    public List<Mission> getMissionsEnAttente() {
        return missionRepository.findByEtat(Mission.EtatMission.EN_ATTENTE);
    }

    public List<Mission> getMissionsParChauffeur(Long chauffeurId) {
        return missionRepository.findByChauffeurId(chauffeurId);
    }

    public List<Mission> getHistoriqueMissions(Long chauffeurId) {
        // Return ALL missions for the chauffeur to allow proper statistics calculation
        // The frontend will filter by status as needed for display purposes
        return missionRepository.findByChauffeurId(chauffeurId);
    }
    
    // Additional methods for driver dashboard
    public List<Mission> getMissionsByChauffeurId(Long chauffeurId) {
        return missionRepository.findByChauffeurId(chauffeurId);
    }
    
    @Transactional
    public void updateMissionStatus(Long missionId, Mission.EtatMission status) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        
        Mission.EtatMission oldStatus = mission.getEtat();
        mission.setEtat(status);
        
        // Handle vehicle availability based on status change
        if (mission.getVehicule() != null) {
            if (status == Mission.EtatMission.COMMENCEE && oldStatus == Mission.EtatMission.EN_ATTENTE) {
                // Mark vehicle as unavailable when mission starts (accepted by chauffeur)
                vehicleService.markVehicleAsUnavailable(mission.getVehicule().getId());
                
                // Create notification for employee
                Notification notification = new Notification();
                notification.setEmploye(mission.getEmploye());
                notification.setMission(mission);
                notification.setType("MISSION_COMMENCEE");
                notification.setDateEnvoi(LocalDateTime.now());
                String chauffeurNom = mission.getChauffeur().getNom() + " " + mission.getChauffeur().getPrenom();
                String destination = mission.getDestination();
                notification.setMessage("Mission vers " + destination + " acceptée et commencée par " + chauffeurNom);
                notification.setLue(false);
                notificationService.creerNotification(notification);
            }
        }
        
        missionRepository.save(mission);
    }

    @Transactional
    public Mission signalerProbleme(Long missionId, String probleme) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        
        // Sauvegarder les informations du chauffeur avant désassignation
        String chauffeurNom = mission.getChauffeur().getNom() + " " + mission.getChauffeur().getPrenom();
        String destination = mission.getDestination();
        
        // Mettre à jour le problème dans la mission
        mission.setProbleme(probleme);
        
        // Mark vehicle as available when mission has problems and is cancelled
        if (mission.getVehicule() != null) {
            vehicleService.markVehicleAsAvailable(mission.getVehicule().getId());
        }
        
        // Désassigner le chauffeur et remettre la mission en attente
        mission.setChauffeur(null);
        mission.setEtat(Mission.EtatMission.valueOf("EN_ATTENTE"));
        mission.setAcceptee(false);
        
        // Créer notification pour l'employé avec détails du problème
        Notification notification = new Notification();
        notification.setEmploye(mission.getEmploye());
        notification.setMission(mission);
        notification.setType("MISSION_PROBLEME");
        notification.setDateEnvoi(LocalDateTime.now());
        notification.setMessage("🚨 PROBLÈME SIGNALÉ - Mission vers " + destination + 
                               " abandonnée par " + chauffeurNom + ". Raison: " + probleme + 
                               ". Mission remise en attente pour réassignation.");
        notification.setLue(false);
        notificationService.creerNotification(notification);
        
        return missionRepository.save(mission);
    }
    
    @Transactional
    public void reportProblem(Long missionId, String problem) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        mission.setProbleme(problem);
        
        // Créer notification pour l'employé
        Notification notification = new Notification();
        notification.setEmploye(mission.getEmploye());
        notification.setMission(mission);
        notification.setType("MISSION_PROBLEME");
        notification.setDateEnvoi(LocalDateTime.now());
        notification.setMessage("Problème signalé : " + problem);
        notification.setLue(false);
        notificationService.creerNotification(notification);
        
        missionRepository.save(mission);
    }
}
