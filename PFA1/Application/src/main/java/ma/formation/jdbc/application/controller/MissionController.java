package ma.formation.jdbc.application.controller;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.service.MissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
public class MissionController {
    @Autowired
    private MissionService missionService;

    @PostMapping
    public ResponseEntity<Mission> creerMission(@RequestBody Mission mission, @RequestParam Long employeId) {
        return ResponseEntity.ok(missionService.creerMission(mission, employeId));
    }

    @PostMapping("/{id}/accepter")
    public ResponseEntity<String> accepterMission(@PathVariable Long id, @RequestParam Long chauffeurId) {
        try {
            missionService.accepterMission(id, chauffeurId);
            return ResponseEntity.ok("{\"message\": \"Mission acceptée avec succès\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/{id}/commencer")
    public ResponseEntity<String> commencerMission(@PathVariable Long id) {
        try {
            missionService.commencerMission(id);
            return ResponseEntity.ok("{\"message\": \"Mission commencée avec succès\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/{id}/terminer")
    public ResponseEntity<String> terminerMission(@PathVariable Long id) {
        try {
            missionService.terminerMission(id);
            return ResponseEntity.ok("{\"message\": \"Mission terminée avec succès\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/{id}/refuser")
    public ResponseEntity<String> refuserMission(@PathVariable Long id, @RequestBody String raison) {
        try {
            missionService.refuserMission(id, raison);
            return ResponseEntity.ok("{\"message\": \"Mission refusée avec succès\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<Mission>> getMissionsEnAttente() {
        return ResponseEntity.ok(missionService.getMissionsEnAttente());
    }

    @GetMapping("/chauffeur/{id}")
    public ResponseEntity<List<Mission>> getMissionsParChauffeur(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.getMissionsParChauffeur(id));
    }

    @GetMapping("/historique/chauffeur/{id}")
    public ResponseEntity<List<Mission>> getHistoriqueMissions(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.getHistoriqueMissions(id));
    }

    @PostMapping("/{id}/signaler-probleme")
    public ResponseEntity<String> signalerProbleme(@PathVariable Long id, @RequestBody String probleme) {
        try {
            missionService.signalerProbleme(id, probleme);
            return ResponseEntity.ok("{\"message\": \"Problème signalé avec succès\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
