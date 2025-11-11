package ma.formation.jdbc.application.dto;

import lombok.Data;

@Data
public class CreateMissionRequest {
    private String destination;
    private String depart;
    private String dateHeure; // Changed to String to handle ISO format from frontend
    private String typeMission;
    private String instructions;
    private Long employeId;
    private Long chauffeurId;
    private Long vehiculeId;
}
