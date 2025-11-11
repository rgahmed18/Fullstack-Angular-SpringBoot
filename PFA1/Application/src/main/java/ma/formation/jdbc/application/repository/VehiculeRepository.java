package ma.formation.jdbc.application.repository;

import ma.formation.jdbc.application.model.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {
    List<Vehicule> findByDisponibleTrue();
    
    long countByDisponible(boolean disponible);

    Vehicule findByImmatriculation(String immatriculation);
}
