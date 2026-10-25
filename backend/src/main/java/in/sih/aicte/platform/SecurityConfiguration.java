package in.sih.aicte.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.sih.aicte.api.ApiProblem;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
class SecurityConfiguration {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectMapper mapper) throws Exception {
        return http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.GET, "/api/v1/platform", "/api/v1/platform/modules",
                        "/actuator/health", "/actuator/health/**").permitAll()
                .requestMatchers("/api/v1/cases", "/api/v1/cases/**").permitAll()
                .requestMatchers("/api/v1/integration", "/api/v1/integration/**").permitAll()
                .anyRequest().denyAll())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(errors -> errors.authenticationEntryPoint((request, response, exception) -> {
                response.setStatus(403);
                response.setContentType("application/problem+json");
                mapper.writeValue(response.getOutputStream(), ApiProblem.of(request, 403, "Forbidden",
                        "This operation is not available.", List.of()));
            }).accessDeniedHandler((request, response, exception) -> {
                response.setStatus(403);
                response.setContentType("application/problem+json");
                mapper.writeValue(response.getOutputStream(), ApiProblem.of(request, 403, "Forbidden",
                        "This operation is not available.", List.of()));
            }))
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .build();
    }

    @Bean
    UserDetailsService noLocalUsers() {
        return username -> { throw new UsernameNotFoundException("Local login is disabled"); };
    }
}
