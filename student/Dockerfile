# Critical: Multi-stage Docker build packaging the Spring Boot application on JDK 21. If misconfigured, container building will fail or produce an unexecutable runtime image.
# Stage 1: Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper scripts and POM descriptor
COPY mvnw pom.xml ./
COPY .mvn .mvn/

# Ensure execution rights for the Maven wrapper binary
RUN chmod +x mvnw

# Resolve project dependencies offline to optimize Docker layer caching
RUN ./mvnw dependency:go-offline -B

# Copy project source files
COPY src src/

# Build production JAR package while bypassing unit tests
RUN ./mvnw clean package -DskipTests

# Stage 2: Production JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root system user for secure container execution
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy executable Spring Boot JAR artifact from build stage
COPY --from=build /app/target/*.jar app.jar

# Critical: Port mapping for Render cloud environments. If misconfigured, Render health checks and container routing will fail.
ENV PORT=8080
EXPOSE 8080

# Launch application passing dynamic PORT and memory configurations
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
