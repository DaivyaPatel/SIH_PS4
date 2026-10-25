package in.sih.aicte.timeline;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class TimelineDto {

    private TimelineDto() {
    }

    public record TimelineMilestone(
            String id,
            String name,
            String status,
            String description,
            Instant completedAt
    ) {
    }

    public record TimelineEvent(
            UUID eventId,
            String eventType,
            String category,
            String title,
            String summary,
            String actorRole,
            String actorName,
            String previousState,
            String newState,
            String badgeColor,
            String icon,
            String correlationId,
            Instant timestamp,
            String formattedIstTime,
            String timeAgo
    ) {
    }

    public record CaseTimelineResponse(
            UUID caseId,
            String applicationNumber,
            String institutionName,
            String currentStatus,
            String currentStage,
            int totalEvents,
            List<TimelineMilestone> milestones,
            List<TimelineEvent> events,
            Instant generatedAt
    ) {
    }
}
