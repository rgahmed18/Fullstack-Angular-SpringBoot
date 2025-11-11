package ma.formation.jdbc.application.service;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.repository.*;
import ma.formation.jdbc.application.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import ma.formation.jdbc.application.dto.ChauffeurRegistrationDTO;
import ma.formation.jdbc.application.dto.EmployeRegistrationDTO;
import ma.formation.jdbc.application.dto.VehiculeRegistrationDTO;
import ma.formation.jdbc.application.dto.CreateMissionRequest;
import ma.formation.jdbc.application.dto.MissionResponseDTO;
import ma.formation.jdbc.application.dto.ChauffeurDTO;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.stream.Collectors;

@Service
public class AdminService {
    @Autowired
    private ChauffeurRepository chauffeurRepository;

    @Autowired
    private VehiculeRepository vehiculeRepository;

    @Autowired
    private MissionService missionService;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private IndisponibiliteRepository indisponibiliteRepository;

    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ChauffeurService chauffeurService;

    @Autowired
    private AdminRepository adminRepository;

    public List<ChauffeurDTO> getAllChauffeurs() {
        List<Chauffeur> chauffeurs = chauffeurRepository.findAll();
        return chauffeurs.stream()
            .map(chauffeur -> {
                String email = chauffeur.getUser() != null ? chauffeur.getUser().getEmail() : "N/A";
                ChauffeurDTO dto = new ChauffeurDTO(
                    chauffeur.getId(),
                    chauffeur.getNom(),
                    chauffeur.getPrenom(),
                    email,
                    chauffeur.getTelephone(),
                    chauffeur.isActif()
                );
                if (chauffeur.getVehicule() != null) {
                    dto.setVehiculeInfo(chauffeur.getVehicule().getMarque() + " " + chauffeur.getVehicule().getModele());
                }
                return dto;
            })
            .collect(Collectors.toList());
    }

    public List<Vehicule> getAllVehicules() {
        return vehiculeRepository.findAll();
    }

    public List<Vehicule> getVehiculesDisponibles() {
        return vehiculeRepository.findByDisponibleTrue();
    }

    public List<Mission> getMissionsEnAttente() {
        return missionService.getMissionsEnAttente();
    }

    public List<Indisponibilite> getIndisponibilitesNonAcceptees() {
        return indisponibiliteRepository.findByAccepteeFalse();
    }

    @Transactional
    public void affecterChauffeurAMission(Long missionId, Long chauffeurId) {
        missionService.accepterMission(missionId, chauffeurId);
    }

    @Transactional
    public void accepterIndisponibilite(Long indisponibiliteId) {
        indisponibiliteRepository.findById(indisponibiliteId)
            .ifPresent(indispo -> {
                indispo.setAcceptee(true);
                indisponibiliteRepository.save(indispo);
            });
    }

    public List<Mission> getHistoriqueMissionsParChauffeur(Long chauffeurId) {
        return missionService.getHistoriqueMissions(chauffeurId);
    }

    @Transactional
    public Employe creerEmploye(Employe employe) {
        return employeRepository.save(employe);
    }

    @Transactional
    public void createChauffeurWithUser(ChauffeurRegistrationDTO dto) {
        System.out.println("Creating chauffeur with data:");
        System.out.println("Nom: " + dto.nom);
        System.out.println("Prenom: " + dto.prenom);
        System.out.println("Email: " + dto.email);
        System.out.println("Date embauche: " + dto.dateEmbauche);
        
        // Create User
        User user = new User();
        user.setEmail(dto.email);
        user.setPassword(dto.password); // Store plain text password
        user.setRole(UserRole.CHAUFFEUR);
        user.setActive(true);
        userRepository.save(user);

        // Create Chauffeur
        Chauffeur chauffeur = new Chauffeur();
        chauffeur.setNom(dto.nom);
        chauffeur.setPrenom(dto.prenom);
        chauffeur.setTelephone(dto.telephone);
        chauffeur.setActif(dto.actif);
        chauffeur.setDateEmbauche(dto.dateEmbauche);
        chauffeur.setUser(user);
        
        try {
            chauffeurRepository.save(chauffeur);
        } catch (Exception e) {
            System.err.println("Error saving chauffeur: " + e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void createEmployeWithUser(EmployeRegistrationDTO dto) {
        // Create User
        User user = new User();
        user.setEmail(dto.email);
        user.setPassword(dto.password); // Store plain text password
        user.setRole(UserRole.EMPLOYE);
        user.setActive(true);
        userRepository.save(user);

        // Create Employe
        Employe employe = new Employe();
        employe.setNom(dto.nom);
        employe.setPrenom(dto.prenom);
        employe.setTelephone(dto.telephone);
        employe.setUser(user);
        employeRepository.save(employe);
    }

    @Transactional
    public void createVehicule(VehiculeRegistrationDTO dto) {
        // Create Vehicule
        Vehicule vehicule = new Vehicule();
        vehicule.setImmatriculation(dto.immatriculation);
        vehicule.setMarque(dto.marque);
        vehicule.setModele(dto.modele);
        vehicule.setCapacite(dto.capacite);
        vehicule.setDisponible(dto.disponible);
        // Don't assign chauffeur yet as requested
        
        vehiculeRepository.save(vehicule);
    }
    
    @Transactional
    public Mission createMission(CreateMissionRequest request) {
        // Validate required fields
        if (request.getDestination() == null || request.getDestination().trim().isEmpty()) {
            throw new RuntimeException("La destination est obligatoire");
        }
        if (request.getDepart() == null || request.getDepart().trim().isEmpty()) {
            throw new RuntimeException("Le point de départ est obligatoire");
        }
        if (request.getDateHeure() == null || request.getDateHeure().trim().isEmpty()) {
            throw new RuntimeException("La date et heure sont obligatoires");
        }
        if (request.getTypeMission() == null || request.getTypeMission().trim().isEmpty()) {
            throw new RuntimeException("Le type de mission est obligatoire");
        }
        if (request.getEmployeId() == null) {
            throw new RuntimeException("L'employé est obligatoire");
        }
        
        // Parse date from ISO string format
        LocalDateTime dateHeure;
        try {
            // Handle ISO format from frontend (e.g., "2025-08-03T17:30:00.000Z")
            String dateStr = request.getDateHeure();
            if (dateStr.endsWith("Z")) {
                dateStr = dateStr.substring(0, dateStr.length() - 1);
            }
            if (dateStr.contains(".")) {
                dateStr = dateStr.substring(0, dateStr.indexOf("."));
            }
            dateHeure = LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Format de date invalide. Utilisez le format ISO: YYYY-MM-DDTHH:mm:ss");
        }
        
        // Find employee
        Employe employe = employeRepository.findById(request.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        // Find chauffeur if provided
        Chauffeur chauffeur = null;
        if (request.getChauffeurId() != null) {
            chauffeur = chauffeurRepository.findById(request.getChauffeurId())
                    .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé"));
        }
        
        // Find vehicle if provided
        Vehicule vehicule = null;
        if (request.getVehiculeId() != null) {
            vehicule = vehiculeRepository.findById(request.getVehiculeId())
                    .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));
            
            if (!vehicule.isDisponible()) {
                throw new RuntimeException("Le véhicule sélectionné n'est pas disponible");
            }
        }
        
        // Create mission
        Mission mission = new Mission();
        mission.setDestination(request.getDestination());
        mission.setDepart(request.getDepart());
        mission.setDateHeure(dateHeure); // Use parsed LocalDateTime
        mission.setTypeMission(request.getTypeMission());
        mission.setInstructions(request.getInstructions());
        mission.setEmploye(employe);
        mission.setChauffeur(chauffeur);
        mission.setVehicule(vehicule);
        mission.setEtat(Mission.EtatMission.EN_ATTENTE);
        mission.setAcceptee(false);
        
        Mission savedMission = missionRepository.save(mission);
        
        // Create notification for employee (always assigned)
        creerNotificationPourEmploye(savedMission, employe);
        
        // Create notification for chauffeur if assigned
        if (chauffeur != null) {
            creerNotificationPourChauffeur(savedMission, chauffeur);
        }
        
        return savedMission;
    }

    // Dashboard Statistics Methods
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get counts
        long totalMissions = missionRepository.count();
        long totalChauffeurs = chauffeurRepository.count();
        long totalVehicules = vehiculeRepository.count();
        long totalEmployes = employeRepository.count();
        
        // Calculate available vehicles (assuming disponible = true means available)
        long availableVehicules = vehiculeRepository.countByDisponible(true);
        
        // Calculate active missions (assuming there's a status field)
        // You might need to adjust this based on your Mission entity structure
        long activeMissions = 0;
        try {
            // If you have a status field in Mission entity, use it
            // activeMissions = missionRepository.countByStatus(MissionStatus.EN_COURS);
            // For now, estimate as 30% of total missions
            activeMissions = Math.round(totalMissions * 0.3);
        } catch (Exception e) {
            activeMissions = 0;
        }
        
        stats.put("totalMissions", totalMissions);
        stats.put("totalChauffeurs", totalChauffeurs);
        stats.put("totalVehicules", totalVehicules);
        stats.put("totalEmployes", totalEmployes);
        stats.put("availableVehicules", availableVehicules);
        stats.put("activeMissions", activeMissions);
        
        return stats;
    }

    public long getMissionsCount() {
        return missionRepository.count();
    }

    public long getChauffeursCount() {
        return chauffeurRepository.count();
    }

    public long getVehiculesCount() {
        return vehiculeRepository.count();
    }

    public long getEmployesCount() {
        return employeRepository.count();
    }

    // Get all missions for admin dashboard
    public List<MissionResponseDTO> getAllMissions() {
        List<Mission> missions = missionRepository.findAllByOrderByDateHeureDesc();
        return missions.stream()
                .map(MissionResponseDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }

    // Create notification for employee when mission is assigned
    private void creerNotificationPourEmploye(Mission mission, Employe employe) {
        try {
            Notification notification = new Notification();
            notification.setEmploye(employe);
            notification.setMission(mission);
            notification.setType("MISSION_ASSIGNEE");
            notification.setMessage(String.format("Nouvelle mission assignée par l'admin: %s → %s le %s à %s", 
                mission.getDepart(),
                mission.getDestination(),
                mission.getDateHeure().toLocalDate(),
                mission.getDateHeure().toLocalTime()));
            notification.setDateEnvoi(LocalDateTime.now());
            notification.setLue(false);
            
            notificationService.creerNotification(notification);
        } catch (Exception e) {
            // Log error but don't fail mission creation
            System.err.println("Erreur lors de la création de la notification employé: " + e.getMessage());
        }
    }

    // Create notification for chauffeur when mission is assigned
    private void creerNotificationPourChauffeur(Mission mission, Chauffeur chauffeur) {
        try {
            Notification notification = new Notification();
            notification.setChauffeur(chauffeur);
            notification.setMission(mission);
            notification.setType("MISSION_ASSIGNEE");
            notification.setMessage(String.format("Nouvelle mission assignée: %s → %s le %s à %s", 
                mission.getDepart(),
                mission.getDestination(),
                mission.getDateHeure().toLocalDate(),
                mission.getDateHeure().toLocalTime()));
            notification.setDateEnvoi(LocalDateTime.now());
            notification.setLue(false);
            
            notificationService.creerNotification(notification);
        } catch (Exception e) {
            // Log error but don't fail mission creation
            System.err.println("Erreur lors de la création de la notification chauffeur: " + e.getMessage());
        }
    }



    // Leave Request Management Methods
    public List<Indisponibilite> getDemandesCongeEnAttente() {
        return indisponibiliteRepository.findByStatut("EN_ATTENTE");
    }

    @Transactional
    public void accepterDemandeConge(Long indisponibiliteId) {
        Indisponibilite indisponibilite = indisponibiliteRepository.findById(indisponibiliteId)
                .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));
        
        // Mark as accepted
        indisponibilite.setAcceptee(true);
        indisponibilite.setStatut("ACCEPTEE");
        indisponibiliteRepository.save(indisponibilite);
        
        // Set chauffeur as inactive during leave period (only if no active missions)
        Chauffeur chauffeur = indisponibilite.getChauffeur();
        if (chauffeur != null) {
            // Check if chauffeur has active missions
            List<Mission> activeMissions = missionRepository.findByChauffeurIdAndEtatIn(
                chauffeur.getId(), 
                List.of(Mission.EtatMission.EN_ATTENTE, Mission.EtatMission.COMMENCEE, Mission.EtatMission.EN_COURS)
            );
            
            // Only set as inactive if no active missions
            if (activeMissions.isEmpty()) {
                chauffeur.setActif(false);
                chauffeurRepository.save(chauffeur);
            }
            
            // Create notification for chauffeur about acceptance
            Notification notification = new Notification();
            notification.setChauffeur(chauffeur);
            notification.setIndisponibilite(indisponibilite);
            notification.setType("CONGE_ACCEPTE");
            notification.setMessage("Votre demande de congé du " + indisponibilite.getDateDebut().toLocalDate() + 
                                  " au " + indisponibilite.getDateFin().toLocalDate() + " a été acceptée.");
            notification.setDateEnvoi(LocalDateTime.now());
            notification.setLue(false);
            notificationService.creerNotification(notification);
        }
    }

    @Transactional
    public void refuserDemandeConge(Long indisponibiliteId, String raisonRefus) {
        Indisponibilite indisponibilite = indisponibiliteRepository.findById(indisponibiliteId)
                .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));
        
        // Mark as refused instead of deleting (to preserve history and avoid FK constraint issues)
        indisponibilite.setAcceptee(false);
        indisponibilite.setStatut("REFUSEE");
        indisponibiliteRepository.save(indisponibilite);
        
        // Create notification for chauffeur about refusal
        Chauffeur chauffeur = indisponibilite.getChauffeur();
        if (chauffeur != null) {
            Notification notification = new Notification();
            notification.setChauffeur(chauffeur);
            notification.setIndisponibilite(indisponibilite);
            notification.setType("CONGE_REFUSE");
            String message = "Votre demande de congé du " + indisponibilite.getDateDebut().toLocalDate() + 
                           " au " + indisponibilite.getDateFin().toLocalDate() + " a été refusée.";
            if (raisonRefus != null && !raisonRefus.trim().isEmpty()) {
                message += " Raison: " + raisonRefus;
            }
            notification.setMessage(message);
            notification.setDateEnvoi(LocalDateTime.now());
            notification.setLue(false);
            
            notificationService.creerNotification(notification);
        }
    }

    // Admin notification methods moved to NotificationService to avoid conflicts



    // Helper methods
    private void creerNotificationPourChauffeur(Indisponibilite indisponibilite, String type, String message) {
        try {
            Notification notification = new Notification();
            notification.setChauffeur(indisponibilite.getChauffeur());
            notification.setIndisponibilite(indisponibilite);
            notification.setType(type);
            notification.setMessage(message);
            notification.setDateEnvoi(LocalDateTime.now());
            notification.setLue(false);
            
            notificationService.creerNotification(notification);
        } catch (Exception e) {
            System.err.println("Erreur lors de la création de la notification chauffeur: " + e.getMessage());
        }
    }

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

    // Reassign mission to new driver after problem reported
    @Transactional
    public Mission reassignMission(Long missionId, Long newChauffeurId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission non trouvée"));
        
        Chauffeur newChauffeur = chauffeurRepository.findById(newChauffeurId)
                .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé"));
        
        // Verify mission is in correct state for reassignment
        // Allow reassignment for:
        // 1. Missions with problems in EN_ATTENTE status
        // 2. Missions that have been refused (REFUSEE status)
        boolean canReassign = 
            (Mission.EtatMission.EN_ATTENTE.equals(mission.getEtat()) && mission.getProbleme() != null) ||
            Mission.EtatMission.REFUSEE.equals(mission.getEtat());
            
        if (!canReassign) {
            throw new RuntimeException("Cette mission ne peut pas être réassignée");
        }
        
        // Assign new driver and reset status
        mission.setChauffeur(newChauffeur);
        mission.setEtat(Mission.EtatMission.valueOf("EN_ATTENTE"));
        mission.setAcceptee(false);
        // Clear the problem since it's been resolved by reassigning a new driver
        mission.setProbleme(null);
        
        return missionRepository.save(mission);
    }

    // Delete chauffeur and associated user account
    @Transactional
    public void deleteChauffeur(Long chauffeurId) {
        Chauffeur chauffeur = chauffeurRepository.findById(chauffeurId)
                .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé"));
        
        // Check for active missions
        List<Mission> activeMissions = missionRepository.findByChauffeurIdAndEtatIn(
            chauffeurId, 
            List.of(Mission.EtatMission.EN_ATTENTE, Mission.EtatMission.COMMENCEE, Mission.EtatMission.EN_COURS)
        );
        
        if (!activeMissions.isEmpty()) {
            throw new RuntimeException("Impossible de supprimer le chauffeur: il a " + activeMissions.size() + " missions actives");
        }
        
        try {
            // First, update all completed missions to remove chauffeur reference
            List<Mission> completedMissions = missionRepository.findByChauffeurId(chauffeurId);
            for (Mission mission : completedMissions) {
                if (mission.getEtat() == Mission.EtatMission.TERMINEE || mission.getEtat() == Mission.EtatMission.REFUSEE) {
                    mission.setChauffeur(null); // Remove chauffeur reference but keep mission history
                    missionRepository.save(mission);
                }
            }
            
            // Delete associated user account
            User user = chauffeur.getUser();
            if (user != null) {
                userRepository.delete(user);
            }
            
            // Finally delete the chauffeur
            chauffeurRepository.delete(chauffeur);
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la suppression du chauffeur: " + e.getMessage());
        }
    }

    public ChauffeurDTO getChauffeurById(Long id) {
        Chauffeur chauffeur = chauffeurRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé avec l'ID: " + id));
        
        String email = chauffeur.getUser() != null ? chauffeur.getUser().getEmail() : "N/A";
        ChauffeurDTO dto = new ChauffeurDTO(
            chauffeur.getId(),
            chauffeur.getNom(),
            chauffeur.getPrenom(),
            email,
            chauffeur.getTelephone(),
            chauffeur.isActif()
        );
        
        // Add date embauche to DTO
        dto.setDateEmbauche(chauffeur.getDateEmbauche());
        
        if (chauffeur.getVehicule() != null) {
            dto.setVehiculeInfo(chauffeur.getVehicule().getMarque() + " " + chauffeur.getVehicule().getModele());
        }
        
        return dto;
    }

    @Transactional
    public void updateChauffeur(Long id, ChauffeurRegistrationDTO dto) {
        Chauffeur chauffeur = chauffeurRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé avec l'ID: " + id));
        
        // Update chauffeur fields
        chauffeur.setNom(dto.nom);
        chauffeur.setPrenom(dto.prenom);
        chauffeur.setTelephone(dto.telephone);
        chauffeur.setActif(dto.actif);
        chauffeur.setDateEmbauche(dto.dateEmbauche);
        
        // Update user fields if user exists
        if (chauffeur.getUser() != null) {
            User user = chauffeur.getUser();
            user.setEmail(dto.email);
            
            // Only update password if provided
            if (dto.password != null && !dto.password.trim().isEmpty()) {
                user.setPassword(dto.password); // Store plain text password
            }
            
            userRepository.save(user);
        }
        
        chauffeurRepository.save(chauffeur);
    }

    // Employee Management Methods
    public List<ma.formation.jdbc.application.dto.EmployeeResponseDTO> getAllEmployees() {
        List<Employe> employees = employeRepository.findAll();
        return employees.stream()
            .map(employee -> new ma.formation.jdbc.application.dto.EmployeeResponseDTO(
                employee.getId(),
                employee.getNom(),
                employee.getPrenom(),
                employee.getUser() != null ? employee.getUser().getEmail() : "N/A",
                employee.getTelephone(),
                employee.getDateEmbauche(),
                employee.isActif()
            ))
            .collect(Collectors.toList());
    }

    public ma.formation.jdbc.application.dto.EmployeeResponseDTO getEmployeeById(Long id) {
        Employe employee = employeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + id));
        
        return new ma.formation.jdbc.application.dto.EmployeeResponseDTO(
            employee.getId(),
            employee.getNom(),
            employee.getPrenom(),
            employee.getUser() != null ? employee.getUser().getEmail() : "N/A",
            employee.getTelephone(),
            employee.getDateEmbauche(),
            employee.isActif()
        );
    }



    @Transactional
    public void updateEmployee(Long id, EmployeRegistrationDTO dto) {
        Employe employee = employeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + id));
        
        // Update employee fields
        employee.setNom(dto.nom);
        employee.setPrenom(dto.prenom);
        employee.setTelephone(dto.telephone);
        employee.setActif(dto.actif);
        employee.setDateEmbauche(dto.dateEmbauche);
        
        // Update user fields if user exists
        if (employee.getUser() != null) {
            User user = employee.getUser();
            user.setEmail(dto.email);
            
            // Only update password if provided
            if (dto.password != null && !dto.password.trim().isEmpty()) {
                user.setPassword(dto.password); // Store plain text password
            }
            
            userRepository.save(user);
        }
        
        employeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long employeeId) {
        Employe employee = employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        // Check for active missions assigned to this employee
        List<Mission> activeMissions = missionRepository.findByEmployeIdAndEtatIn(
            employeeId, 
            List.of(Mission.EtatMission.EN_ATTENTE, Mission.EtatMission.COMMENCEE, Mission.EtatMission.EN_COURS)
        );
        
        if (!activeMissions.isEmpty()) {
            throw new RuntimeException("Impossible de supprimer l'employé: il a " + activeMissions.size() + " missions actives");
        }
        
        try {
            // First, update all completed missions to remove employee reference
            List<Mission> completedMissions = missionRepository.findByEmployeId(employeeId);
            for (Mission mission : completedMissions) {
                if (mission.getEtat() == Mission.EtatMission.TERMINEE || mission.getEtat() == Mission.EtatMission.REFUSEE) {
                    mission.setEmploye(null); // Remove employee reference but keep mission history
                    missionRepository.save(mission);
                }
            }
            
            // Delete associated user account
            User user = employee.getUser();
            if (user != null) {
                userRepository.delete(user);
            }
            
            // Finally delete the employee
            employeRepository.delete(employee);
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la suppression de l'employé: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<MissionSummary> getEmployeeMissions(Long employeeId) {
        List<Mission> missions = missionRepository.findByEmployeId(employeeId);
        
        return missions.stream().map(mission -> {
            MissionSummary summary = new MissionSummary();
            summary.setId(mission.getId());
            summary.setDestination(mission.getDestination());
            summary.setDepart(mission.getDepart());
            summary.setDateHeure(mission.getDateHeure());
            summary.setEtat(mission.getEtat().toString());
            summary.setTypeMission(mission.getTypeMission() != null ? mission.getTypeMission().toString() : "STANDARD");
            summary.setDescription(mission.getInstructions());
            
            // Add chauffeur information if available
            if (mission.getChauffeur() != null) {
                summary.setChauffeurNom(mission.getChauffeur().getNom());
                summary.setChauffeurPrenom(mission.getChauffeur().getPrenom());
            }
            
            return summary;
        }).collect(Collectors.toList());
    }

    // Delete mission
    public MissionResponseDTO getMissionById(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new RuntimeException("Mission non trouvée avec l'ID: " + missionId));
        return new MissionResponseDTO(mission);
    }

    @Transactional
    public void updateMission(Long missionId, MissionUpdateDTO missionUpdateDTO) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new RuntimeException("Mission non trouvée avec l'ID: " + missionId));

        // Update mission fields
        mission.setDepart(missionUpdateDTO.getDepart());
        mission.setDestination(missionUpdateDTO.getDestination());
        mission.setDateHeure(missionUpdateDTO.getDateHeure());
        mission.setTypeMission(missionUpdateDTO.getTypeMission());
        
        // Update state if provided
        if (missionUpdateDTO.getEtat() != null) {
            try {
                Mission.EtatMission etat = Mission.EtatMission.valueOf(missionUpdateDTO.getEtat());
                mission.setEtat(etat);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("État de mission invalide: " + missionUpdateDTO.getEtat());
            }
        }

        // Update chauffeur if provided
        if (missionUpdateDTO.getChauffeurId() != null) {
            Chauffeur chauffeur = chauffeurRepository.findById(missionUpdateDTO.getChauffeurId())
                .orElseThrow(() -> new RuntimeException("Chauffeur non trouvé avec l'ID: " + missionUpdateDTO.getChauffeurId()));
            mission.setChauffeur(chauffeur);
        } else {
            mission.setChauffeur(null);
        }

        // Update vehicule if provided
        if (missionUpdateDTO.getVehiculeId() != null) {
            Vehicule vehicule = vehiculeRepository.findById(missionUpdateDTO.getVehiculeId())
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé avec l'ID: " + missionUpdateDTO.getVehiculeId()));
            mission.setVehicule(vehicule);
        } else {
            mission.setVehicule(null);
        }

        // Update employe if provided
        if (missionUpdateDTO.getEmployeId() != null) {
            Employe employe = employeRepository.findById(missionUpdateDTO.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé avec l'ID: " + missionUpdateDTO.getEmployeId()));
            mission.setEmploye(employe);
        } else {
            mission.setEmploye(null);
        }

        missionRepository.save(mission);
    }

    @Transactional
    public void deleteMission(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new RuntimeException("Mission non trouvée avec l'ID: " + missionId));
        
        if (mission.getEtat() == Mission.EtatMission.EN_COURS || 
            mission.getEtat() == Mission.EtatMission.COMMENCEE) {
            throw new RuntimeException("Impossible de supprimer une mission en cours");
        }
        
        missionRepository.delete(mission);
    }

}
