# 🧪 Módulo de Ciencia de Datos - SAPI

Este directorio contiene los activos de Inteligencia Artificial para el análisis de sentimientos del proyecto SAPI, diseñado para optimizar la toma de decisiones basada en el feedback del cliente.

## 📂 Contenido del Repositorio
* **`Modelo_con_autoaprendizaje_binario.ipynb`**: Cuaderno principal que contiene el pre-procesamiento, el entrenamiento del modelo y la interfaz de usuario desarrollada en Gradio.
* **`dataset_modelado_sentimiento.csv`**: Base de datos de entrenamiento inicial utilizada para la calibración del modelo.
* **`consultas_recolectadas.csv`**: Historial dinámico de feedback que alimenta el sistema de aprendizaje continuo (Estado actual: 94 registros).
* **`carga masiva_ejemplo.xlsx`**: Plantilla oficial de referencia para la carga de datos empresariales por lote.

## ⚙️ Especificaciones Técnicas (Modelado)
* **Algoritmo**: Regresión Logística, seleccionada por su eficiencia en clasificación binaria y velocidad de respuesta.
* **Procesamiento de Lenguaje (NLP)**:
    * **Vectorización TF-IDF**: Para asignar pesos a palabras clave relevantes y descartar ruido.
    * **N-gramas (1,2)**: Capacidad de analizar palabras sueltas y frases compuestas (ej: "no bueno") para capturar el contexto real.
* **Balance del Dataset**: El modelo opera sobre una distribución neutral de 48.9% sentimientos positivos y 51.1% negativos.

## 🚀 Guía de Integración para Backend
1. **Requisito de Entrada**: Los archivos para carga masiva deben contener una columna con el encabezado exacto `clean_text`.
2. **Variable de Entorno**: Para ejecución local, ajustar la variable `BASE_PATH` en el script `.ipynb` para que apunte al directorio raíz del repositorio clonado.
