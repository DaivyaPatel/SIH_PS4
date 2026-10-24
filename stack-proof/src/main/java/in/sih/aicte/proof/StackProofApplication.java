package in.sih.aicte.proof;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Standalone non-web compatibility proof; no approval endpoints are exposed. */
@SpringBootApplication
public class StackProofApplication {
    public static void main(String[] args) {
        if (java.util.Arrays.asList(args).contains("--probe-native")) {
            var feasible = NativeSchedulingProbe.solve(false);
            var infeasible = NativeSchedulingProbe.solve(true);
            if (!feasible.status().equals("OPTIMAL") || !infeasible.status().equals("INFEASIBLE")) {
                throw new IllegalStateException("Native solver proof failed");
            }
            System.out.println("Native solver proof: " + feasible + "; impossible=" + infeasible.status());
            return;
        }
        SpringApplication.run(StackProofApplication.class, args);
    }
}
