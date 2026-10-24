"""Create disposable local credentials without printing or overwriting secrets."""
import json
import os
from pathlib import Path
import secrets

ROOT = Path(__file__).resolve().parents[1]


def initialize():
    env = ROOT / ".env"
    store = ROOT / ".local" / "dev" / "s3.json"
    if env.exists() or store.exists():
        raise SystemExit("Local configuration already exists; refusing to overwrite it.")
    store.parent.mkdir(parents=True, exist_ok=True)
    values = {name: secrets.token_hex(24) for name in (
        "POSTGRES_PASSWORD", "S3_ACCESS_KEY", "S3_SECRET_KEY", "KEYCLOAK_ADMIN_PASSWORD")}
    with env.open("x", encoding="utf-8", newline="\n") as output:
        output.write("# Generated local-only development credentials\n")
        output.writelines(f"{key}={value}\n" for key, value in values.items())
    config = {"identities": [{"name": "local-development", "credentials": [{
        "accessKey": values["S3_ACCESS_KEY"], "secretKey": values["S3_SECRET_KEY"]}],
        "actions": ["Admin", "Read", "Write", "List", "Tagging"]}]}
    with store.open("x", encoding="utf-8", newline="\n") as output:
        json.dump(config, output, indent=2)
        output.write("\n")
    if os.name != "nt":
        env.chmod(0o600)
        store.chmod(0o600)
    print("Created ignored local configuration. No credentials were printed.")


if __name__ == "__main__":
    initialize()
