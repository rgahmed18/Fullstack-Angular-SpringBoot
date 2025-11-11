package ma.formation.jdbc.application.dto;

import ma.formation.jdbc.application.model.Notification;
import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private String type;
    private String message;
    private LocalDateTime dateEnvoi;
    private boolean lue;
    private Long missionId;
    private String missionDestination;
    private String missionDepart;
    private Long employeId;
    private String employeNom;
    private String employePrenom;

    // Default constructor
    public NotificationDTO() {}

    // Constructor from Notification entity
    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType();
        this.message = notification.getMessage();
        this.dateEnvoi = notification.getDateEnvoi();
        this.lue = notification.isLue();
        
        if (notification.getMission() != null) {
            this.missionId = notification.getMission().getId();
            this.missionDestination = notification.getMission().getDestination();
            this.missionDepart = notification.getMission().getDepart();
        }
        
        if (notification.getEmploye() != null) {
            this.employeId = notification.getEmploye().getId();
            this.employeNom = notification.getEmploye().getNom();
            this.employePrenom = notification.getEmploye().getPrenom();
        }
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getDateEnvoi() {
        return dateEnvoi;
    }

    public void setDateEnvoi(LocalDateTime dateEnvoi) {
        this.dateEnvoi = dateEnvoi;
    }

    public boolean isLue() {
        return lue;
    }

    public void setLue(boolean lue) {
        this.lue = lue;
    }

    public Long getMissionId() {
        return missionId;
    }

    public void setMissionId(Long missionId) {
        this.missionId = missionId;
    }

    public String getMissionDestination() {
        return missionDestination;
    }

    public void setMissionDestination(String missionDestination) {
        this.missionDestination = missionDestination;
    }

    public String getMissionDepart() {
        return missionDepart;
    }

    public void setMissionDepart(String missionDepart) {
        this.missionDepart = missionDepart;
    }

    public Long getEmployeId() {
        return employeId;
    }

    public void setEmployeId(Long employeId) {
        this.employeId = employeId;
    }

    public String getEmployeNom() {
        return employeNom;
    }

    public void setEmployeNom(String employeNom) {
        this.employeNom = employeNom;
    }

    public String getEmployePrenom() {
        return employePrenom;
    }

    public void setEmployePrenom(String employePrenom) {
        this.employePrenom = employePrenom;
    }
}
