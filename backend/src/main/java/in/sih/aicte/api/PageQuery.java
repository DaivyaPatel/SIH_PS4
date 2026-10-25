package in.sih.aicte.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record PageQuery(@Min(0) @Max(1000000) Integer page, @Min(1) @Max(100) Integer size) {
    public PageQuery {
        page = page == null ? 0 : page;
        size = size == null ? 20 : size;
    }

    public long offset() {
        return (long) page * size;
    }
}
