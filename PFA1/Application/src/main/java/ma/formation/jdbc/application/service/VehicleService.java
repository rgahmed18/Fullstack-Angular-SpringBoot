package ma.formation.jdbc.application.service;

import ma.formation.jdbc.application.model.Vehicule;
import ma.formation.jdbc.application.repository.VehiculeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {
    
    @Autowired
    private VehiculeRepository vehiculeRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public Vehicule createVehicle(Vehicule vehicle) {
        Vehicule existingVehicle = vehiculeRepository.findByImmatriculation(vehicle.getImmatriculation());
        if (existingVehicle != null) {
            throw new RuntimeException("Vehicle with this registration number already exists");
        }
        return vehiculeRepository.save(vehicle);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Vehicule updateVehicle(Long id, Vehicule vehicle) {
        Optional<Vehicule> existingVehicle = vehiculeRepository.findById(id);
        if (existingVehicle.isEmpty()) {
            throw new RuntimeException("Vehicle not found");
        }

        Vehicule updatedVehicle = existingVehicle.get();
        updatedVehicle.setImmatriculation(vehicle.getImmatriculation());
        updatedVehicle.setMarque(vehicle.getMarque());
        updatedVehicle.setModele(vehicle.getModele());
        updatedVehicle.setCapacite(vehicle.getCapacite());
        updatedVehicle.setDisponible(vehicle.isDisponible());
        return vehiculeRepository.save(updatedVehicle);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteVehicle(Long id) {
        Optional<Vehicule> vehicle = vehiculeRepository.findById(id);
        if (vehicle.isEmpty()) {
            throw new RuntimeException("Vehicle not found");
        }
        vehiculeRepository.delete(vehicle.get());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<Vehicule> getAllVehicles() {
        return vehiculeRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Vehicule getVehicleById(Long id) {
        return vehiculeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    /**
     * Get all available vehicles (disponible = true)
     */
    public List<Vehicule> getAvailableVehicles() {
        return vehiculeRepository.findByDisponibleTrue();
    }
    
    /**
     * Mark vehicle as unavailable (when assigned to a mission)
     */
    public void markVehicleAsUnavailable(Long vehicleId) {
        Vehicule vehicule = getVehicleById(vehicleId);
        vehicule.setDisponible(false);
        vehiculeRepository.save(vehicule);
    }
    
    /**
     * Mark vehicle as available (when mission is completed or cancelled)
     */
    public void markVehicleAsAvailable(Long vehicleId) {
        Vehicule vehicule = getVehicleById(vehicleId);
        vehicule.setDisponible(true);
        vehiculeRepository.save(vehicule);
    }
    
    /**
     * Check if vehicle is available
     */
    public boolean isVehicleAvailable(Long vehicleId) {
        Vehicule vehicule = getVehicleById(vehicleId);
        return vehicule.isDisponible();
    }
    
    /**
     * Get count of available vehicles
     */
    public long getAvailableVehicleCount() {
        return vehiculeRepository.countByDisponible(true);
    }
}
