package ma.formation.jdbc.application.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChauffeurDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private boolean actif;
    private LocalDateTime dateEmbauche;
    private String vehiculeInfo; // Simple string representation of vehicle
    
    // Constructor for easy conversion from Chauffeur entity
    public ChauffeurDTO(Long id, String nom, String prenom, String email, String telephone, boolean actif) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.actif = actif;
    }
}
