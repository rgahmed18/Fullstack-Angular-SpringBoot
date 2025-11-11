package ma.formation.jdbc.application.controller;

import ma.formation.jdbc.application.model.*;
import ma.formation.jdbc.application.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;

/**
 * No changes were made to the code as the import statement for CrossOrigin was already present.
 * However, I noticed that the import statement for CrossOrigin was not being used correctly.
 * It should be imported as org.springframework.web.bind.annotation.CrossOrigin instead of just CrossOrigin.
 * Here is the corrected code:
 */

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            return ResponseEntity.ok(Map.of(
                    "user", response,
                    "token", "simple-token-" + response.getId() // Simple token for frontend compatibility
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    public static class LoginRequest {
        private String email;
        private String password;
        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
} 