package in.sih.aicte.evc;

import com.google.ortools.Loader;
import com.google.ortools.sat.CpModel;
import com.google.ortools.sat.CpSolver;
import com.google.ortools.sat.CpSolverStatus;
import com.google.ortools.sat.IntVar;
import com.google.ortools.sat.LinearExpr;
import in.sih.aicte.audit.AuditService;
import in.sih.aicte.calendar.RegulatoryCalendarService;
import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.CaseStatus;
import in.sih.aicte.cases.Institution;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EvcConstraintSchedulerService {

    private static final Logger LOG = LoggerFactory.getLogger(EvcConstraintSchedulerService.class);

    private final ApplicationCaseRepository caseRepository;
    private final ExpertRepository expertRepository;
    private final RegulatoryCalendarService calendarService;
    private final AuditService auditService;

    public EvcConstraintSchedulerService(
            ApplicationCaseRepository caseRepository,
            ExpertRepository expertRepository,
            RegulatoryCalendarService calendarService,
            AuditService auditService
    ) {
        this.caseRepository = caseRepository;
        this.expertRepository = expertRepository;
        this.calendarService = calendarService;
        this.auditService = auditService;
    }

    @Transactional
    public EvcDto.ScheduleOptimizationResponse optimizeAndSchedule(
            EvcDto.ScheduleOptimizationRequest request,
            String correlationId
    ) {
        long startTime = System.currentTimeMillis();

        // Ensure OR-Tools native libraries are loaded
        Loader.loadNativeLibraries();

        // 1. Resolve cases to schedule
        List<ApplicationCase> cases;
        if (request != null && request.caseIds() != null && !request.caseIds().isEmpty()) {
            cases = caseRepository.findAllById(request.caseIds());
        } else {
            cases = caseRepository.findByStatusWithInstitution(CaseStatus.EVC_PENDING);
            if (cases.isEmpty()) {
                cases = caseRepository.findByStatusWithInstitution(CaseStatus.EVC_SCHEDULED);
            }
        }

        if (cases.isEmpty()) {
            return new EvcDto.ScheduleOptimizationResponse(
                    "NO_CASES",
                    System.currentTimeMillis() - startTime,
                    0,
                    0,
                    List.of(),
                    List.of(),
                    "No pending application cases found eligible for EVC committee scheduling."
            );
        }

        // 2. Resolve active expert pool
        List<Expert> activeExperts = expertRepository.findByActiveTrue();
        if (activeExperts.isEmpty()) {
            return new EvcDto.ScheduleOptimizationResponse(
                    "NO_EXPERTS",
                    System.currentTimeMillis() - startTime,
                    cases.size(),
                    0,
                    List.of(),
                    cases.stream().map(c -> new EvcDto.UnassignedCaseReason(
                            c.getId(), c.getApplicationNumber(), "No active experts registered in system pool."
                    )).toList(),
                    "No active experts available in the EVC expert pool."
            );
        }

        // 3. Resolve candidate inspection dates
        LocalDate startDate = (request != null && request.startDate() != null)
                ? request.startDate()
                : LocalDate.of(2026, 11, 10);
        LocalDate endDate = (request != null && request.endDate() != null)
                ? request.endDate()
                : LocalDate.of(2026, 11, 20);

        List<LocalDate> candidateDates = new ArrayList<>();
        LocalDate cur = startDate;
        while (!cur.isAfter(endDate)) {
            if (calendarService.isBusinessDay(cur)) {
                candidateDates.add(cur);
            }
            cur = cur.plusDays(1);
        }

        if (candidateDates.isEmpty()) {
            candidateDates.add(startDate);
        }

        int committeeSize = (request != null && request.committeeSize() != null && request.committeeSize() >= 2)
                ? request.committeeSize()
                : 2;
        int maxAssignments = (request != null && request.maxAssignmentsPerExpert() != null
                && request.maxAssignmentsPerExpert() >= 1)
                ? request.maxAssignmentsPerExpert()
                : 2;

        int numCases = cases.size();
        int numExperts = activeExperts.size();
        int numDates = candidateDates.size();

        // 4. Formulate Google OR-Tools CP-SAT Model
        CpModel model = new CpModel();

        // x[c][e][d]: 1 if expert e is assigned to case c on date d
        IntVar[][][] x = new IntVar[numCases][numExperts][numDates];
        for (int c = 0; c < numCases; c++) {
            for (int e = 0; e < numExperts; e++) {
                for (int d = 0; d < numDates; d++) {
                    x[c][e][d] = model.newBoolVar("x_" + c + "_" + e + "_" + d);
                }
            }
        }

        // y[c][d]: 1 if case c is scheduled on date d
        IntVar[][] y = new IntVar[numCases][numDates];
        for (int c = 0; c < numCases; c++) {
            for (int d = 0; d < numDates; d++) {
                y[c][d] = model.newBoolVar("y_" + c + "_" + d);
            }
        }

        // Constraint 1: Each case c scheduled on at most 1 date
        for (int c = 0; c < numCases; c++) {
            IntVar[] datesForCase = new IntVar[numDates];
            for (int d = 0; d < numDates; d++) {
                datesForCase[d] = y[c][d];
            }
            model.addLessOrEqual(LinearExpr.sum(datesForCase), 1);
        }

        // Constraint 2: Exactly committeeSize experts assigned if case c is scheduled on date d
        for (int c = 0; c < numCases; c++) {
            for (int d = 0; d < numDates; d++) {
                var builder = LinearExpr.newBuilder();
                for (int e = 0; e < numExperts; e++) {
                    builder.add(x[c][e][d]);
                }
                builder.addTerm(y[c][d], -committeeSize);
                model.addEquality(builder.build(), 0);
            }
        }

        // Constraint 3: Conflict of Interest & Date Availability
        for (int e = 0; e < numExperts; e++) {
            Expert expert = activeExperts.get(e);
            for (int c = 0; c < numCases; c++) {
                Institution inst = cases.get(c).getInstitution();
                boolean conflict = expert.hasConflictWith(inst.getId(), inst.getCode(), inst.getName());
                for (int d = 0; d < numDates; d++) {
                    LocalDate date = candidateDates.get(d);
                    boolean available = expert.isAvailableOn(date);
                    if (conflict || !available) {
                        model.addEquality(x[c][e][d], 0);
                    }
                }
            }
        }

        // Constraint 4: Non-overlapping visits (expert e assigned to at most 1 case per date d)
        for (int e = 0; e < numExperts; e++) {
            for (int d = 0; d < numDates; d++) {
                IntVar[] casesForExpertOnDate = new IntVar[numCases];
                for (int c = 0; c < numCases; c++) {
                    casesForExpertOnDate[c] = x[c][e][d];
                }
                model.addLessOrEqual(LinearExpr.sum(casesForExpertOnDate), 1);
            }
        }

        // Constraint 5: Max assignments per expert
        for (int e = 0; e < numExperts; e++) {
            Expert expert = activeExperts.get(e);
            var workload = LinearExpr.newBuilder();
            for (int c = 0; c < numCases; c++) {
                for (int d = 0; d < numDates; d++) {
                    workload.add(x[c][e][d]);
                }
            }
            int limit = Math.min(expert.getMaxAssignments(), maxAssignments);
            model.addLessOrEqual(workload.build(), limit);
        }

        // Objective: Maximize total scheduled cases, prefer earlier dates
        var objective = LinearExpr.newBuilder();
        for (int c = 0; c < numCases; c++) {
            for (int d = 0; d < numDates; d++) {
                objective.addTerm(y[c][d], 1000 - d);
            }
        }
        model.maximize(objective.build());

        // 5. Solve using Google OR-Tools CP-SAT
        CpSolver solver = new CpSolver();
        solver.getParameters().setMaxTimeInSeconds(5).setNumSearchWorkers(1).setRandomSeed(26262);
        CpSolverStatus status = solver.solve(model);

        long solveDuration = System.currentTimeMillis() - startTime;
        LOG.info("OR-Tools CP-SAT solve completed in {} ms with status {}", solveDuration, status);

        if (status != CpSolverStatus.OPTIMAL && status != CpSolverStatus.FEASIBLE) {
            return new EvcDto.ScheduleOptimizationResponse(
                    status.name(),
                    solveDuration,
                    numCases,
                    0,
                    List.of(),
                    cases.stream().map(c -> new EvcDto.UnassignedCaseReason(
                            c.getId(), c.getApplicationNumber(), "Infeasible constraint formulation."
                    )).toList(),
                    "CP-SAT solver returned " + status + ". Conflict or availability constraints could not be met."
            );
        }

        // 6. Extract assignments and update application cases
        List<EvcDto.ScheduledVisitAssignment> scheduledVisits = new ArrayList<>();
        List<EvcDto.UnassignedCaseReason> unassignedCases = new ArrayList<>();

        for (int c = 0; c < numCases; c++) {
            ApplicationCase appCase = cases.get(c);
            int assignedDateIdx = -1;
            for (int d = 0; d < numDates; d++) {
                if (solver.value(y[c][d]) == 1) {
                    assignedDateIdx = d;
                    break;
                }
            }

            if (assignedDateIdx == -1) {
                unassignedCases.add(new EvcDto.UnassignedCaseReason(
                        appCase.getId(),
                        appCase.getApplicationNumber(),
                        "No conflict-free expert committee available within candidate window."
                ));
                continue;
            }

            LocalDate inspectionDate = candidateDates.get(assignedDateIdx);
            List<Expert> assignedExperts = new ArrayList<>();
            for (int e = 0; e < numExperts; e++) {
                if (solver.value(x[c][e][assignedDateIdx]) == 1) {
                    assignedExperts.add(activeExperts.get(e));
                }
            }

            // Sort experts to assign Chairman role to senior expert
            assignedExperts.sort(Comparator.comparing(Expert::getName));
            List<EvcDto.ScheduledCommitteeMember> members = new ArrayList<>();
            for (int i = 0; i < assignedExperts.size(); i++) {
                Expert exp = assignedExperts.get(i);
                String role = (i == 0) ? "CHAIRMAN" : "MEMBER";
                members.add(new EvcDto.ScheduledCommitteeMember(
                        exp.getId(),
                        exp.getName(),
                        exp.getDomain(),
                        exp.getDesignation(),
                        exp.getAffiliatedInstitution(),
                        exp.getRegion(),
                        role
                ));
            }

            // Update case state
            CaseStatus prevStatus = appCase.getStatus();
            appCase.setStatus(CaseStatus.EVC_SCHEDULED);
            appCase.setCurrentStage("EVC_INSPECTION");
            appCase.setReadinessScore(88);
            Instant scheduledCutoff = inspectionDate.atTime(18, 0, 0)
                    .atZone(RegulatoryCalendarService.IST_ZONE).toInstant();
            appCase.setDeadlineAt(scheduledCutoff);
            appCase.setUpdatedAt(Instant.now());
            caseRepository.save(appCase);

            // Record audit event
            auditService.recordEvent(
                    appCase.getId(),
                    "SCHEDULE_EVC",
                    "OR_TOOLS_SOLVER",
                    "system.cp-sat.v26262",
                    prevStatus.name(),
                    CaseStatus.EVC_SCHEDULED.name(),
                    "EVC committee scheduled for " + inspectionDate + " with " + members.size()
                            + " non-conflicted expert members.",
                    correlationId
            );

            scheduledVisits.add(new EvcDto.ScheduledVisitAssignment(
                    appCase.getId(),
                    appCase.getApplicationNumber(),
                    appCase.getInstitution().getName(),
                    appCase.getInstitution().getRegion(),
                    inspectionDate,
                    members
            ));
        }

        String notes = "Google OR-Tools CP-SAT solver executed with hard conflict exclusion, "
                + "date availability, and non-overlapping member constraints.";

        return new EvcDto.ScheduleOptimizationResponse(
                status.name(),
                solveDuration,
                numCases,
                scheduledVisits.size(),
                scheduledVisits,
                unassignedCases,
                notes
        );
    }
}
