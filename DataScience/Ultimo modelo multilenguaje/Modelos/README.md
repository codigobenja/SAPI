# 🤖 R5K v2 - Motor de IA para Análisis de Sentimientos

## 📌 Descripción
Modelo de Inteligencia Artificial bilingüe (Español/Portugués) diseñado para la clasificación de sentimientos en auditorías de servicio. Utiliza un **Pipeline unificado** que integra preprocesamiento de lenguaje natural (NLP) y clasificación logística.

## 📊 Especificaciones Técnicas
- **Nombre del modelo:** R5K v2
- **Arquitectura:** Pipeline (TfidfVectorizer + Logistic Regression)
- **Precisión (Accuracy):** 96.38% tras pruebas de estrés.
- **Idiomas:** Español (énfasis en jerga chilena) y Portugués (Brasil).
- **Formato de entrega:** `R5K_v2.pk1` (Archivo único serializado).

## 🚀 Mejoras de la Versión 2
1. **Unificación de Componentes:** Se fusionó el vectorizador y el clasificador en un solo objeto para evitar errores de sincronización en el Backend.
2. **Robustez ante Estrés:** Entrenado específicamente para detectar sarcasmo, dobles negaciones y jerga local.
3. **Balanceo Dinámico:** Algoritmo de balanceo de clases que garantiza que el modelo no sea sesgado (neutralidad total).
4. **Limpieza de Contradicciones:** Filtro automático que elimina datos de entrenamiento contradictorios.

## 🛠️ Instrucciones para Backend (FastAPI)
Para utilizar el modelo, solo se debe cargar el archivo único:

```python
import joblib
# Cargar el pipeline completo
model = joblib.load('R5K_v2.pk1')

# Predicción directa sin preprocesamiento externo
resultado = model.predict(["El servicio fue excelente"])
