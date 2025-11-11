package ma.formation.jdbc.application.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "missions")
public class Mission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private String depart;

    @Column(nullable = false)
    private LocalDateTime dateHeure;

    @Column(nullable = false)
    private String typeMission; // materiel, document, personnel

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Enumerated(EnumType.STRING)
    private EtatMission etat;

    public EtatMission getEtat() {
        return etat;
    }

    public void setEtat(EtatMission etat) {
        this.etat = etat;
    }

    @ManyToOne
    @JoinColumn(name = "chauffeur_id")
    private Chauffeur chauffeur;

    public Chauffeur getChauffeur() {
        return chauffeur;
    }

    public void setChauffeur(Chauffeur chauffeur) {
        this.chauffeur = chauffeur;
    }

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @Column(columnDefinition = "TEXT")
    private String probleme;

    @Column(nullable = false)
    private boolean acceptee;

    public boolean isAcceptee() {
        return acceptee;
    }

    public void setAcceptee(boolean acceptee) {
        this.acceptee = acceptee;
    }

    public enum EtatMission {
        EN_ATTENTE, COMMENCEE, EN_COURS, TERMINEE, REFUSEE
    }
}
