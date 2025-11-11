package ma.formation.jdbc.application.dto;

import ma.formation.jdbc.application.model.Employe;

public class EmployeDetailsDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String telephone;

    public EmployeDetailsDTO() {}

    public EmployeDetailsDTO(Employe employe) {
        this.id = employe.getId();
        this.nom = employe.getNom();
        this.prenom = employe.getPrenom();
        this.telephone = employe.getTelephone();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }
}
