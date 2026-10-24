# Synthetic compatibility proof; deployment target is Linux amd64.
# Pin approved base-image digests before an actual pilot deployment.
FROM maven:3.9.11-eclipse-temurin-21 AS build
RUN useradd --create-home --uid 10001 proofbuilder
WORKDIR /workspace
COPY --chown=10001:10001 pom.xml ./
COPY --chown=10001:10001 stack-proof ./stack-proof
RUN chown 10001:10001 /workspace
USER 10001:10001
# Embedded PostgreSQL intentionally runs as an unprivileged user.
RUN mvn --batch-mode --no-transfer-progress verify

FROM eclipse-temurin:21-jre-noble
RUN useradd --create-home --uid 10001 proof
WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/stack-proof/target/stack-proof-0.1.0-SNAPSHOT.jar app.jar
USER 10001:10001
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
CMD ["--probe-native"]
