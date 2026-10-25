package in.sih.aicte.api;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public record ApiProblem(String type, String title, int status, String detail, String instance,
                         String correlationId, List<FieldError> errors) {
    public record FieldError(String field, String message) {}

    public static ApiProblem of(HttpServletRequest request, int status, String title, String detail,
                                List<FieldError> errors) {
        return new ApiProblem("about:blank", title, status, detail, request.getRequestURI(),
                CorrelationFilter.id(request), errors);
    }
}
