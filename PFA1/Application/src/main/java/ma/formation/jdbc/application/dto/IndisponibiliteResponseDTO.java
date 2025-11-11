package ma.formation.jdbc.application.dto;

import ma.formation.jdbc.application.model.Indisponibilite;
import java.time.LocalDateTime;

public class IndisponibiliteResponseDTO {
    private Long id;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String type;
    private String raison;
    private boolean acceptee;
    private String statut;
    private Long chauffeurId;
    private String chauffeurNom;
    private String chauffeurPrenom;
    private String chauffeurTelephone;

    public IndisponibiliteResponseDTO() {}

    public IndisponibiliteResponseDTO(Indisponibilite indisponibilite) {
        this.id = indisponibilite.getId();
        this.dateDebut = indisponibilite.getDateDebut();
        this.dateFin = indisponibilite.getDateFin();
        this.type = indisponibilite.getType();
        this.raison = indisponibilite.getRaison();
        this.acceptee = indisponibilite.isAcceptee();
        this.statut = indisponibilite.getStatut();
        
        if (indisponibilite.getChauffeur() != null) {
            this.chauffeurId = indisponibilite.getChauffeur().getId();
            this.chauffeurNom = indisponibilite.getChauffeur().getNom();
            this.chauffeurPrenom = indisponibilite.getChauffeur().getPrenom();
            this.chauffeurTelephone = indisponibilite.getChauffeur().getTelephone();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDateTime dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDateTime getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDateTime dateFin) {
        this.dateFin = dateFin;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRaison() {
        return raison;
    }

    public void setRaison(String raison) {
        this.raison = raison;
    }

    public boolean isAcceptee() {
        return acceptee;
    }

    public void setAcceptee(boolean acceptee) {
        this.acceptee = acceptee;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Long getChauffeurId() {
        return chauffeurId;
    }

    public void setChauffeurId(Long chauffeurId) {
        this.chauffeurId = chauffeurId;
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

    public String getChauffeurTelephone() {
        return chauffeurTelephone;
    }

    public void setChauffeurTelephone(String chauffeurTelephone) {
        this.chauffeurTelephone = chauffeurTelephone;
    }
}
