package in.sih.aicte.api;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.ErrorResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiExceptionHandler {
    private static final Logger LOG = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiProblem> typeMismatch(MethodArgumentTypeMismatchException exception, HttpServletRequest request) {
        return problem(ApiProblem.of(request, 400, "Invalid parameter",
                "Parameter '" + exception.getName() + "' has an invalid value.", List.of()));
    }

    @ExceptionHandler(BindException.class)
    ResponseEntity<ApiProblem> validation(BindException exception, HttpServletRequest request) {
        var errors = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new ApiProblem.FieldError(error.getField(), error.isBindingFailure()
                        ? "Must have the expected type." : error.getDefaultMessage())).toList();
        return problem(ApiProblem.of(request, 400, "Invalid request", "Check the listed fields.", errors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiProblem> malformed(HttpServletRequest request) {
        return problem(ApiProblem.of(request, 400, "Invalid request", "Request body is malformed or unsupported.", List.of()));
    }

    @ExceptionHandler(java.util.NoSuchElementException.class)
    ResponseEntity<ApiProblem> notFound(java.util.NoSuchElementException exception, HttpServletRequest request) {
        return problem(ApiProblem.of(request, 404, "Not found", exception.getMessage(), List.of()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiProblem> illegalArgument(IllegalArgumentException exception, HttpServletRequest request) {
        return problem(ApiProblem.of(request, 400, "Invalid transition", exception.getMessage(), List.of()));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiProblem> unexpected(Exception exception, HttpServletRequest request) {
        if (exception instanceof ErrorResponse error) {
            int code = error.getStatusCode().value();
            return problem(ApiProblem.of(request, code, HttpStatus.valueOf(code).getReasonPhrase(),
                    "The request is not supported.", List.of()));
        }
        LOG.error("Request failed; correlationId={}", CorrelationFilter.id(request), exception);
        return problem(ApiProblem.of(request, 500, "Internal server error", "The request could not be completed.", List.of()));
    }

    private ResponseEntity<ApiProblem> problem(ApiProblem problem) {
        return ResponseEntity.status(problem.status()).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(problem);
    }
}
