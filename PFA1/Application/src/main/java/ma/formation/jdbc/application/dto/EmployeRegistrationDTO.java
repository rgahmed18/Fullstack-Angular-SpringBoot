package ma.formation.jdbc.application.dto;

import java.time.LocalDateTime;

public class EmployeRegistrationDTO {
    public String nom;
    public String prenom;
    public String telephone;
    public String email;
    public String password;
    public LocalDateTime dateEmbauche;
    public boolean actif = true;
}