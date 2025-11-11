package ma.formation.jdbc.application.repository;

import ma.formation.jdbc.application.model.Indisponibilite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IndisponibiliteRepository extends JpaRepository<Indisponibilite, Long> {
    List<Indisponibilite> findByChauffeurId(Long chauffeurId);

    List<Indisponibilite> findByAccepteeFalse();
    
    List<Indisponibilite> findByStatut(String statut);
}
