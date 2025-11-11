package ma.formation.jdbc.application.service;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private ChauffeurRepository chauffeurRepository;
    @Autowired
    private EmployeRepository employeRepository;

    public AuthResponse authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Since we're using NoOpPasswordEncoder, compare passwords directly
        if (!password.equals(user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Compte désactivé");
        }

        // If user is an employee, fetch the employeId
        if (user.getRole() == UserRole.EMPLOYE) {
            return employeRepository.findByUserId(user.getId())
                .map(employe -> AuthResponse.fromUserWithEmployeId(user, employe.getId()))
                .orElse(AuthResponse.fromUser(user));
        }
        
        // If user is a driver, fetch the chauffeurId
        if (user.getRole() == UserRole.CHAUFFEUR) {
            return chauffeurRepository.findByUserId(user.getId())
                .map(chauffeur -> AuthResponse.fromUserWithChauffeurId(user, chauffeur.getId()))
                .orElse(AuthResponse.fromUser(user));
        }

        return AuthResponse.fromUser(user);
    }
}
