package in.sih.aicte.api;

import java.time.Instant;
import java.util.UUID;

/** Contract for a future durably accepted command; construction alone is not persistence. */
public record CommandReceipt(UUID receiptId, UUID correlationId, Outcome outcome, Instant recordedAt) {
    public enum Outcome { ACCEPTED }
}
