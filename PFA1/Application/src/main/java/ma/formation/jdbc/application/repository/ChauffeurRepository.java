package ma.formation.jdbc.application.repository;

import ma.formation.jdbc.application.model.Chauffeur;
import ma.formation.jdbc.application.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChauffeurRepository extends JpaRepository<Chauffeur, Long> {
    List<Chauffeur> findByActifTrue();

    Optional<Chauffeur> findByUser(User user);
    
    Optional<Chauffeur> findByUserId(Long userId);
}
