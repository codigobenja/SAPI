# Guía de Implementación de Supabase para SAPI

Esta guía detalla los pasos para migrar de la base de datos en memoria (H2) a una base de datos PostgreSQL persistente en Supabase.

## 1. Configuración de Variables de Entorno

El backend está programado para detectar automáticamente si existen credenciales de base de datos. Si las encuentra, usará Supabase; si no, usará H2.

Para activar Supabase, debes crear o modificar el archivo `.env` en la raíz del proyecto (`SAPI/.env`) con las siguientes variables:

```properties
# Credenciales de Supabase (Obligatorias para producción)
DB_URL=jdbc:postgresql://<TU_PROYECTO>.supabase.co:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=<TU_CONTRASEÑA_DE_BASE_DE_DATOS>

# Opional: Puerto del servidor (por defecto 8080)
PORT=8080
```

> **Nota:** El código fuente busca la variable `DB_PASSWORD`. Si esta variable existe y no está vacía, el sistema cambiará al perfil "supabase".

## 2. Esquema de Base de Datos (SQL)

Debes ejecutar el siguiente script SQL en el "SQL Editor" de tu panel de control de Supabase para crear la tabla necesaria.

```sql
-- Tabla para guardar las predicciones de sentimiento
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    prediction VARCHAR(50) NOT NULL, -- 'Positivo' o 'Negativo'
    probability DOUBLE PRECISION NOT NULL,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices recomendados para consultas rápidas
CREATE INDEX idx_predictions_created_at ON predictions(created_at);
CREATE INDEX idx_predictions_prediction ON predictions(prediction);
```

## 3. Verificación

1.  Asegúrate de que el archivo `.env` esté guardado.
2.  Reinicia el backend (`./gradlew bootRun`).
3.  Observa los logs al iniciar. Deberías ver el mensaje:
    `>>> Credenciales detectadas: Activando SUPABASE (Producción).`
4.  Realiza una predicción desde el frontend.
5.  Verifica en el "Table Editor" de Supabase que el registro haya aparecido en la tabla `predictions`.
