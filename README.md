# Sentiment Analysis AI Platform

Plataforma de análisis de sentimientos basada en Microservicios. Detecta emociones en textos (Comentarios, Reseñas, Feedback) utilizando Inteligencia Artificial avanzada y visualización de datos en tiempo real.

---

## Arquitectura del Sistema

El sistema opera mediante la integración de tres servicios principales que deben estar activos simultáneamente:

| Servicio | Tecnología | Puerto | Descripción |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 14 | `3000` | Interfaz de usuario, gráficas y reportes. |
| **Backend** | Spring Boot | `8080` | Corazón del sistema, lógica y base de datos. Soporta procesamiento por lotes. |
| **IA (Cerebro)** | FastAPI | `8000` | Motor de predicción usando Scikit-Learn. Optimizado para análisis masivo. |

---

## Guía de Colaboración (Modo Desarrollador)

Para trabajar de la forma más eficiente y permitir el `hot-reload`, se recomienda usar **3 terminales separadas**.

### Requisitos Mínimos
- **Java 17** (Solo necesitas tener instalado el JDK).
- **Python 3.9+**
- **Node.js 18+**

> [!TIP]
> **NO es necesario instalar Gradle**. Este proyecto incluye un "Wrapper" (`gradlew`) que descargará todo lo necesario automáticamente.

### Paso 1: Encender la IA (Cerebro)
En la **Terminal 1**:
```powershell
cd ml-service
.\venv\Scripts\activate
python -m uvicorn main:app --port 8000
```

### Paso 2: Encender el Backend (Corazón)
En la **Terminal 2**:
```powershell
cd backend
.\gradlew bootRun
```

### Paso 3: Encender la Interfaz (Frontend)
En la **Terminal 3**:
```powershell
cd frontend
# (Solo la primera vez o si hay cambios)
npm install 
npm run dev
```

---

## Modo Despliegue Rápido (Docker)

Si deseas probar todo el sistema sin instalar dependencias locales, usa Docker Compose:

```bash
docker compose up --build
```
*Este modo empaqueta los tres servicios y los orquestra automáticamente.*
*cerrar docker ctrl + C.*
```bash
docker compose down
```
---

## Solución de Problemas (Puertos Ocupados)

Si al iniciar un servicio ves un error como `Errno 10048` o `Address already in use`, significa que el puerto está bloqueado.

**Solución rápida en Windows (PowerShell):**
```powershell
# Para liberar el puerto 8000 (IA)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
```

---

## Mantenimiento y Reinicio de Servicios

Si el sistema no responde o necesitas aplicar cambios tras actualizar el código:

### 🔄 Flujo de Reinicio Rápido
1. **Detener**: Presiona `Ctrl + C` en las terminales activas.
2. **Liberar Puertos** (Si se quedaron bloqueados):
   ```powershell
   # Limpiar Puerto 8000 (IA)
   Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

   # Limpiar Puerto 8080 (Backend)
   Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
   ```
3. **Arrancar**: Ejecuta los comandos de inicio de cada carpeta (`uvicorn` para ML y `gradlew` para Backend).

---

## Características de Vanguardia
- **Análisis Lado a Lado**: Visualiza consulta y resultado simultáneamente para mayor agilidad.
- **Persistencia de Sesión**: Navega entre pestañas sin perder tus análisis en curso.
- **Visualización**: Dashboards con gráficas de pastel y tablas compactas tipo dashboard profesional.
- **Base de Datos Híbrida**: Integración con Supabase para persistencia en nube o H2 local.
