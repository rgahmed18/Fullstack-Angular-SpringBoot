package ma.formation.jdbc.application.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "vehicules")
public class Vehicule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String immatriculation;

    @Column(nullable = false)
    private String marque;

    @Column(nullable = false)
    private String modele;

    @Column(nullable = false)
    private int capacite; // en kg

    @Column(nullable = false)
    private boolean disponible;

    @OneToOne(mappedBy = "vehicule")
    private Chauffeur chauffeur;
}
