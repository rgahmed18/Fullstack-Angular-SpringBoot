package ma.formation.jdbc.application.controller;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.dto.MissionResponseDTO;
import ma.formation.jdbc.application.dto.EmployeDetailsDTO;
import ma.formation.jdbc.application.service.NotificationService;
import ma.formation.jdbc.application.service.EmployeService;
import ma.formation.jdbc.application.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employes")
public class EmployeController {
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private EmployeService employeService;
    
    @Autowired
    private AdminService adminService;

    @GetMapping("/{id}/notifications/non-lues")
    public ResponseEntity<List<Notification>> getNotificationsNonLues(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationsNonLues(id));
    }

    @PostMapping("/notification/{id}/lue")
    public ResponseEntity<Void> marquerNotificationCommeLue(@PathVariable Long id) {
        notificationService.marquerNotificationCommeLue(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/notifications/historique")
    public ResponseEntity<List<Notification>> getHistoriqueNotifications(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getHistoriqueNotifications(id));
    }
    
    @GetMapping("/{id}/missions")
    public ResponseEntity<List<MissionResponseDTO>> getMissionsAssignees(@PathVariable Long id) {
        List<Mission> missions = employeService.getMissionsParEmploye(id);
        List<MissionResponseDTO> missionDTOs = missions.stream()
                .map(MissionResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(missionDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmployeDetailsDTO> getEmployeById(@PathVariable Long id) {
        Employe employe = employeService.getEmployeById(id);
        if (employe != null) {
            EmployeDetailsDTO employeDTO = new EmployeDetailsDTO(employe);
            return ResponseEntity.ok(employeDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@PathVariable Long id) {
        List<Mission> missions = employeService.getMissionsParEmploye(id);
        
        Map<String, Object> stats = new HashMap<>();
        
        // Count missions by status
        long totalMissions = missions.size();
        
        // Count pending missions (EN_ATTENTE)
        long pendingMissions = missions.stream()
                .filter(m -> m.getEtat() == null || m.getEtat() == Mission.EtatMission.EN_ATTENTE)
                .count();
                
        // Count active missions (COMMENCEE)
        long activeMissions = missions.stream()
                .filter(m -> m.getEtat() == Mission.EtatMission.COMMENCEE)
                .count();
                
        // Count completed missions (TERMINEE)
        long completedMissions = missions.stream()
                .filter(m -> m.getEtat() == Mission.EtatMission.TERMINEE)
                .count();
                
        // Count refused missions (REFUSEE)
        long refusedMissions = missions.stream()
                .filter(m -> m.getEtat() == Mission.EtatMission.REFUSEE)
                .count();
        
        stats.put("totalMissions", totalMissions);
        stats.put("activeMissions", activeMissions);
        stats.put("pendingMissions", pendingMissions);
        stats.put("completedMissions", completedMissions);
        stats.put("refusedMissions", refusedMissions);
        
        // Get unread notifications count
        List<Notification> unreadNotifications = notificationService.getNotificationsNonLues(id);
        stats.put("unreadNotifications", unreadNotifications.size());
        
        return ResponseEntity.ok(stats);
    }

    // Get missions with problems assigned to this employee (for reassignment)
    @GetMapping("/{id}/missions/with-problems")
    public ResponseEntity<List<MissionResponseDTO>> getMissionsWithProblems(@PathVariable Long id) {
        List<Mission> missions = employeService.getMissionsParEmploye(id);
        
        // Filter missions that need reassignment:
        // 1. Missions with problems that are back in EN_ATTENTE status
        // 2. Missions that have been refused (REFUSEE status)
        List<MissionResponseDTO> missionsWithProblems = missions.stream()
                .filter(m -> 
                    // Missions with problems in EN_ATTENTE status
                    (m.getProbleme() != null && !m.getProbleme().trim().isEmpty() && m.getEtat() == Mission.EtatMission.EN_ATTENTE) ||
                    // Refused missions that need reassignment
                    (m.getEtat() == Mission.EtatMission.REFUSEE)
                )
                .map(MissionResponseDTO::new)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(missionsWithProblems);
    }

    // Reassign mission to new driver (employee functionality)
    @PostMapping("/{employeId}/missions/{missionId}/reassign/{chauffeurId}")
    public ResponseEntity<?> reassignMission(@PathVariable Long employeId, @PathVariable Long missionId, @PathVariable Long chauffeurId) {
        try {
            // Use the same AdminService reassignMission method since the logic is the same
            adminService.reassignMission(missionId, chauffeurId);
            return ResponseEntity.ok(Collections.singletonMap("message", "Mission réassignée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
