package ma.formation.jdbc.application.dto;

import lombok.Data;
import java.util.List;

@Data
public class MissionFormDataDTO {
    private List<EmployeDTO> employes;
    private List<ChauffeurDTO> chauffeurs;
    private List<VehiculeDTO> vehicules;
    
    @Data
    public static class EmployeDTO {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
        
        public EmployeDTO(Long id, String nom, String prenom, String email) {
            this.id = id;
            this.nom = nom;
            this.prenom = prenom;
            this.email = email;
        }
    }
    
    @Data
    public static class ChauffeurDTO {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
        
        public ChauffeurDTO(Long id, String nom, String prenom, String email) {
            this.id = id;
            this.nom = nom;
            this.prenom = prenom;
            this.email = email;
        }
    }
    
    @Data
    public static class VehiculeDTO {
        private Long id;
        private String immatriculation;
        private String marque;
        private String modele;
        private int capacite;
        private boolean disponible;
        
        public VehiculeDTO(Long id, String immatriculation, String marque, String modele, int capacite, boolean disponible) {
            this.id = id;
            this.immatriculation = immatriculation;
            this.marque = marque;
            this.modele = modele;
            this.capacite = capacite;
            this.disponible = disponible;
        }
    }
}
