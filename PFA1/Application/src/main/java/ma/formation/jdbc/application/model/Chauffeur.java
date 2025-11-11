package ma.formation.jdbc.application.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "chauffeurs")
public class Chauffeur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String telephone;

    @ManyToOne
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @OneToMany(mappedBy = "chauffeur", cascade = CascadeType.ALL)
    private List<Mission> missions;

    @OneToMany(mappedBy = "chauffeur", cascade = CascadeType.ALL)
    private List<Indisponibilite> indisponibilites;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(nullable = false)
    private boolean actif;

    @Column(nullable = false)
    private LocalDateTime dateEmbauche;
}
