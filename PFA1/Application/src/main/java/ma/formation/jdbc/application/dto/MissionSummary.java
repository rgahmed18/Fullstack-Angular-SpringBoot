package ma.formation.jdbc.application.dto;

import java.time.LocalDateTime;

public class MissionSummary {
    private Long id;
    private String destination;
    private String depart;
    private LocalDateTime dateHeure;
    private String etat;
    private String typeMission;
    private String description;
    private String chauffeurNom;
    private String chauffeurPrenom;

    // Constructors
    public MissionSummary() {}

    public MissionSummary(Long id, String destination, String depart, LocalDateTime dateHeure, String etat, String typeMission) {
        this.id = id;
        this.destination = destination;
        this.depart = depart;
        this.dateHeure = dateHeure;
        this.etat = etat;
        this.typeMission = typeMission;
    }

    public MissionSummary(Long id, String destination, String depart, LocalDateTime dateHeure, String etat, String typeMission, String description, String chauffeurNom, String chauffeurPrenom) {
        this.id = id;
        this.destination = destination;
        this.depart = depart;
        this.dateHeure = dateHeure;
        this.etat = etat;
        this.typeMission = typeMission;
        this.description = description;
        this.chauffeurNom = chauffeurNom;
        this.chauffeurPrenom = chauffeurPrenom;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getDepart() {
        return depart;
    }

    public void setDepart(String depart) {
        this.depart = depart;
    }

    public LocalDateTime getDateHeure() {
        return dateHeure;
    }

    public void setDateHeure(LocalDateTime dateHeure) {
        this.dateHeure = dateHeure;
    }

    public String getEtat() {
        return etat;
    }

    public void setEtat(String etat) {
        this.etat = etat;
    }

    public String getTypeMission() {
        return typeMission;
    }

    public void setTypeMission(String typeMission) {
        this.typeMission = typeMission;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getChauffeurNom() {
        return chauffeurNom;
    }

    public void setChauffeurNom(String chauffeurNom) {
        this.chauffeurNom = chauffeurNom;
    }

    public String getChauffeurPrenom() {
        return chauffeurPrenom;
    }

    public void setChauffeurPrenom(String chauffeurPrenom) {
        this.chauffeurPrenom = chauffeurPrenom;
    }
}
