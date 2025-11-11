package ma.formation.jdbc.application.dto;

import ma.formation.jdbc.application.model.Mission;
import java.time.LocalDateTime;

public class MissionResponseDTO {
    private Long id;
    private String destination;
    private String depart;
    private LocalDateTime dateHeure;
    private String typeMission;
    private String instructions;
    private String etat;
    private EmployeInfo employe;
    private ChauffeurInfo chauffeur;
    private VehiculeInfo vehicule;
    private String probleme;
    private boolean acceptee;

    // Nested classes for employee and driver info
    public static class EmployeInfo {
        private Long id;
        private String nom;
        private String prenom;

        public EmployeInfo(Long id, String nom, String prenom) {
            this.id = id;
            this.nom = nom;
            this.prenom = prenom;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
    }

    public static class ChauffeurInfo {
        private Long id;
        private String nom;
        private String prenom;
        private String telephone;

        public ChauffeurInfo(Long id, String nom, String prenom, String telephone) {
            this.id = id;
            this.nom = nom;
            this.prenom = prenom;
            this.telephone = telephone;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
    }

    public static class VehiculeInfo {
        private Long id;
        private String immatriculation;
        private String marque;
        private String modele;

        public VehiculeInfo(Long id, String immatriculation, String marque, String modele) {
            this.id = id;
            this.immatriculation = immatriculation;
            this.marque = marque;
            this.modele = modele;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getImmatriculation() { return immatriculation; }
        public void setImmatriculation(String immatriculation) { this.immatriculation = immatriculation; }
        public String getMarque() { return marque; }
        public void setMarque(String marque) { this.marque = marque; }
        public String getModele() { return modele; }
        public void setModele(String modele) { this.modele = modele; }
    }

    // Constructor
    public MissionResponseDTO(Mission mission) {
        this.id = mission.getId();
        this.destination = mission.getDestination();
        this.depart = mission.getDepart();
        this.dateHeure = mission.getDateHeure();
        this.typeMission = mission.getTypeMission();
        this.instructions = mission.getInstructions();
        this.etat = mission.getEtat() != null ? mission.getEtat().name() : "EN_ATTENTE";
        this.probleme = mission.getProbleme();
        this.acceptee = mission.isAcceptee();
        
        // Safely extract employe info
        if (mission.getEmploye() != null) {
            this.employe = new EmployeInfo(
                mission.getEmploye().getId(),
                mission.getEmploye().getNom(),
                mission.getEmploye().getPrenom()
            );
        }
        
        // Safely extract chauffeur info
        if (mission.getChauffeur() != null) {
            this.chauffeur = new ChauffeurInfo(
                mission.getChauffeur().getId(),
                mission.getChauffeur().getNom(),
                mission.getChauffeur().getPrenom(),
                mission.getChauffeur().getTelephone()
            );
        }
        
        // Safely extract vehicule info
        if (mission.getVehicule() != null) {
            this.vehicule = new VehiculeInfo(
                mission.getVehicule().getId(),
                mission.getVehicule().getImmatriculation(),
                mission.getVehicule().getMarque(),
                mission.getVehicule().getModele()
            );
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getDepart() { return depart; }
    public void setDepart(String depart) { this.depart = depart; }

    public LocalDateTime getDateHeure() { return dateHeure; }
    public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }

    public String getTypeMission() { return typeMission; }
    public void setTypeMission(String typeMission) { this.typeMission = typeMission; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getEtat() { return etat; }
    public void setEtat(String etat) { this.etat = etat; }

    public EmployeInfo getEmploye() { return employe; }
    public void setEmploye(EmployeInfo employe) { this.employe = employe; }

    public ChauffeurInfo getChauffeur() { return chauffeur; }
    public void setChauffeur(ChauffeurInfo chauffeur) { this.chauffeur = chauffeur; }

    public VehiculeInfo getVehicule() { return vehicule; }
    public void setVehicule(VehiculeInfo vehicule) { this.vehicule = vehicule; }

    public String getProbleme() { return probleme; }
    public void setProbleme(String probleme) { this.probleme = probleme; }

    public boolean isAcceptee() { return acceptee; }
    public void setAcceptee(boolean acceptee) { this.acceptee = acceptee; }
}
