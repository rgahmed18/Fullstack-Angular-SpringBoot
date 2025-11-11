package ma.formation.jdbc.application.controller;

import ma.formation.jdbc.application.model.Vehicule;
import ma.formation.jdbc.application.model.Mission;
import ma.formation.jdbc.application.service.VehicleService;
import ma.formation.jdbc.application.repository.MissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private MissionRepository missionRepository;

    @PostMapping
    public ResponseEntity<Vehicule> createVehicle(@RequestBody Vehicule vehicle) {
        return ResponseEntity.ok(vehicleService.createVehicle(vehicle));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicule> updateVehicle(@PathVariable Long id, @RequestBody Vehicule vehicle) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, vehicle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllVehicles() {
        List<Vehicule> vehicles = vehicleService.getAllVehicles();
        List<Mission.EtatMission> activeMissionStates = Arrays.asList(
            Mission.EtatMission.COMMENCEE, 
            Mission.EtatMission.EN_COURS
        );
        
        List<Map<String, Object>> vehicleData = vehicles.stream().map(vehicle -> {
            Map<String, Object> vehicleInfo = new HashMap<>();
            vehicleInfo.put("id", vehicle.getId());
            vehicleInfo.put("immatriculation", vehicle.getImmatriculation());
            vehicleInfo.put("marque", vehicle.getMarque());
            vehicleInfo.put("modele", vehicle.getModele());
            vehicleInfo.put("capacite", vehicle.getCapacite());
            vehicleInfo.put("disponible", vehicle.isDisponible());
            
            // Check if vehicle is currently assigned to an active mission
            List<Mission> activeMissions = missionRepository.findAll().stream()
                .filter(mission -> mission.getVehicule() != null && 
                                 mission.getVehicule().getId().equals(vehicle.getId()) &&
                                 activeMissionStates.contains(mission.getEtat()))
                .collect(Collectors.toList());
            
            if (!activeMissions.isEmpty()) {
                Mission activeMission = activeMissions.get(0);
                Map<String, Object> chauffeurInfo = new HashMap<>();
                if (activeMission.getChauffeur() != null) {
                    chauffeurInfo.put("id", activeMission.getChauffeur().getId());
                    chauffeurInfo.put("nom", activeMission.getChauffeur().getNom());
                    chauffeurInfo.put("prenom", activeMission.getChauffeur().getPrenom());
                }
                vehicleInfo.put("chauffeur", chauffeurInfo);
                vehicleInfo.put("currentMissionId", activeMission.getId());
                vehicleInfo.put("currentMissionStatus", activeMission.getEtat().toString());
                vehicleInfo.put("isInActiveMission", true);
            } else {
                // Check static assignment
                if (vehicle.getChauffeur() != null) {
                    Map<String, Object> chauffeurInfo = new HashMap<>();
                    chauffeurInfo.put("id", vehicle.getChauffeur().getId());
                    chauffeurInfo.put("nom", vehicle.getChauffeur().getNom());
                    chauffeurInfo.put("prenom", vehicle.getChauffeur().getPrenom());
                    vehicleInfo.put("chauffeur", chauffeurInfo);
                } else {
                    vehicleInfo.put("chauffeur", null);
                }
                vehicleInfo.put("currentMissionId", null);
                vehicleInfo.put("currentMissionStatus", null);
                vehicleInfo.put("isInActiveMission", false);
            }
            
            return vehicleInfo;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(vehicleData);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicule> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Vehicule>> getAvailableVehicles() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getVehicleCount() {
        return ResponseEntity.ok((long) vehicleService.getAllVehicles().size());
    }

    @GetMapping("/available/count")
    public ResponseEntity<Long> getAvailableVehicleCount() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicleCount());
    }
}
