package in.sih.aicte.notification;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByCaseIdOrderByCreatedAtDesc(UUID caseId);

    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(NotificationRecipientRole recipientRole);

    List<Notification> findByNotificationTypeOrderByCreatedAtDesc(NotificationType notificationType);

    List<Notification> findByIsReadOrderByCreatedAtDesc(boolean isRead);

    @Query("SELECT n FROM Notification n WHERE "
            + "(:caseId IS NULL OR n.caseId = :caseId) AND "
            + "(:role IS NULL OR n.recipientRole = :role) AND "
            + "(:type IS NULL OR n.notificationType = :type) AND "
            + "(:isRead IS NULL OR n.isRead = :isRead) "
            + "ORDER BY n.createdAt DESC")
    List<Notification> search(
            @Param("caseId") UUID caseId,
            @Param("role") NotificationRecipientRole role,
            @Param("type") NotificationType type,
            @Param("isRead") Boolean isRead
    );

    boolean existsByCaseIdAndNotificationType(UUID caseId, NotificationType notificationType);

    long countByIsReadFalse();

    long countByNotificationType(NotificationType notificationType);
}
