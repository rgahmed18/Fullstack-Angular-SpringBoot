package ma.formation.jdbc.application.model;

import java.util.Set;

public class AuthResponse {
    private Long id;
    private String email;
    private UserRole role;
    private String userType; // Add userType field for frontend compatibility
    private boolean active;
    private Set<String> permissions;
    private Long employeId; // Add employeId for employee users
    private Long chauffeurId; // Add chauffeurId for driver users

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Set<String> getPermissions() { return permissions; }
    public void setPermissions(Set<String> permissions) { this.permissions = permissions; }
    public Long getEmployeId() { return employeId; }
    public void setEmployeId(Long employeId) { this.employeId = employeId; }
    public Long getChauffeurId() { return chauffeurId; }
    public void setChauffeurId(Long chauffeurId) { this.chauffeurId = chauffeurId; }

    public static AuthResponse fromUser(User user) {
        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        // Set userType for frontend compatibility
        String userType = switch (user.getRole()) {
            case ADMIN -> "admin";
            case EMPLOYE -> "employee";
            case CHAUFFEUR -> "driver";
        };
        response.setUserType(userType);
        response.setActive(user.isActive());
        response.setPermissions(user.getPermissions());
        return response;
    }
    
    public static AuthResponse fromUserWithEmployeId(User user, Long employeId) {
        AuthResponse response = fromUser(user);
        response.setEmployeId(employeId);
        return response;
    }
    
    public static AuthResponse fromUserWithChauffeurId(User user, Long chauffeurId) {
        AuthResponse response = fromUser(user);
        response.setChauffeurId(chauffeurId);
        return response;
    }
}
