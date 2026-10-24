"""Offline provenance checks; optionally verify ignored local source PDF bytes."""

import argparse
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache-dir", type=Path)
    args = parser.parse_args()
    register = json.loads((ROOT / "config/regulatory/source-register.json").read_text(encoding="utf-8"))
    errors = []
    ids = [source["id"] for source in register["sources"]]
    if len(ids) != len(set(ids)):
        errors.append("Duplicate source IDs")
    if register["productionActivationAllowed"] or register["completeCurrentCorpus"]:
        errors.append("Research register must not claim production approval or a complete current corpus")
    checked_files = set()
    for source in register["sources"]:
        if source["productionActivationAllowed"]:
            errors.append(f"{source['id']}: source is not owner-approved")
        digest = source["sha256"]
        if source["retrievalStatus"] == "downloaded-pdf":
            if not isinstance(digest, str) or len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
                errors.append(f"{source['id']}: invalid SHA-256")
            if not source["clauseReferences"] or not source["pdfPages"]:
                errors.append(f"{source['id']}: missing page/clause anchors")
            if args.cache_dir:
                cached = args.cache_dir / source["cacheFile"]
                if not cached.is_file():
                    errors.append(f"Missing cache file: {cached.name}")
                else:
                    data = cached.read_bytes()
                    if not data.startswith(b"%PDF-") or len(data) != source["byteLength"] or hashlib.sha256(data).hexdigest() != digest:
                        errors.append(f"Source byte mismatch: {source['id']}")
                    checked_files.add(source["cacheFile"])
        elif digest is not None or not source.get("checksumUnavailableReason"):
            errors.append(f"{source['id']}: unavailable bytes need null hash and reason")
    for item in register["contextInputs"]:
        path = ROOT / item["path"]
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != item["sha256"]:
            errors.append(f"Supplied research context changed: {item['path']}")
    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        raise SystemExit(1)
    print(f"PASS: {len(ids)} source entries, {len(register['contextInputs'])} context hashes, activation blocked")
    print(f"Source PDF bytes checked: {len(checked_files)}" if args.cache_dir else "Source PDF bytes not checked; pass --cache-dir to verify downloads")


if __name__ == "__main__":
    main()
