```mermaid
%%{init: {'theme': 'default', 'width': 1200, 'height': 800}}%%
classDiagram
    %% Enums
    class UserRole {
        <<enumeration>>
        ADMIN
        EMPLOYE
        CHAUFFEUR
    }

    class EtatMission {
        <<enumeration>>
        EN_ATTENTE
        COMMENCEE
        EN_COURS
        TERMINEE
        REFUSEE
    }

    %% Core Entities
    class User {
        -Long id
        -String email
        -String password
        -UserRole role
        -boolean active
        -Set<String> permissions
        +getId() Long
        +setId(Long id) void
        +getEmail() String
        +setEmail(String email) void
        +getPassword() String
        +setPassword(String password) void
        +getRole() UserRole
        +setRole(UserRole role) void
        +isActive() boolean
        +setActive(boolean active) void
        +getPermissions() Set<String>
        +setPermissions(Set<String> permissions) void
    }

    class Admin {
        -Long id
        -String nom
        -String prenom
        -String telephone
        -User user
    }

    class Employe {
        -Long id
        -String nom
        -String prenom
        -String telephone
        -LocalDateTime dateEmbauche
        -boolean actif
        -User user
        -List<Mission> missions
        -List<Notification> notifications
    }

    class Chauffeur {
        -Long id
        -String nom
        -String prenom
        -String telephone
        -Vehicule vehicule
        -List<Mission> missions
        -List<Indisponibilite> indisponibilites
        -User user
        -boolean actif
        -LocalDateTime dateEmbauche
    }

    class Mission {
        -Long id
        -String destination
        -String depart
        -LocalDateTime dateHeure
        -String typeMission
        -String instructions
        -EtatMission etat
        -Chauffeur chauffeur
        -Employe employe
        -Vehicule vehicule
        -String probleme
        -boolean acceptee
        +getEtat() EtatMission
        +setEtat(EtatMission etat) void
        +getChauffeur() Chauffeur
        +setChauffeur(Chauffeur chauffeur) void
        +isAcceptee() boolean
        +setAcceptee(boolean acceptee) void
    }

    class Vehicule {
        -Long id
        -String immatriculation
        -String marque
        -String modele
        -int capacite
        -boolean disponible
        -Chauffeur chauffeur
    }

    class Notification {
        -Long id
        -Employe employe
        -Admin admin
        -Chauffeur chauffeur
        -Mission mission
        -Indisponibilite indisponibilite
        -String type
        -LocalDateTime dateEnvoi
        -boolean lue
        -String message
    }

    class Indisponibilite {
        -Long id
        -Chauffeur chauffeur
        -LocalDateTime dateDebut
        -LocalDateTime dateFin
        -String type
        -String raison
        -boolean acceptee
        -String statut
        +isAcceptee() boolean
        +setAcceptee(boolean acceptee) void
        +getStatut() String
        +setStatut(String statut) void
    }

    %% Relationships
    User --> Admin
    User --> Employe
    User --> Chauffeur
    User o--o UserRole

    Chauffeur o--o Vehicule
    Vehicule o--o Chauffeur

    Mission o--o Employe
    Mission o--o Chauffeur
    Mission o--o Vehicule
    Mission o--o EtatMission

    Chauffeur o--o Mission
    Employe o--o Mission

    Chauffeur o--o Indisponibilite

    Employe o--o Notification
    Admin o--o Notification
    Chauffeur o--o Notification

    Notification o--o Mission
    Notification o--o Indisponibilite

    %% Styling
    classDef enumClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef entityClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef coreClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:3px

    class UserRole enumClass
    class EtatMission enumClass
    class User coreClass
    class Mission coreClass
    class Admin entityClass
    class Employe entityClass
    class Chauffeur entityClass
    class Vehicule entityClass
    class Notification entityClass
    class Indisponibilite entityClass
