package ma.formation.jdbc.application.repository;

import ma.formation.jdbc.application.model.Admin;
import ma.formation.jdbc.application.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUser(User user);
}
