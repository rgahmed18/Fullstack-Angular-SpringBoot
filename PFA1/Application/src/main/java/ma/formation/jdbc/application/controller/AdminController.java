package ma.formation.jdbc.application.controller;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import ma.formation.jdbc.application.model.User;
import ma.formation.jdbc.application.model.UserRole;
import ma.formation.jdbc.application.model.Chauffeur;
import ma.formation.jdbc.application.dto.ChauffeurRegistrationDTO;
import ma.formation.jdbc.application.dto.EmployeRegistrationDTO;
import ma.formation.jdbc.application.dto.VehiculeRegistrationDTO;
import ma.formation.jdbc.application.dto.IndisponibiliteResponseDTO;
import ma.formation.jdbc.application.dto.CreateMissionRequest;
import ma.formation.jdbc.application.dto.MissionFormDataDTO;
import ma.formation.jdbc.application.dto.MissionResponseDTO;
import ma.formation.jdbc.application.dto.MissionUpdateDTO;
import ma.formation.jdbc.application.dto.ChauffeurDTO;
import ma.formation.jdbc.application.repository.*;
import java.util.HashMap;
import java.util.stream.Collectors;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private ChauffeurRepository chauffeurRepository;
    
    @Autowired
    private EmployeRepository employeRepository;
    
    @Autowired
    private VehiculeRepository vehiculeRepository;
    
    @Autowired
    private MissionRepository missionRepository;

    @GetMapping("/chauffeurs")
    public ResponseEntity<List<ChauffeurDTO>> getAllChauffeurs() {
        return ResponseEntity.ok(adminService.getAllChauffeurs());
    }

    @GetMapping("/vehicules")
    public ResponseEntity<List<Vehicule>> getAllVehicules() {
        return ResponseEntity.ok(adminService.getAllVehicules());
    }

    @GetMapping("/vehicules/disponibles")
    public ResponseEntity<List<Vehicule>> getVehiculesDisponibles() {
        return ResponseEntity.ok(adminService.getVehiculesDisponibles());
    }

    @GetMapping("/missions/en-attente")
    public ResponseEntity<List<Mission>> getMissionsEnAttente() {
        return ResponseEntity.ok(adminService.getMissionsEnAttente());
    }

    @GetMapping("/indisponibilites/non-acceptees")
    public ResponseEntity<List<Indisponibilite>> getIndisponibilitesNonAcceptees() {
        return ResponseEntity.ok(adminService.getIndisponibilitesNonAcceptees());
    }

    @PostMapping("/missions/{missionId}/chauffeur/{chauffeurId}")
    public ResponseEntity<Void> affecterChauffeurAMission(@PathVariable Long missionId, @PathVariable Long chauffeurId) {
        adminService.affecterChauffeurAMission(missionId, chauffeurId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/indisponibilite/{id}/accepter")
    public ResponseEntity<Void> accepterIndisponibilite(@PathVariable Long id) {
        adminService.accepterIndisponibilite(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/historique/chauffeur/{id}")
    public ResponseEntity<List<MissionResponseDTO>> getHistoriqueMissions(@PathVariable Long id) {
        List<Mission> missions = adminService.getHistoriqueMissionsParChauffeur(id);
        List<MissionResponseDTO> missionDTOs = missions.stream()
                .map(MissionResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(missionDTOs);
    }

    @PostMapping("/employe")
    public ResponseEntity<Employe> creerEmploye(@RequestBody Employe employe) {
        return ResponseEntity.ok(adminService.creerEmploye(employe));
    }

    @PostMapping("/create-chauffeur")
    public ResponseEntity<?> createChauffeur(@RequestBody ChauffeurRegistrationDTO dto) {
        try {
            adminService.createChauffeurWithUser(dto);
            return ResponseEntity.ok(Collections.singletonMap("message", "Chauffeur created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/create-employe")
    public ResponseEntity<?> createEmploye(@RequestBody EmployeRegistrationDTO dto) {
        try {
            adminService.createEmployeWithUser(dto);
            return ResponseEntity.ok(Collections.singletonMap("message", "Employe created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/create-vehicule")
    public ResponseEntity<?> createVehicule(@RequestBody VehiculeRegistrationDTO dto) {
        try {
            adminService.createVehicule(dto);
            return ResponseEntity.ok(Collections.singletonMap("message", "Vehicule created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @PostMapping("/create-mission")
    public ResponseEntity<?> createMission(@RequestBody CreateMissionRequest request) {
        try {
            Mission mission = adminService.createMission(request);
            return ResponseEntity.ok(Collections.singletonMap("message", "Mission créée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @GetMapping("/mission-form-data")
    public ResponseEntity<MissionFormDataDTO> getMissionFormData() {
        try {
            MissionFormDataDTO formData = new MissionFormDataDTO();
            
            // Get all employees and convert to DTO
            List<MissionFormDataDTO.EmployeDTO> employes = employeRepository.findAll().stream()
                .map(emp -> new MissionFormDataDTO.EmployeDTO(
                    emp.getId(),
                    emp.getNom() != null ? emp.getNom() : "N/A",
                    emp.getPrenom() != null ? emp.getPrenom() : "N/A",
                    emp.getUser() != null ? emp.getUser().getEmail() : "N/A"
                ))
                .collect(Collectors.toList());
            
            // Get only available chauffeurs (not currently on active missions)
            List<MissionFormDataDTO.ChauffeurDTO> chauffeurs = chauffeurRepository.findAll().stream()
                .filter(chauffeur -> {
                    // Check if chauffeur has any active missions (EN_COURS, COMMENCEE)
                    boolean hasActiveMission = missionRepository.existsByChauffeurAndEtatIn(
                        chauffeur, 
                        Arrays.asList(Mission.EtatMission.EN_COURS, Mission.EtatMission.COMMENCEE)
                    );
                    return !hasActiveMission;
                })
                .map(chauffeur -> new MissionFormDataDTO.ChauffeurDTO(
                    chauffeur.getId(),
                    chauffeur.getNom() != null ? chauffeur.getNom() : "N/A",
                    chauffeur.getPrenom() != null ? chauffeur.getPrenom() : "N/A",
                    chauffeur.getUser() != null ? chauffeur.getUser().getEmail() : "N/A"
                ))
                .collect(Collectors.toList());
            
            // Get only available vehicles (not assigned to active missions)
            List<MissionFormDataDTO.VehiculeDTO> vehicules = vehiculeRepository.findByDisponibleTrue().stream()
                .filter(vehicule -> {
                    // Check if vehicle is assigned to any active missions (EN_COURS, COMMENCEE)
                    boolean isAssignedToActiveMission = missionRepository.existsByVehiculeAndEtatIn(
                        vehicule,
                        Arrays.asList(Mission.EtatMission.EN_COURS, Mission.EtatMission.COMMENCEE)
                    );
                    return !isAssignedToActiveMission;
                })
                .map(vehicule -> new MissionFormDataDTO.VehiculeDTO(
                    vehicule.getId(),
                    vehicule.getImmatriculation(),
                    vehicule.getMarque(),
                    vehicule.getModele(),
                    vehicule.getCapacite(),
                    vehicule.isDisponible()
                ))
                .collect(Collectors.toList());
            
            formData.setEmployes(employes);
            formData.setChauffeurs(chauffeurs);
            formData.setVehicules(vehicules);
            
            return ResponseEntity.ok(formData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Dashboard Statistics Endpoints
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/missions/count")
    public ResponseEntity<?> getMissionsCount() {
        try {
            long count = adminService.getMissionsCount();
            return ResponseEntity.ok(Collections.singletonMap("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/chauffeurs/count")
    public ResponseEntity<?> getChauffeursCount() {
        try {
            long count = adminService.getChauffeursCount();
            return ResponseEntity.ok(Collections.singletonMap("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/vehicules/count")
    public ResponseEntity<?> getVehiculesCount() {
        try {
            long count = adminService.getVehiculesCount();
            return ResponseEntity.ok(Collections.singletonMap("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/employes/count")
    public ResponseEntity<?> getEmployesCount() {
        try {
            long count = adminService.getEmployesCount();
            return ResponseEntity.ok(Collections.singletonMap("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // Get all missions for admin dashboard
    @GetMapping("/missions")
    public ResponseEntity<List<MissionResponseDTO>> getAllMissions() {
        try {
            List<MissionResponseDTO> missions = adminService.getAllMissions();
            return ResponseEntity.ok(missions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get mission by ID
    @GetMapping("/missions/{id}")
    public ResponseEntity<MissionResponseDTO> getMissionById(@PathVariable Long id) {
        try {
            MissionResponseDTO mission = adminService.getMissionById(id);
            return ResponseEntity.ok(mission);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Update mission
    @PutMapping("/missions/{id}")
    public ResponseEntity<?> updateMission(@PathVariable Long id, @RequestBody MissionUpdateDTO missionUpdateDTO) {
        try {
            adminService.updateMission(id, missionUpdateDTO);
            return ResponseEntity.ok(Collections.singletonMap("message", "Mission mise à jour avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // Delete mission
    @DeleteMapping("/missions/{id}")
    public ResponseEntity<?> deleteMission(@PathVariable Long id) {
        try {
            adminService.deleteMission(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // Leave Request Management Endpoints
    @GetMapping("/demandes-conge")
    public ResponseEntity<List<IndisponibiliteResponseDTO>> getPendingLeaveRequests() {
        List<Indisponibilite> pendingRequests = adminService.getIndisponibilitesNonAcceptees();
        List<IndisponibiliteResponseDTO> dtos = pendingRequests.stream()
                .map(IndisponibiliteResponseDTO::new)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/demandes-conge/{id}/accepter")
    public ResponseEntity<?> accepterDemandeConge(@PathVariable Long id) {
        try {
            adminService.accepterDemandeConge(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Demande de congé acceptée"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/demandes-conge/{id}/refuser")
    public ResponseEntity<?> refuserDemandeConge(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String raisonRefus = body.get("raison");
            adminService.refuserDemandeConge(id, raisonRefus);
            return ResponseEntity.ok(Collections.singletonMap("message", "Demande de congé refusée"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // Admin notification endpoints moved to NotificationController to avoid conflicts

    @GetMapping("/chauffeurs/{id}")
    public ResponseEntity<?> getChauffeurById(@PathVariable Long id) {
        try {
            ChauffeurDTO chauffeur = adminService.getChauffeurById(id);
            return ResponseEntity.ok(chauffeur);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @PutMapping("/chauffeurs/{id}")
    public ResponseEntity<?> updateChauffeur(@PathVariable Long id, @RequestBody ChauffeurRegistrationDTO dto) {
        try {
            adminService.updateChauffeur(id, dto);
            return ResponseEntity.ok().body(Map.of("message", "Chauffeur modifié avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @DeleteMapping("/chauffeurs/{id}")
    public ResponseEntity<?> deleteChauffeur(@PathVariable Long id) {
        try {
            adminService.deleteChauffeur(id);
            return ResponseEntity.ok().body(Map.of("message", "Chauffeur supprimé avec succès"));
        } catch (RuntimeException e) {
            // Return specific error message for business logic errors
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Return generic error for unexpected errors
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    // Employee Management Endpoints
    @GetMapping("/employes")
    public ResponseEntity<List<ma.formation.jdbc.application.dto.EmployeeResponseDTO>> getAllEmployees() {
        try {
            List<ma.formation.jdbc.application.dto.EmployeeResponseDTO> employees = adminService.getAllEmployees();
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/employes/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
        try {
            ma.formation.jdbc.application.dto.EmployeeResponseDTO employee = adminService.getEmployeeById(id);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @GetMapping("/employes/{id}/missions")
    public ResponseEntity<List<ma.formation.jdbc.application.dto.MissionSummary>> getEmployeeMissions(@PathVariable Long id) {
        try {
            List<ma.formation.jdbc.application.dto.MissionSummary> missions = adminService.getEmployeeMissions(id);
            return ResponseEntity.ok(missions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/employes/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody EmployeRegistrationDTO dto) {
        try {
            adminService.updateEmployee(id, dto);
            return ResponseEntity.ok().body(Map.of("message", "Employé modifié avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur interne du serveur"));
        }
    }

    @DeleteMapping("/employes/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            adminService.deleteEmployee(id);
            return ResponseEntity.ok().body(Map.of("message", "Employé supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur interne du serveur"));
        }
    }

}
