# ===== STAGE 1: BUILD =====
FROM gradle:8.7-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle clean bootJar -x test

# ===== STAGE 2: RUNTIME =====
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copiamos el JAR y lo renombramos
COPY --from=build /app/build/libs/sentiment-api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
