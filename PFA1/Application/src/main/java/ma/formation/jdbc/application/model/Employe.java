package ma.formation.jdbc.application.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "employes")
public class Employe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String telephone;

    @Column(name = "date_embauche")
    private LocalDateTime dateEmbauche;

    @Column(nullable = false)
    private boolean actif = true;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL)
    private List<Mission> missions;

    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL)
    private List<Notification> notifications;
}
