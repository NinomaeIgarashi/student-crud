# Critical: Multi-stage Docker build packaging the Spring Boot application on JDK 21. If misconfigured, container building will fail or produce an unexecutable runtime image.
# Stage 1: Build stage with pre-installed Maven on JDK 21
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy POM descriptor and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy project source files and package production JAR
COPY src src/
RUN mvn clean package -DskipTests

# Stage 2: Production JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root system user for secure container execution
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy executable Spring Boot JAR artifact from build stage
COPY --from=build /app/target/*.jar app.jar

# Critical: Dynamic port mapping for Render cloud environments. If misconfigured, Render health checks and container routing will fail.
ENV PORT=8080
EXPOSE 8080

# Launch application passing dynamic PORT and memory configurations
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
