package in.sih.aicte.timeline;

import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/cases/{id}/timeline", produces = MediaType.APPLICATION_JSON_VALUE)
public class CaseTimelineController {

    private final CaseTimelineService timelineService;

    public CaseTimelineController(CaseTimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping
    public TimelineDto.CaseTimelineResponse getTimeline(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "asc") String sort
    ) {
        return timelineService.getCaseTimeline(id, sort);
    }
}
