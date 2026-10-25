package in.sih.aicte.cases;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "application_cases")
public class ApplicationCase {

    @Id
    private UUID id;

    @Column(name = "application_number", nullable = false, unique = true, length = 80)
    private String applicationNumber;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @Column(name = "application_type", nullable = false, length = 80)
    private String applicationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CaseStatus status;

    @Column(name = "current_stage", nullable = false, length = 80)
    private String currentStage;

    @Column(name = "readiness_score", nullable = false)
    private int readinessScore;

    @Column(name = "assigned_officer", length = 100)
    private String assignedOfficer;

    @Column(name = "deadline_at")
    private Instant deadlineAt;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "applicationCase", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Deficiency> deficiencies = new ArrayList<>();

    @OneToMany(mappedBy = "applicationCase", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DocumentMetadata> documents = new ArrayList<>();

    public ApplicationCase() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getApplicationNumber() {
        return applicationNumber;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(Institution institution) {
        this.institution = institution;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getApplicationType() {
        return applicationType;
    }

    public void setApplicationType(String applicationType) {
        this.applicationType = applicationType;
    }

    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }

    public String getCurrentStage() {
        return currentStage;
    }

    public void setCurrentStage(String currentStage) {
        this.currentStage = currentStage;
    }

    public int getReadinessScore() {
        return readinessScore;
    }

    public void setReadinessScore(int readinessScore) {
        this.readinessScore = readinessScore;
    }

    public String getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(String assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    public Instant getDeadlineAt() {
        return deadlineAt;
    }

    public void setDeadlineAt(Instant deadlineAt) {
        this.deadlineAt = deadlineAt;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<Deficiency> getDeficiencies() {
        return deficiencies;
    }

    public void setDeficiencies(List<Deficiency> deficiencies) {
        this.deficiencies = deficiencies;
    }

    public List<DocumentMetadata> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentMetadata> documents) {
        this.documents = documents;
    }
}
