package in.sih.aicte.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    private UUID id;

    @Column(name = "case_id")
    private UUID caseId;

    @Column(name = "institution_id")
    private UUID institutionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_role", nullable = false, length = 60)
    private NotificationRecipientRole recipientRole;

    @Column(name = "recipient_contact", nullable = false, length = 150)
    private String recipientContact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 60)
    private NotificationType notificationType;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private NotificationStatus status = NotificationStatus.SENT;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Notification() {
    }

    public Notification(
            UUID id,
            UUID caseId,
            UUID institutionId,
            NotificationRecipientRole recipientRole,
            String recipientContact,
            NotificationChannel channel,
            NotificationType notificationType,
            String title,
            String content,
            NotificationPriority priority,
            NotificationStatus status,
            boolean isRead,
            Instant readAt,
            String metadataJson,
            Instant createdAt
    ) {
        this.id = id;
        this.caseId = caseId;
        this.institutionId = institutionId;
        this.recipientRole = recipientRole;
        this.recipientContact = recipientContact;
        this.channel = channel;
        this.notificationType = notificationType;
        this.title = title;
        this.content = content;
        this.priority = priority;
        this.status = status;
        this.isRead = isRead;
        this.readAt = readAt;
        this.metadataJson = metadataJson;
        this.createdAt = (createdAt != null) ? createdAt : Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCaseId() {
        return caseId;
    }

    public void setCaseId(UUID caseId) {
        this.caseId = caseId;
    }

    public UUID getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(UUID institutionId) {
        this.institutionId = institutionId;
    }

    public NotificationRecipientRole getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(NotificationRecipientRole recipientRole) {
        this.recipientRole = recipientRole;
    }

    public String getRecipientContact() {
        return recipientContact;
    }

    public void setRecipientContact(String recipientContact) {
        this.recipientContact = recipientContact;
    }

    public NotificationChannel getChannel() {
        return channel;
    }

    public void setChannel(NotificationChannel channel) {
        this.channel = channel;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public NotificationPriority getPriority() {
        return priority;
    }

    public void setPriority(NotificationPriority priority) {
        this.priority = priority;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public void setMetadataJson(String metadataJson) {
        this.metadataJson = metadataJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
