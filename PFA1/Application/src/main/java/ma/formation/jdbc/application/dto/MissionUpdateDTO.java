package ma.formation.jdbc.application.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MissionUpdateDTO {
    private String depart;
    private String destination;
    private LocalDateTime dateHeure;
    private String etat;
    private String typeMission;
    private Long chauffeurId;
    private Long vehiculeId;
    private Long employeId;
}
