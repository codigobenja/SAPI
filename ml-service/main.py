
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os

MODEL_VERSION = "v1.0.0"

app = FastAPI(title="Sentiment API", version=MODEL_VERSION)

MODEL_PATH = "modelo_final.pkl"
VECT_PATH = "vectorizador_final.pkl"

# Global variables for model and vectorizer
model = None
vectorizer = None

@app.on_event("startup")
async def load_model():
    global model, vectorizer
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECT_PATH):
        raise RuntimeError("Model files not found!")
    
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECT_PATH)
    print("Model and Vectorizer loaded successfully.")

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    prevision: str
    probabilidad: float
    model_version: str

class BatchSentimentRequest(BaseModel):
    texts: list[str]

class BatchSentimentResponse(BaseModel):
    results: list[SentimentResponse]

@app.post("/predict/batch", response_model=BatchSentimentResponse)
async def predict_sentiment_batch(request: BatchSentimentRequest):
    if not request.texts:
        raise HTTPException(status_code=400, detail="List of texts cannot be empty")
    
    if model is None or vectorizer is None:
        raise HTTPException(status_code=500, detail="Model not initialized")

    try:
        # Vectorizar todos los textos a la vez (Mucho más rápido que uno por uno)
        vec = vectorizer.transform(request.texts)
        
        # Obtener todas las probabilidades
        probs = model.predict_proba(vec)
        
        results = []
        for i, prob in enumerate(probs):
            prob_pos = float(prob[1])
            prediction_label = "Positivo" if prob_pos > 0.5 else "Negativo"
            probability_score = prob_pos if prob_pos > 0.5 else (1 - prob_pos)
            
            results.append(SentimentResponse(
                prevision=prediction_label,
                probabilidad=round(probability_score, 4),
                model_version=MODEL_VERSION
            ))

        return BatchSentimentResponse(results=results)
    except Exception as e:
        import traceback
        print(f"ERROR EN PREDICCIÓN BATCH: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict", response_model=SentimentResponse)
async def predict_sentiment(request: SentimentRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if model is None or vectorizer is None:
        raise HTTPException(status_code=500, detail="Model not initialized")

    try:
        # Preprocess and vectorize
        vec = vectorizer.transform([request.text])
        
        # Predict
        probs = model.predict_proba(vec)[0]
        prob_pos = float(probs[1])
        
        prediction_label = "Positivo" if prob_pos > 0.5 else "Negativo"
        probability_score = prob_pos if prob_pos > 0.5 else (1 - prob_pos)

        return SentimentResponse(
            prevision=prediction_label,
            probabilidad=round(probability_score, 4),
            model_version=MODEL_VERSION
        )
    except Exception as e:
        import traceback
        print(f"ERROR EN PREDICCIÓN: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok", "model_loaded": model is not None}
