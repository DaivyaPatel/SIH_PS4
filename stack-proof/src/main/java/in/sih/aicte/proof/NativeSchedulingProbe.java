package in.sih.aicte.proof;

import com.google.ortools.Loader;
import com.google.ortools.sat.CpModel;
import com.google.ortools.sat.CpSolver;
import com.google.ortools.sat.CpSolverStatus;

/** Bounded native-library smoke test, not a regulatory EVC scheduler. */
public final class NativeSchedulingProbe {
    private NativeSchedulingProbe() { }

    public static ProbeResult solve(boolean impossible) {
        Loader.loadNativeLibraries();
        var model = new CpModel();
        var firstStart = model.newIntVar(0, 4, "firstStart");
        var firstEnd = model.newIntVar(2, 6, "firstEnd");
        var secondStart = model.newIntVar(0, 4, "secondStart");
        var secondEnd = model.newIntVar(2, 6, "secondEnd");
        var first = model.newIntervalVar(firstStart, model.newConstant(2), firstEnd, "first");
        var second = model.newIntervalVar(secondStart, model.newConstant(2), secondEnd, "second");
        model.addNoOverlap(new com.google.ortools.sat.IntervalVar[] {first, second});
        model.addGreaterOrEqual(secondStart, firstEnd);
        if (impossible) {
            model.addLessOrEqual(secondEnd, 3);
        }
        model.minimize(secondEnd);
        var solver = new CpSolver();
        solver.getParameters().setMaxTimeInSeconds(5).setNumSearchWorkers(1).setRandomSeed(26262);
        var status = solver.solve(model);
        boolean solved = status == CpSolverStatus.OPTIMAL || status == CpSolverStatus.FEASIBLE;
        return new ProbeResult(status.name(), solved ? solver.value(firstStart) : null,
                solved ? solver.value(firstEnd) : null, solved ? solver.value(secondStart) : null,
                solved ? solver.value(secondEnd) : null);
    }

    public record ProbeResult(String status, Long firstStart, Long firstEnd, Long secondStart, Long secondEnd) { }
}
