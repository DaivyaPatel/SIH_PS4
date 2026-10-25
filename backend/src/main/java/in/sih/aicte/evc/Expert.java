package in.sih.aicte.evc;

import in.sih.aicte.cases.Region;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "experts")
public class Expert {

    @Id
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 150)
    private String designation;

    @Column(nullable = false, length = 80)
    private String domain;

    @Column(name = "affiliated_institution", nullable = false, length = 200)
    private String affiliatedInstitution;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Region region;

    @Column(name = "conflict_institutions", columnDefinition = "TEXT")
    private String conflictInstitutions;

    @Column(name = "available_dates", nullable = false, columnDefinition = "TEXT")
    private String availableDates;

    @Column(name = "max_assignments", nullable = false)
    private int maxAssignments = 3;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Expert() {
    }

    public boolean isAvailableOn(LocalDate date) {
        if (date == null || availableDates == null || availableDates.isBlank()) {
            return false;
        }
        String dateStr = date.toString();
        return Arrays.stream(availableDates.split(","))
                .map(String::trim)
                .anyMatch(d -> d.equals(dateStr));
    }

    public List<String> getAvailableDateList() {
        if (availableDates == null || availableDates.isBlank()) {
            return List.of();
        }
        return Arrays.stream(availableDates.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public boolean hasConflictWith(UUID institutionId, String institutionCode, String institutionName) {
        if (affiliatedInstitution != null && institutionName != null
                && affiliatedInstitution.trim().equalsIgnoreCase(institutionName.trim())) {
            return true;
        }
        if (conflictInstitutions != null && !conflictInstitutions.isBlank()) {
            if (institutionId != null && conflictInstitutions.contains(institutionId.toString())) {
                return true;
            }
            if (institutionCode != null && conflictInstitutions.contains(institutionCode)) {
                return true;
            }
            if (institutionName != null
                    && conflictInstitutions.toLowerCase().contains(institutionName.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getAffiliatedInstitution() {
        return affiliatedInstitution;
    }

    public void setAffiliatedInstitution(String affiliatedInstitution) {
        this.affiliatedInstitution = affiliatedInstitution;
    }

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public String getConflictInstitutions() {
        return conflictInstitutions;
    }

    public void setConflictInstitutions(String conflictInstitutions) {
        this.conflictInstitutions = conflictInstitutions;
    }

    public String getAvailableDates() {
        return availableDates;
    }

    public void setAvailableDates(String availableDates) {
        this.availableDates = availableDates;
    }

    public int getMaxAssignments() {
        return maxAssignments;
    }

    public void setMaxAssignments(int maxAssignments) {
        this.maxAssignments = maxAssignments;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
