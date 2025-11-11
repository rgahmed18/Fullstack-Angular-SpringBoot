package ma.formation.jdbc.application.repository;

import ma.formation.jdbc.application.model.Employe;
import ma.formation.jdbc.application.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmployeRepository extends JpaRepository<Employe, Long> {
    Optional<Employe> findByUser(User user);
    Optional<Employe> findByUserId(Long userId);
}
