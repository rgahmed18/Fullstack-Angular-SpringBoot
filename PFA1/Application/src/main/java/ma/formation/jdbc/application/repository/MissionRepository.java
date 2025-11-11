package ma.formation.jdbc.application.repository;

import ma.formation.jdbc.application.model.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByEtat(Mission.EtatMission etat);

    List<Mission> findByChauffeurId(Long chauffeurId);

    @Query("SELECT m FROM Mission m WHERE m.chauffeur.id = :chauffeurId AND m.etat IN :etats")
    List<Mission> findByChauffeurIdAndEtatIn(@Param("chauffeurId") Long chauffeurId,
                                            @Param("etats") List<Mission.EtatMission> etats);

    List<Mission> findByChauffeurIdOrderByDateHeureDesc(Long chauffeurId);

    List<Mission> findByEmployeId(Long employeId);

    Optional<Mission> findById(Long id);

    // Get all missions ordered by date descending (most recent first)
    List<Mission> findAllByOrderByDateHeureDesc();

    // Find missions with problems that are back in EN_ATTENTE status (for reassignment)
    List<Mission> findByProblemeIsNotNullAndEtat(Mission.EtatMission etat);

    // Find missions by employee ID and specific states
    @Query("SELECT m FROM Mission m WHERE m.employe.id = :employeId AND m.etat IN :etats")
    List<Mission> findByEmployeIdAndEtatIn(@Param("employeId") Long employeId,
                                          @Param("etats") List<Mission.EtatMission> etats);

    // Check if chauffeur has active missions
    boolean existsByChauffeurAndEtatIn(ma.formation.jdbc.application.model.Chauffeur chauffeur,
                                      List<Mission.EtatMission> etats);

    // Check if vehicle is assigned to active missions
    boolean existsByVehiculeAndEtatIn(ma.formation.jdbc.application.model.Vehicule vehicule,
                                     List<Mission.EtatMission> etats);
}
