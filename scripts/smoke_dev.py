"""Exercise the actual Compose stack; requires boto3 (CI installs a pinned version)."""
from email.message import EmailMessage
import json
from pathlib import Path
import smtplib
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import uuid

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError, EndpointConnectionError

ROOT = Path(__file__).resolve().parents[1]


def http(path, headers=None):
    with urlopen(Request(path, headers=headers or {}), timeout=5) as response:
        return response.status, response.headers, response.read()


def eventually(check, label, timeout=180):
    end = time.monotonic() + timeout
    last = None
    while time.monotonic() < end:
        try:
            result = check()
            print(f"PASS: {label}", flush=True)
            return result
        except (OSError, URLError, AssertionError, ClientError, EndpointConnectionError) as error:
            last = type(error).__name__
            time.sleep(2)
    raise RuntimeError(f"Timed out waiting for {label} ({last})")


def main():
    credentials = dict(line.split("=", 1) for line in (ROOT / ".env").read_text().splitlines()
                       if line and not line.startswith("#"))
    base = "http://127.0.0.1:8080"
    eventually(lambda: http(base + "/actuator/health/readiness"), "database-backed API readiness")
    correlation = str(uuid.uuid4())
    status, headers, body = http(base + "/api/v1/platform", {"X-Correlation-ID": correlation})
    assert status == 200 and headers["X-Correlation-ID"] == correlation
    platform = json.loads(body)
    assert platform["synthetic"] and not any(platform[key] for key in (
        "identityIntegrated", "hostConnected", "notificationsEnabled"))
    for path, expected in [("/api/v1/platform/modules?size=101", 400), ("/api/v1/applications", 403)]:
        try:
            http(base + path, {"X-Correlation-ID": correlation})
            raise AssertionError("A disallowed request succeeded")
        except HTTPError as error:
            assert error.code == expected
            assert json.load(error)["correlationId"] == correlation
    print("PASS: correlated API responses, validation and command denial", flush=True)

    s3 = boto3.client("s3", endpoint_url="http://127.0.0.1:8333", region_name="us-east-1",
                      aws_access_key_id=credentials["S3_ACCESS_KEY"], aws_secret_access_key=credentials["S3_SECRET_KEY"],
                      config=Config(s3={"addressing_style": "path"}, connect_timeout=5, read_timeout=5,
                                    retries={"max_attempts": 0}))
    eventually(s3.list_buckets, "authenticated S3")
    bucket = "synthetic-smoke-" + uuid.uuid4().hex[:12]
    s3.create_bucket(Bucket=bucket)
    try:
        s3.put_object(Bucket=bucket, Key="synthetic.txt", Body=b"fabricated development evidence")
        assert s3.get_object(Bucket=bucket, Key="synthetic.txt")["Body"].read() == b"fabricated development evidence"
        try:
            http(f"http://127.0.0.1:8333/{bucket}/synthetic.txt")
            raise AssertionError("Anonymous evidence access was allowed")
        except HTTPError as error:
            assert error.code in (401, 403)
        print("PASS: signed object round-trip and anonymous read denied", flush=True)
    finally:
        s3.delete_object(Bucket=bucket, Key="synthetic.txt")
        s3.delete_bucket(Bucket=bucket)

    discovery = eventually(lambda: http("http://127.0.0.1:8081/realms/aicte-synthetic/.well-known/openid-configuration"),
                           "synthetic OIDC discovery")
    assert "/realms/aicte-synthetic" in json.loads(discovery[2])["issuer"]
    eventually(lambda: http("http://127.0.0.1:8025/readyz"), "mail sink readiness")
    message = EmailMessage()
    marker = "Synthetic smoke " + uuid.uuid4().hex
    message["From"] = "workflow@example.invalid"
    message["To"] = "institution@example.invalid"
    message["Subject"] = marker
    message.set_content("Synthetic local delivery check; no institution data.")
    with smtplib.SMTP("127.0.0.1", 1025, timeout=5) as smtp:
        smtp.send_message(message)

    def captured():
        messages = json.loads(http("http://127.0.0.1:8025/api/v1/messages")[2])["messages"]
        assert any(message["Subject"] == marker for message in messages)
    eventually(captured, "SMTP message captured by local sink")


if __name__ == "__main__":
    main()
