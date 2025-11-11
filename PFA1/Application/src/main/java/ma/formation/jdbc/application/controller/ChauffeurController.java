package ma.formation.jdbc.application.controller;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.dto.MissionResponseDTO;
import ma.formation.jdbc.application.dto.IndisponibiliteResponseDTO;
import ma.formation.jdbc.application.dto.NotificationResponseDTO;
import ma.formation.jdbc.application.service.ChauffeurService;
import ma.formation.jdbc.application.service.MissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chauffeurs")
public class ChauffeurController {
    @Autowired
    private ChauffeurService chauffeurService;
    
    @Autowired
    private MissionService missionService;

    @PostMapping
    public ResponseEntity<Chauffeur> creerChauffeur(@RequestBody Chauffeur chauffeur) {
        return ResponseEntity.ok(chauffeurService.creerChauffeur(chauffeur));
    }

    @GetMapping
    public ResponseEntity<List<Chauffeur>> getAllChauffeurs() {
        return ResponseEntity.ok(chauffeurService.getAllChauffeurs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Chauffeur> getChauffeur(@PathVariable Long id) {
        return ResponseEntity.ok(chauffeurService.getChauffeurById(id));
    }

    @PostMapping("/{id}/vehicule/{vehiculeId}")
    public ResponseEntity<Chauffeur> affecterVehicule(@PathVariable Long id, @PathVariable Long vehiculeId) {
        return ResponseEntity.ok(chauffeurService.affecterVehicule(id, vehiculeId));
    }

    @PostMapping("/{id}/indisponibilite")
    public ResponseEntity<?> creerIndisponibilite(@PathVariable Long id, @RequestBody Indisponibilite indisponibilite) {
        try {
            Indisponibilite savedIndisponibilite = chauffeurService.creerIndisponibilite(indisponibilite, id);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Demande de congé soumise avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/indisponibilites")
    public ResponseEntity<List<IndisponibiliteResponseDTO>> getIndisponibilites(@PathVariable Long id) {
        List<Indisponibilite> indisponibilites = chauffeurService.getIndisponibilites(id);
        List<IndisponibiliteResponseDTO> dtos = indisponibilites.stream()
                .map(IndisponibiliteResponseDTO::new)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/indisponibilite/{id}/accepter")
    public ResponseEntity<Void> accepterIndisponibilite(@PathVariable Long id) {
        chauffeurService.marquerIndisponibiliteAcceptee(id);
        return ResponseEntity.ok().build();
    }
    
    // Driver Dashboard Endpoints
    @GetMapping("/{id}/missions")
    public ResponseEntity<List<MissionResponseDTO>> getChauffeurMissions(@PathVariable Long id) {
        List<Mission> missions = missionService.getMissionsByChauffeurId(id);
        List<MissionResponseDTO> missionDTOs = missions.stream()
                .map(MissionResponseDTO::new)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(missionDTOs);
    }
    
    @GetMapping("/{id}/dashboard/stats")
    public ResponseEntity<java.util.Map<String, Object>> getChauffeurDashboardStats(@PathVariable Long id) {
        List<Mission> missions = missionService.getMissionsByChauffeurId(id);
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
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
        
        // Calculate success rate
        double successRate = totalMissions > 0 ? (double) completedMissions / totalMissions * 100 : 0;
        
        stats.put("totalMissions", totalMissions);
        stats.put("activeMissions", activeMissions);
        stats.put("pendingMissions", pendingMissions);
        stats.put("completedMissions", completedMissions);
        stats.put("refusedMissions", refusedMissions);
        stats.put("successRate", Math.round(successRate));
        
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping("/missions/{missionId}/accept")
    public ResponseEntity<Void> acceptMission(@PathVariable Long missionId) {
        missionService.updateMissionStatus(missionId, Mission.EtatMission.COMMENCEE);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/missions/{missionId}/complete")
    public ResponseEntity<Void> completeMission(@PathVariable Long missionId) {
        missionService.terminerMission(missionId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/missions/{missionId}/refuse")
    public ResponseEntity<Void> refuseMission(@PathVariable Long missionId, @RequestBody java.util.Map<String, String> body) {
        String reason = body.get("reason");
        missionService.refuserMission(missionId, reason);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/missions/{missionId}/report-problem")
    public ResponseEntity<Void> reportProblem(@PathVariable Long missionId, @RequestBody java.util.Map<String, String> body) {
        String problem = body.get("problem");
        missionService.reportProblem(missionId, problem);
        return ResponseEntity.ok().build();
    }

    // Chauffeur notification endpoints
    @GetMapping("/{id}/notifications")
    public ResponseEntity<List<NotificationResponseDTO>> getChauffeurNotifications(@PathVariable Long id) {
        return ResponseEntity.ok(chauffeurService.getChauffeurNotifications(id));
    }

    @GetMapping("/{id}/notifications/unread-count")
    public ResponseEntity<Long> getChauffeurUnreadNotificationsCount(@PathVariable Long id) {
        return ResponseEntity.ok(chauffeurService.getChauffeurUnreadNotificationsCount(id));
    }

    @PutMapping("/notifications/{notificationId}/mark-read")
    public ResponseEntity<Void> markChauffeurNotificationAsRead(@PathVariable Long notificationId) {
        chauffeurService.markChauffeurNotificationAsRead(notificationId);
        return ResponseEntity.ok().build();
    }
}
