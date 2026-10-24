"""Check the synthetic executable specification, not a production workflow engine.

The future backend must run the same fixtures through its own guarded commands.
No source writes, timers, messages or statutory decisions run in this checker.
"""

from collections import deque
from datetime import date, datetime, time, timedelta, timezone
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / "config/policies/synthetic"
MARKER = "SYNTHETIC_NOT_REGULATORY"


def load(name):
    return json.loads((BUNDLE / name).read_text(encoding="utf-8"))


def check(condition, message):
    if not condition:
        raise ValueError(message)


def check_metadata(document):
    check(document["sourceMarker"] == MARKER, "Missing synthetic marker")
    for flag in ("ownerApproved", "productionActivationAllowed", "runtimeActivationAllowed"):
        check(document[flag] is False, f"Unsafe activation/approval flag: {flag}")


def check_route_structure(document):
    check_metadata(document)
    check(len(document["routes"]) == 3, "Expected three bounded demo routes")
    route_ids = [route["id"] for route in document["routes"]]
    check(len(route_ids) == len(set(route_ids)), "Duplicate route IDs")
    categories = [route["category"] for route in document["routes"]]
    check(len(categories) == len(set(categories)), "Overlapping synthetic category bindings")
    for route in document["routes"]:
        check(route["sourceMarker"] == MARKER and route["category"].startswith("DEMO-"), "Real/unlabelled binding")
        edges = route["transitions"]
        keys = [(edge["fromStage"], edge["event"]) for edge in edges]
        check(len(keys) == len(set(keys)), f"Ambiguous transition in {route['id']}")
        check(route["closeProcessingKeepsObligations"] is True, "Processing closure must preserve obligations")
        for edge in edges:
            check(edge["sourceMarker"] == MARKER, "Unlabelled edge")
            check(edge["actorRole"] in document["actorRoles"], "Unknown actor role")
            check(edge["nextRole"] is None or edge["nextRole"] in document["actorRoles"], "Unknown next role")
            if edge["event"] in {"RAISE_DEFICIENCY", "AUTHORISED_RETURN", "REQUEST_HEARING", "REQUEST_APPEAL"}:
                check(edge["reasonRequired"] is True, "Consequential branch missing a reason guard")
            if edge["toStage"] == "DECISION_RECORDED":
                check(edge["event"] == "RECORD_SOURCE_DECISION", "Task completion cannot create a decision")
                check({"sourceDecisionConfirmed", "decisionAuthorityConfirmed"} <= set(edge["requiredTrue"]), "Missing decision confirmation guards")
        seen = {route["initialStage"]}
        queue = deque(seen)
        while queue:
            stage = queue.popleft()
            for edge in edges:
                if edge["fromStage"] == stage and edge["toStage"] not in seen:
                    seen.add(edge["toStage"])
                    queue.append(edge["toStage"])
        check({edge["fromStage"] for edge in edges} <= seen, "Unreachable source stage")
        check("PROCESSING_CLOSED" in seen, "No bounded closure path")


def evaluate_route(document, case):
    base = {"regulatoryApprovalInferred": False}

    def blocked(code):
        return dict(base, result="BLOCKED", code=code)

    route = next((route for route in document["routes"] if route["id"] == case["routeId"]), None)
    if route is None or case["academicYear"] != document["academicYear"]:
        return blocked("POLICY_CLARIFICATION")
    if case["stage"] == "ROUTE_PENDING" and case["event"] == "RESOLVE_ROUTE":
        if case.get("category") != route["category"]:
            return blocked("POLICY_CLARIFICATION")
        return dict(base, result="TRANSITION", nextStage=route["initialStage"], nextRole=route["initialRole"])
    edge = next((edge for edge in route["transitions"] if edge["fromStage"] == case["stage"] and edge["event"] == case["event"]), None)
    if edge is None:
        return blocked("TRANSITION_NOT_ALLOWED")
    if edge["actorRole"] != case["actorRole"]:
        return blocked("UNAUTHORISED_ROLE")
    if edge["reasonRequired"] and not case.get("reason", "").strip():
        return blocked("REASON_REQUIRED")
    if not all(case["facts"].get(key) is True for key in edge["requiredTrue"]):
        return blocked("PREREQUISITE_MISSING")
    return dict(base, result="TRANSITION", nextStage=edge["toStage"], nextRole=edge["nextRole"])


def local_zone(calendar):
    return timezone(timedelta(minutes=calendar["utcOffsetMinutes"]))


def overdue_at(due, calendar):
    # The synthetic inclusive date becomes overdue at next local midnight.
    return datetime.combine(date.fromisoformat(due) + timedelta(days=1), time.min, local_zone(calendar))


def working_due(anchor, offset, calendar):
    check(type(offset) is int and offset >= 0, "Working-day offset must be a non-negative integer")
    day = date.fromisoformat(anchor)
    while offset:
        day += timedelta(days=1)
        if day.weekday() in calendar["workingWeekdays"] and day.isoformat() not in calendar["holidays"]:
            offset -= 1
    return day.isoformat()


def submission_state(case, calendar):
    if case["submittedAt"]:
        timely = datetime.fromisoformat(case["submittedAt"]) < overdue_at(case["dueDate"], calendar)
        return "SUBMITTED_ON_TIME_AWAITING_REVIEW" if timely else "SUBMITTED_LATE_AWAITING_REVIEW"
    return "NO_SUBMISSION_OVERDUE" if datetime.fromisoformat(case["now"]) >= overdue_at(case["dueDate"], calendar) else "OPEN_NOT_OVERDUE"


def validity_state(case):
    expiry = case.get("renewalExpiry") if case.get("renewalAccepted") is True else case["acceptedExpiry"]
    if expiry is None:
        return "NO_EXPIRY_REQUIRED" if case.get("noExpiryRequired") is True and case["requiredHorizon"] is None else "UNKNOWN_REQUIRES_REVIEW"
    try:
        expiry_date = date.fromisoformat(expiry)
    except ValueError:
        return "UNKNOWN_REQUIRES_REVIEW"
    if expiry_date < date.fromisoformat(case["asOfDate"]):
        return "EXPIRED_RENEWAL_PENDING_REVIEW" if case.get("renewalExpiry") and not case.get("renewalAccepted") else "EXPIRED"
    if case["requiredHorizon"]:
        return "VALID_FOR_DEMO_HORIZON" if expiry_date >= date.fromisoformat(case["requiredHorizon"]) else "INSUFFICIENT_REMAINING_VALIDITY"
    return "CURRENTLY_VALID"


def notification_state(case, policy):
    action = case["pendingAction"] if case["sourceFresh"] else "sourceStale"
    return dict(recipient=policy["pendingActionRecipients"][action], missingSubmissionNotice=action == "noSubmission" and not case["submissionObserved"])


def main():
    routes, route_cases = load("routes.json"), load("routing-cases.json")
    policy, cases = load("compliance-policy.json"), load("compliance-cases.json")
    for document in (routes, route_cases, policy, cases):
        check_metadata(document)
        check(document["policyVersion"] == routes["policyVersion"] and document["academicYear"] == routes["academicYear"], "Mixed policy version/year across fixture bundle")
    check_route_structure(routes)
    calendar = policy["calendar"]
    check(calendar["timeZone"] == "Asia/Kolkata" and calendar["utcOffsetMinutes"] == 330, "Checker supports the declared IST demo calendar only")
    check(calendar["excludeAnchorDate"] and calendar["dateOnlyDueInclusive"], "Unexpected demo boundary convention")
    check(policy["notificationRule"]["testSinkOnly"] is True, "No real recipients in synthetic fixture bundle")
    for key in ("calendar", "obligationRule", "documentRule", "notificationRule", "extensionExample"):
        check(policy[key]["sourceMarker"] == MARKER, f"Unlabelled rule/example: {key}")
    obligations = policy["obligationExamples"]
    check(len({item["id"] for item in obligations}) == len(obligations) == 2, "Two separate demo conditions required")
    check(all(item["sourceMarker"] == MARKER and item["sourcePassage"] and item["requiredEvidence"] for item in obligations), "Obligation needs labelled source passage and evidence")
    check(policy["obligationRule"]["uploadImpliesAcceptance"] is False and policy["documentRule"]["renewalUploadImpliesAcceptance"] is False, "Submission must not imply verified compliance")
    extension = policy["extensionExample"]
    check(extension["originalDueDate"] != extension["currentDueDate"] and extension["reason"] and extension["authorityReference"] and extension["preserveOriginalDue"], "Extension must preserve original due and authority")
    all_cases = route_cases["cases"] + [case for key in ("clockCases", "deadlineCases", "submissionCases", "validityCases", "notificationCases") for case in cases[key]]
    ids = [case["id"] for case in all_cases]
    check(len(ids) == len(set(ids)), "Duplicate fixture IDs")
    check(all(case["sourceMarker"] == MARKER for case in all_cases), "Unlabelled fixture")
    for case in route_cases["cases"]:
        check(evaluate_route(routes, case) == case["expected"], f"Routing mismatch: {case['id']}")
    for case in cases["clockCases"]:
        check(working_due(case["anchor"], case["offsetWorkingDays"], calendar) == case["expectedDueDate"], f"Calendar mismatch: {case['id']}")
    for case in cases["deadlineCases"]:
        result = None if case["dueDate"] is None else datetime.fromisoformat(case["now"]) >= overdue_at(case["dueDate"], calendar)
        check(result is case["expectedOverdue"], f"Boundary mismatch: {case['id']}")
    for case in cases["submissionCases"]:
        check(submission_state(case, calendar) == case["expected"], f"Submission mismatch: {case['id']}")
    for case in cases["validityCases"]:
        check(validity_state(case) == case["expected"], f"Validity mismatch: {case['id']}")
    for case in cases["notificationCases"]:
        check(notification_state(case, policy["notificationRule"]) == dict(recipient=case["expectedRecipient"], missingSubmissionNotice=case["expectedMissingSubmissionNotice"]), f"Recipient mismatch: {case['id']}")
    print(f"PASS: three demo routes; {len(route_cases['cases'])} routing and {len(all_cases)-len(route_cases['cases'])} compliance fixtures")
    print("All synthetic markers/activation guards pass. This is specification validation, not backend/timer/integration verification.")


if __name__ == "__main__":
    main()
