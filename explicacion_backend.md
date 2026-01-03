# Explicación de la Lógica del Backend (Spring Boot)

Este documento detalla cómo funciona cada parte del servidor backend para que sea fácil de entender y mantener.

## Arquitectura por Capas

El backend está organizado siguiendo el patrón de diseño **Multi-capa**, lo que separa las responsabilidades y facilita el mantenimiento.

### 1. Capa de Modelo (`model`)
- **Archivo**: `Prediction.java`
- **¿Qué hace?**: Define cómo se guardan los datos en la base de datos (Supabase). Representa una tabla llamada `predictions`.
- **Campos**: Guarda el texto original, la predicción (ej. "Positivo"), la probabilidad (ej. 0.98), la versión del modelo de DS y la fecha de creación automática.

### 2. Capa de Repositorio (`repository`)
- **Archivo**: `PredictionRepository.java`
- **¿Qué hace?**: Es la interfaz que conecta Java con la base de datos. Gracias a `JpaRepository`, no necesitamos escribir código SQL para operaciones básicas como guardar (`save`) o buscar datos.

### 3. Capa de DTOs (`dto`)
- **Archivos**: `SentimentRequest.java`, `SentimentResponse.java`
- **¿Qué hace?**: "DTO" significa *Data Transfer Object*. Son objetos simples usados exclusivamente para recibir datos del Frontend o enviarlos de vuelta. Ayudan a que el formato de entrada/salida sea claro y no cambie aunque la lógica interna lo haga.

### 4. Capa de Servicio (`service`)
- **Archivo**: `SentimentService.java`
- **¿Qué hace?**: Es el **cerebro** de la aplicación. Aquí reside la "lógica de negocio":
    1. Valida los datos recibidos (texto unitario o listas).
    2. Usa `RestTemplate` para llamar al **Servicio ML** (FastAPI). Detecta automáticamente si debe usar el endpoint unitario o el endpoint **Batch** (lotes) para máxima eficiencia.
    3. Para análisis masivos, utiliza `predictionRepository.saveAll(predictions)`, lo que reduce drásticamente el tráfico con la base de datos (Supabase) al realizar una sola transacción para múltiples registros.
    4. Devuelve la respuesta final optimizada.

### 5. Capa de Controlador (`controller`)
- **Archivo**: `SentimentController.java`
- **¿Qué hace?**: Es la **ventana** hacia el exterior. Recibe las peticiones HTTP (POST) que vienen del Frontend:
    - Escucha en la ruta `/sentiment`.
    - Atrapa posibles errores (como si el servicio ML está caído o el texto es inválido) y devuelve códigos de error claros al usuario (400 si es error del cliente, 500 si es del servidor).

## Base de Datos Híbrida (Inteligente)
El sistema utiliza una estrategia de persistencia dual para facilitar tanto el desarrollo local como el despliegue en producción:
*   **Supabase (PostgreSQL)**: Se activa automáticamente si el sistema detecta credenciales (`DB_PASSWORD` o `.env`). Ideal para producción y persistencia real.
*   **H2 (Memoria)**: Se activa automáticamente si NO hay credenciales. Ideal para colaboradores o pruebas rápidas sin internet.
*   **Lógica de Cambio**: Gestionada en `SentimentApplication.java` al inicio.

## Optimización Híbrida (Micro-Batching + JDBC)
Para lograr el equilibrio perfecto entre **Experiencia de Usuario (UX)** y **Rendimiento de Base de Datos**, el sistema implementa una estrategia doble:

1.  **Frontend (Micro-Batching)**: Envía datos en bloques pequeños (5 registros) en lugar de masivos (200). Esto garantiza que la barra de progreso se actualice constantemente, evitando la sensación de "sistema congelado".
2.  **Backend (JDBC Batching)**: Utiliza `Hibernate JDBC Batching` para acumular estas inserciones pequeñas y enviarlas a la base de datos (Supabase) en una sola operación optimizada cada cierto tiempo.
    *   *Propiedad*: `spring.jpa.properties.hibernate.jdbc.batch_size=50`
    *   *Resultado*: Alta velocidad de escritura sin bloquear la interfaz visual.

## Resumen del Flujo de Datos
... (El flujo permite tanto análisis unitarios en tiempo real como procesamiento masivo diferido optimizado).

1. El **Frontend** envía un texto al **Controlador**.
2. El **Controlador** le pasa el texto al **Servicio**.
3. El **Servicio** valida el texto y pide el análisis al **Servicio ML (Python)**.
4. El **Servicio ML** devuelve la predicción.
5. El **Servicio** guarda esa predicción en **Supabase** (o H2 si es entorno local/desarrollo).
6. El **Servicio** le devuelve la respuesta al **Controlador**, y este al **Frontend**.

---
*Este diseño asegura que si en el futuro quieres cambiar la base de datos o el modelo de ML, solo tengas que tocar una parte específica del código sin romper el resto.*
