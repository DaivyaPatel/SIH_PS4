package in.sih.aicte.proof;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class NativeSchedulingProbeTest {
    @Test
    void nativeSolverRespectsPrecedenceAndNonOverlap() {
        var result = NativeSchedulingProbe.solve(false);
        assertThat(result.status()).isEqualTo("OPTIMAL");
        assertThat(result.firstStart()).isGreaterThanOrEqualTo(0);
        assertThat(result.firstEnd() - result.firstStart()).isEqualTo(2);
        assertThat(result.secondEnd() - result.secondStart()).isEqualTo(2);
        assertThat(result.secondStart()).isGreaterThanOrEqualTo(result.firstEnd());
        assertThat(result.secondEnd()).isEqualTo(4);
    }

    @Test
    void impossibleHorizonIsInfeasibleNotAValidSchedule() {
        var result = NativeSchedulingProbe.solve(true);
        assertThat(result.status()).isEqualTo("INFEASIBLE");
        assertThat(result.firstStart()).isNull();
        assertThat(result.secondEnd()).isNull();
    }
}
