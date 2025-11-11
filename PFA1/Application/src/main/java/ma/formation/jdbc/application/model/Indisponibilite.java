package ma.formation.jdbc.application.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "indisponibilites")
public class Indisponibilite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "chauffeur_id")
    private Chauffeur chauffeur;

    @Column(nullable = false)
    private LocalDateTime dateDebut;

    @Column(nullable = false)
    private LocalDateTime dateFin;

    @Column(nullable = false)
    private String type; // CONGE

    @Column(columnDefinition = "TEXT")
    private String raison;

    @Column(nullable = false)
    private boolean acceptee;

    @Column(nullable = false)
    private String statut = "EN_ATTENTE"; // EN_ATTENTE, ACCEPTEE, REFUSEE

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
}
