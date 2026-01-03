# Reporte de Cumplimiento: Backend SentimentAPI

Este documento certifica el estado de las tareas de desarrollo del backend y la arquitectura de integración de datos.

## Estado de Tareas (Checklist)

| ID | Tarea | Estado | Justificación Técnica |
| :-- | :--- | :--- | :--- |
| 1 | Crear proyecto Spring Boot | **Completado** | Estructura Maven funcional con dependencias de Web, JPA y Lombok. |
| 2 | Crear endpoint `POST /sentiment` | **Completado** | Endpoint operativo en `SentimentController` con soporte para análisis masivo (Batch). |
| 3 | Validar que el texto no esté vacío | **Completado** | Lógica de validación implementada en `SentimentService` devolviendo `400 Bad Request`. |
| 4 | Responder JSON mock | **Pasado** | Se superó esta fase; el sistema ahora devuelve datos reales de la IA. |
| 5 | Adaptar respuesta al contrato JSON | **Completado** | Uso de DTOs (`SentimentResponse`) para asegurar consistencia con el Frontend. |
| 6 | Manejar errores básicos | **Completado** | Gestión de excepciones globales para servicios caídos o entradas inválidas. |
| 7 | Cargar modelo entrenado en la API | **Completado** | El modelo (`.pkl`) se carga en el `ml-service` (Python) y es consumido por el Backend. |
| 8 | Enviar el texto al modelo | **Completado** | Integración fluida vía `RestTemplate` entre Java y el motor de IA. |
| 9 | Recibir predicción y probabilidad | **Completado** | Captura completa de resultados de la IA, incluyendo la versión del modelo. |

---

## Arquitectura de Almacenamiento y Consulta

Se ha implementado un sistema de persistencia inteligente que se adapta al entorno de ejecución:

### 1. Almacenamiento Local (Modelo de IA)
*   **Archivos**: `modelo_final.pkl` y `vectorizador_final.pkl`.
*   **Ubicación**: Carpeta `ml-service/`.
*   **Carga**: Se cargan en memoria RAM al iniciar el servidor FastAPI para garantizar respuestas con latencia mínima.

### 2. Almacenamiento de Resultados (Base de Datos)
Toda consulta es persistida automáticamente para su posterior visualización en el historial:
*   **Modo Producción**: Utiliza Supabase (PostgreSQL) para persistencia remota.
*   **Modo Desarrollo/Docker**: Utiliza H2 Database (En memoria) para facilitar la portabilidad del entorno.

### 3. Datos Disponibles para Consulta
El endpoint `GET /history` proporciona los siguientes metadatos:
*   `text`: Contenido original analizado.
*   `sentiment`: Etiqueta predicha (Positivo/Negativo).
*   `probability`: Confianza estadística del modelo.
*   `modelVersion`: Identificador del modelo utilizado.
*   `createdAt`: Registro temporal de la operación.

---

## Logros Adicionales
*   **Procesamiento por Lotes (Batching)**: Implementación de Micro-Batching para una experiencia de usuario fluida sin sacrificar el rendimiento de la base de datos.
*   **Contenedores de Despliegue**: Orquestación profesional mediante Docker Compose para asegurar la escalabilidad.

El sistema se encuentra en estado estable y cumple con los estándares de calidad requeridos por el equipo de ingeniería.
