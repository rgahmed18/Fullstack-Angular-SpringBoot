package ma.formation.jdbc.application.dto;

import ma.formation.jdbc.application.model.Notification;
import java.time.LocalDateTime;

public class NotificationResponseDTO {
    private Long id;
    private String type;
    private String message;
    private LocalDateTime dateEnvoi;
    private boolean lue;
    
    // Mission info (if applicable)
    private Long missionId;
    private String missionDestination;
    
    // Leave request info (if applicable)
    private Long indisponibiliteId;
    private String indisponibiliteType;
    private LocalDateTime indisponibiliteDebut;
    private LocalDateTime indisponibiliteFin;

    // Default constructor
    public NotificationResponseDTO() {}

    // Constructor from Notification entity
    public NotificationResponseDTO(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType();
        this.message = notification.getMessage();
        this.dateEnvoi = notification.getDateEnvoi();
        this.lue = notification.isLue();
        
        // Add mission info if present
        if (notification.getMission() != null) {
            this.missionId = notification.getMission().getId();
            this.missionDestination = notification.getMission().getDestination();
        }
        
        // Add indisponibilite info if present
        if (notification.getIndisponibilite() != null) {
            this.indisponibiliteId = notification.getIndisponibilite().getId();
            this.indisponibiliteType = notification.getIndisponibilite().getType();
            this.indisponibiliteDebut = notification.getIndisponibilite().getDateDebut();
            this.indisponibiliteFin = notification.getIndisponibilite().getDateFin();
        }
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getDateEnvoi() { return dateEnvoi; }
    public void setDateEnvoi(LocalDateTime dateEnvoi) { this.dateEnvoi = dateEnvoi; }

    public boolean isLue() { return lue; }
    public void setLue(boolean lue) { this.lue = lue; }

    public Long getMissionId() { return missionId; }
    public void setMissionId(Long missionId) { this.missionId = missionId; }

    public String getMissionDestination() { return missionDestination; }
    public void setMissionDestination(String missionDestination) { this.missionDestination = missionDestination; }

    public Long getIndisponibiliteId() { return indisponibiliteId; }
    public void setIndisponibiliteId(Long indisponibiliteId) { this.indisponibiliteId = indisponibiliteId; }

    public String getIndisponibiliteType() { return indisponibiliteType; }
    public void setIndisponibiliteType(String indisponibiliteType) { this.indisponibiliteType = indisponibiliteType; }

    public LocalDateTime getIndisponibiliteDebut() { return indisponibiliteDebut; }
    public void setIndisponibiliteDebut(LocalDateTime indisponibiliteDebut) { this.indisponibiliteDebut = indisponibiliteDebut; }

    public LocalDateTime getIndisponibiliteFin() { return indisponibiliteFin; }
    public void setIndisponibiliteFin(LocalDateTime indisponibiliteFin) { this.indisponibiliteFin = indisponibiliteFin; }
}
