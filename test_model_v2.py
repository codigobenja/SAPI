import joblib
import os

model_path = 'ml-service/models/R5K_v2.pkl'
pipeline = joblib.load(model_path)

tests = [
    "Me encanta este sistema, es muy rapido",
    "No me gusta nada el diseno",
    "El servicio al cliente fue mediocre",
    "Excelente herramienta para mi negocio"
]

print(f"{'Texto':<40} | {'Prob Positiva':<15} | {'Sentimiento'}")
print("-" * 75)

for t in tests:
    prob = pipeline.predict_proba([t])[0][1]
    sentiment = "Positivo" if prob > 0.5 else "Negativo"
    print(f"{t:<40} | {prob:<15.4f} | {sentiment}")
