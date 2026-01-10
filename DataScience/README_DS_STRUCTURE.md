# 📂 Estructura del Laboratorio de Datos (Data Science)

Para facilitar el trabajo colaborativo y el control de versiones, este directorio ha sido organizado siguiendo estándares de la industria (Cookiecutter Data Science).

## 🗂 Organización de Carpetas

### 📓 `notebooks/`
*   **Propósito**: Almacenar todos los archivos `.ipynb` de Jupyter/Gradio.
*   **Contención**: Aquí deben vivir los experimentos, pruebas de autoaprendizaje y el desarrollo del modelo final.

### 📊 `data/`
*   **Propósito**: Fuente de verdad de los datos.
*   **Contención**: 
    *   Datasets de entrenamiento (`.csv`).
    *   Plantillas de Excel para pruebas (`.xlsx`).
    *   **Importante**: Estos archivos son pesados y no deben subirse a producción (Docker).

### 🤖 `models-history/`
*   **Propósito**: Repositorio histórico de inteligencias generadas.
*   **Contención**: Archivos `.pkl` de versiones anteriores (v1, v2, etc.). 
*   **Flujo**: El equipo de DS deja el modelo aquí; luego se copia el elegido (`R5K_v2.pkl`) hacia `ml-service/models/`.

### 📄 `docs/`
*   **Propósito**: Documentación técnica y reportes.
*   **Contención**: Informes de evolución, métricas de éxito (Accuracy, F1-Score) y manuales de uso.

## 🚀 Recomendaciones para el Equipo de DS

1.  **Versionamiento Semántico**: Al guardar un modelo en `models-history/`, usen nombres claros como `R5K_v1.0.2.pkl`.
2.  **Entorno de Construcción**: Se ha detectado que el modelo actual fue entrenado con `scikit-learn 1.5.2`. Para evitar errores de precisión, asegúrense de que el archivo `ml-service/requirements.txt` especifique esa misma versión.
3.  **Pipeline Unificado**: Sigan usando la técnica de Pipeline para asegurar que el preprocesamiento y el modelo viajen siempre juntos.
