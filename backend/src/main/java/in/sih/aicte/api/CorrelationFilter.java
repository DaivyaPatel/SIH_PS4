package in.sih.aicte.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationFilter extends OncePerRequestFilter {
    public static final String HEADER = "X-Correlation-ID";
    private static final Pattern UUID_PATTERN = Pattern.compile(
            "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String incoming = request.getHeader(HEADER);
        String correlationId = incoming != null && UUID_PATTERN.matcher(incoming).matches()
                ? incoming.toLowerCase(java.util.Locale.ROOT) : UUID.randomUUID().toString();
        request.setAttribute(HEADER, correlationId);
        response.setHeader(HEADER, correlationId);
        try (var ignored = MDC.putCloseable("correlationId", correlationId)) {
            chain.doFilter(request, response);
        }
    }

    public static String id(HttpServletRequest request) {
        return (String) request.getAttribute(HEADER);
    }
}
