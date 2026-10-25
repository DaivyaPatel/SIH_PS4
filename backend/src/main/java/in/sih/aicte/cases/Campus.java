package in.sih.aicte.cases;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "campuses")
public class Campus {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "campus_name", nullable = false, length = 255)
    private String campusName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "land_area_acres", nullable = false, precision = 6, scale = 2)
    private BigDecimal landAreaAcres;

    @Column(name = "built_up_area_sqm", nullable = false, precision = 10, scale = 2)
    private BigDecimal builtUpAreaSqM;

    @Column(name = "land_lease_status", nullable = false, length = 50)
    private String landLeaseStatus;

    @Column(name = "lease_expiry_date")
    private LocalDate leaseExpiryDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Campus() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(Institution institution) {
        this.institution = institution;
    }

    public String getCampusName() {
        return campusName;
    }

    public void setCampusName(String campusName) {
        this.campusName = campusName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getLandAreaAcres() {
        return landAreaAcres;
    }

    public void setLandAreaAcres(BigDecimal landAreaAcres) {
        this.landAreaAcres = landAreaAcres;
    }

    public BigDecimal getBuiltUpAreaSqM() {
        return builtUpAreaSqM;
    }

    public void setBuiltUpAreaSqM(BigDecimal builtUpAreaSqM) {
        this.builtUpAreaSqM = builtUpAreaSqM;
    }

    public String getLandLeaseStatus() {
        return landLeaseStatus;
    }

    public void setLandLeaseStatus(String landLeaseStatus) {
        this.landLeaseStatus = landLeaseStatus;
    }

    public LocalDate getLeaseExpiryDate() {
        return leaseExpiryDate;
    }

    public void setLeaseExpiryDate(LocalDate leaseExpiryDate) {
        this.leaseExpiryDate = leaseExpiryDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
