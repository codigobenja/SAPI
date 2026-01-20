# Backend API: SAPI Gateway (Spring Boot)

Este servicio actúa como el orquestador central del ecosistema SAPI, gestionando la comunicación entre el cliente (Frontend), el motor de inteligencia artificial (ML Service) y la persistencia de datos.

---

## Funciones del Servicio

1.  **Orquestación de Flujo**: Recibe las peticiones del Frontend y las delega al servicio de Machine Learning para su análisis.
2.  **Persistencia de Historial**: Almacena de forma automática cada análisis realizado (unitario o masivo) en la base de datos para su posterior consulta.
3.  **Gestión de Datos Masivos**: Procesa listas de comentarios, coordinando las llamadas por lotes al servicio de IA y consolidando los resultados.
4.  **Servicio de Auditoría**: Expone los registros históricos permitiendo filtrar y consultar métricas de rendimiento del sentimiento.

---

## Especificaciones Técnicas

*   **Tecnología**: Java 17 con Spring Boot 3.x.
*   **Gestión de Dependencias**: Gradle.
*   **Seguridad**: Configuración de CORS habilitada para comunicación segura con el Frontend.
*   **Comunicación Interna**: RestTemplate para llamadas eficientes al `ml-service`.
*   **Base de Datos**: PostgreSQL (via Spring Data JPA).

---

## Arquitectura de Endpoints

### Análisis de Sentimiento
*   `POST /analyze`: Recibe un texto plano, solicita la predicción al motor de IA y guarda el resultado.
*   `POST /analyze/batch`: Procesa una colección de textos, optimizando la comunicación con el servicio ML.

### Gestión de Historial
*   `GET /history`: Recupera la lista completa de análisis realizados.
*   `GET /history/stats`: (Opcional) Proporciona resúmenes estadísticos de los sentimientos registrados.

### Sistema
*   `GET /health`: Verifica la disponibilidad del backend y su conectividad con servicios dependientes.

---

## Configuración y Despliegue

El servicio requiere las siguientes variables de entorno o propiedades para su funcionamiento:
*   `ML_SERVICE_URL`: Dirección base del servicio FastAPI (ej. `http://ml-service:8000`).
*   Configuración de `datasource`: URL, usuario y contraseña de la base de datos PostgreSQL.

Este componente está diseñado para ser agnóstico al modelo de IA utilizado, permitiendo escalar el motor de predicción sin necesidad de modificar la lógica de negocio central.
