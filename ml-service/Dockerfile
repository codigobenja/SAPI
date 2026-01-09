# Usamos la versión más estable y ligera
FROM python:3.12-slim

WORKDIR /app

# Primero instalamos solo las librerías necesarias (Capa de caché)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos SOLO los archivos vitales del sistema
COPY main.py .
COPY modelo_final.pkl .
COPY vectorizador_final.pkl .

# Exponemos el puerto de la IA
EXPOSE 8000

# Iniciamos el servicio directamente
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# ===== RUNTIME =====
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/build/libs/sentiment-api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
