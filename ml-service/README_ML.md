# Motor de IA: ml-service (FastAPI)

Este servicio representa el núcleo del sistema, encargado de transformar texto en predicciones estadísticas de sentimiento mediante modelos de Machine Learning.

---

## Funciones del Servicio

1.  **Carga de Artefactos**: Inicializa los archivos `modelo_final.pkl` y `vectorizador_final.pkl` en la memoria del servidor para optimizar los tiempos de inferencia.
2.  **Representación Vectorial**: Transforma el lenguaje natural en vectores numéricos procesables por el algoritmo Logistic Regression.
3.  **Inferencia Probabilística**: Calcula la probabilidad de pertenencia a una clase. Se define el umbral de 0.5 para clasificar entre etiquetas positivas o negativas.
4.  **Mantenimiento de Confianza**: Proporciona el nivel exacto de seguridad con el que el modelo emite su predicción.

---

## Especificaciones Técnicas

*   **Tecnología**: FastAPI sobre Python 3.12.
*   **Modelo**: Logistic Regression (Regresión Logística).
*   **Procesamiento**: TF-IDF Vectorization.
*   **Interfaz**: REST API con documentación interactiva integrada.

---

## Arquitectura de Endpoints

1.  `POST /predict`: Diseñado para análisis unitarios en tiempo real desde la consola de usuario.
2.  `POST /predict/batch`: Optimizado para cargas masivas, permitiendo el procesamiento concurrente de listas de texto.
3.  `GET /health`: Monitoreo del estado del servicio y verificación de la carga del modelo.
4.  `GET /docs`: Acceso directo a la documentación Swagger de la API.

---

## Ciclo de Vida del Modelo

El sistema permite la actualización en caliente del modelo siguiendo estos pasos:
1.  Reemplazar los archivos .pkl en el directorio raíz del servicio.
2.  Actualizar la constante `MODEL_VERSION` en el archivo `main.py`.

Esta arquitectura desacoplada permite que el equipo de Data Science itere sobre el modelo sin afectar la lógica del Backend o Frontend.
