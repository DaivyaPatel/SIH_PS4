package in.sih.aicte.api;

import java.util.List;

public record ApiPage<T>(List<T> items, int page, int size, long totalElements, long totalPages) {
    public static <T> ApiPage<T> from(List<T> values, PageQuery query) {
        var items = values.stream().skip(query.offset()).limit(query.size()).toList();
        return new ApiPage<>(items, query.page(), query.size(), values.size(),
                (values.size() + (long) query.size() - 1) / query.size());
    }
}
