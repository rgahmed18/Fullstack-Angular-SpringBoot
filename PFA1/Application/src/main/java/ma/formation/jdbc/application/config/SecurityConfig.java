package ma.formation.jdbc.application.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors
                        .configurationSource(request -> {
                            org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();
                            config.setAllowCredentials(true);
                            config.addAllowedOrigin("http://localhost:4200");
                            config.addAllowedHeader("*");
                            config.addAllowedMethod("*");
                            return config;
                        }))
                .authorizeHttpRequests(auth -> auth
                        // Specific endpoints that should be public (must come first)
                        .requestMatchers(
                                new AntPathRequestMatcher("/api/auth/login"),
                                new AntPathRequestMatcher("/api/admin/create-chauffeur"),
                                new AntPathRequestMatcher("/api/admin/create-employe"),
                                new AntPathRequestMatcher("/api/admin/create-vehicule"),
                                new AntPathRequestMatcher("/api/admin/create-mission"),
                                new AntPathRequestMatcher("/api/admin/mission-form-data"),
                                new AntPathRequestMatcher("/api/admin/dashboard/stats"),
                                new AntPathRequestMatcher("/api/admin/missions/count"),
                                new AntPathRequestMatcher("/api/admin/missions"),
                                new AntPathRequestMatcher("/api/admin/missions/*"),
                                new AntPathRequestMatcher("/api/admin/demandes-conge"),
                                new AntPathRequestMatcher("/api/admin/demandes-conge/*/accepter"),
                                new AntPathRequestMatcher("/api/admin/demandes-conge/*/refuser"),
                                new AntPathRequestMatcher("/api/admin/notifications"),
                                new AntPathRequestMatcher("/api/admin/notifications/*"),
                                new AntPathRequestMatcher("/api/admin/notifications/unread-count"),
                                new AntPathRequestMatcher("/api/admin/notifications/mark-all-read"),
                                new AntPathRequestMatcher("/api/admin/notifications/*/mark-read"),

                                new AntPathRequestMatcher("/api/admin/chauffeurs"),
                                new AntPathRequestMatcher("/api/admin/chauffeurs/*"),
                                new AntPathRequestMatcher("/api/admin/chauffeurs/count"),
                                new AntPathRequestMatcher("/api/admin/employes"),
                                new AntPathRequestMatcher("/api/admin/employes/*"),
                                new AntPathRequestMatcher("/api/admin/employes/*/missions"),
                                new AntPathRequestMatcher("/api/admin/historique/chauffeur/*"),
                                new AntPathRequestMatcher("/api/admin/vehicles"),
                                new AntPathRequestMatcher("/api/admin/vehicles/*"),
                                new AntPathRequestMatcher("/api/admin/vehicles/**"),
                                new AntPathRequestMatcher("/api/admin/vehicles/available"),
                                new AntPathRequestMatcher("/api/admin/vehicles/count"),
                                new AntPathRequestMatcher("/api/admin/vehicles/available/count"),
                                new AntPathRequestMatcher("/api/admin/vehicules"),
                                new AntPathRequestMatcher("/api/admin/vehicules/*"),
                                new AntPathRequestMatcher("/api/admin/vehicules/count"),
                                new AntPathRequestMatcher("/api/admin/employes/count"),
                                new AntPathRequestMatcher("/api/employes/*/missions"),
                                new AntPathRequestMatcher("/api/employes/*/missions/with-problems"),
                                new AntPathRequestMatcher("/api/employes/*/missions/*/reassign/*"),
                                new AntPathRequestMatcher("/api/employes/*/dashboard/stats"),
                                new AntPathRequestMatcher("/api/employes/*/notifications"),
                                new AntPathRequestMatcher("/api/employes/*/notifications/unread-count"),
                                new AntPathRequestMatcher("/api/employes/*/notifications/recent"),
                                new AntPathRequestMatcher("/api/employes/*/notifications/mark-all-read"),
                                new AntPathRequestMatcher("/api/notifications/*/mark-read"),
                                new AntPathRequestMatcher("/api/notifications/*"),
                                new AntPathRequestMatcher("/api/employes/*/notifications/non-lues"),
                                new AntPathRequestMatcher("/api/employes/*/notifications/historique"),
                                new AntPathRequestMatcher("/api/employes/notification/*/lue"),
                                new AntPathRequestMatcher("/api/employes/*"),
                                new AntPathRequestMatcher("/api/chauffeurs/*/missions"),
                                new AntPathRequestMatcher("/api/chauffeurs/*/dashboard/stats"),
                                new AntPathRequestMatcher("/api/chauffeurs/*/indisponibilite"),
                                new AntPathRequestMatcher("/api/chauffeurs/*/indisponibilites"),
                                new AntPathRequestMatcher("/api/chauffeurs/*/notifications"),
                                new AntPathRequestMatcher("/api/chauffeurs/*/notifications/unread-count"),
                                new AntPathRequestMatcher("/api/chauffeurs/notifications/*/mark-read"),
                                new AntPathRequestMatcher("/api/chauffeurs/missions/*/accept"),
                                new AntPathRequestMatcher("/api/chauffeurs/missions/*/complete"),
                                new AntPathRequestMatcher("/api/chauffeurs/missions/*/refuse"),
                                new AntPathRequestMatcher("/api/chauffeurs/missions/*/report-problem"),
                                new AntPathRequestMatcher("/api/missions/*/accepter"),
                                new AntPathRequestMatcher("/api/missions/*/refuser"),
                                new AntPathRequestMatcher("/api/missions/*/commencer"),
                                new AntPathRequestMatcher("/api/missions/*/terminer"),
                                new AntPathRequestMatcher("/api/missions/*/signaler-probleme"),
                                new AntPathRequestMatcher("/api/chauffeurs/*"),
                                new AntPathRequestMatcher("/v3/api-docs/**"),
                                new AntPathRequestMatcher("/swagger-ui/**"),
                                new AntPathRequestMatcher("/swagger-ui.html"),
                                new AntPathRequestMatcher("/h2-console/**")
                        ).permitAll()
                        // General admin endpoints (must come after specific ones)
                        .requestMatchers(new AntPathRequestMatcher("/api/admin/**")).hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions().disable())
                .formLogin(form -> form.disable());
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }
}