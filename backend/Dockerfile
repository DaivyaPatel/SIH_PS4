FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY stack-proof/pom.xml ./stack-proof/pom.xml
COPY backend ./backend
RUN mvn --batch-mode --no-transfer-progress -pl backend -am -DskipTests package

FROM eclipse-temurin:21-jre-noble
RUN useradd --create-home --uid 10001 application
WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/backend/target/backend-0.1.0-SNAPSHOT.jar app.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
