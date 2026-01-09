# ===== BUILD STAGE =====
FROM gradle:8.7-jdk17 AS build
WORKDIR /app

COPY . .
RUN gradle clean bootJar -x test

FROM eclipse-temurin:17-jdk
WORKDIR /app

COPY target/sentiment-api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"
