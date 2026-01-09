FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copiamos el jar correcto
COPY target/sentiment-api-0.0.1-SNAPSHOT.jar app.jar

# Railway expone el puerto dinámico
EXPOSE 8080

# ARRANQUE CORRECTO
CMD ["java", "-jar", "app.jar"]