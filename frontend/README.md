# SentimentAPI Frontend

Interfaz de usuario para el análisis de sentimientos, construida con Next.js 14, Tailwind CSS y Framer Motion. Este panel permite interactuar con el motor de inteligencia artificial de forma intuitiva, ofreciendo visualizaciones de datos y procesamiento eficiente de archivos.

---

## Características Principales

### 1. Análisis Individual (Side-by-Side)
*   **Diseño Dual**: Permite visualizar la entrada de texto y el resultado de la IA simultáneamente en un panel dividido.
*   **Micro-interacciones**: Utiliza Framer Motion para ofrecer transiciones suaves y retroalimentación visual inmediata.
*   **Nivel de Confianza**: Representación gráfica de la seguridad del modelo mediante indicadores dinámicos.

### 2. Análisis Masivo (Batch Processing)
*   **Gestión de Archivos**: Soporte para la carga y lectura de formatos .xlsx y .csv de forma local.
*   **Micro-Batching**: Implementa procesamiento por lotes optimizado (5 registros por envío) para mantener la fluidez de la interfaz y actualizar el progreso en tiempo real.
*   **Dashboard Estadístico**: Generación automática de métricas, incluyendo distribución de sentimientos y tarjetas de resumen ejecutivo.

### 3. Métricas e Historial Cloud
*   **Sincronización**: Visualización centralizada de datos persistidos en Supabase o H2.
*   **Panel de Satisfacción**: Gráficas consolidadas que muestran el rendimiento global del sistema.
*   **Optimización de Tabla**: Diseño compacto para facilitar la lectura de grandes volúmenes de datos históricos.

---

## Stack Tecnológico

*   **Framework**: Next.js 14 (App Router)
*   **Estilos**: Tailwind CSS (Estrategia de diseño atómico)
*   **Animaciones**: Framer Motion
*   **Gráficas**: Recharts
*   **Librerías de Utilidad**: Lucide React (iconos) y SheetJS (procesamiento de datos)

---

## Estructura de la Aplicación

*   **app/**: Define las rutas y el diseño global del sitio.
*   **components/**: Módulos reutilizables como el formulario de análisis, la herramienta de carga masiva y el historial.
*   **lib/**: Contiene las funciones de comunicación con la API y configuraciones de entorno.

---

## Consideraciones de Diseño

*   **Persistencia de Estado**: Se implementó una arquitectura de levantamiento de estado (State Lifting) en el componente raíz para asegurar que la navegación entre pestañas no interrumpa los procesos de análisis activos.
*   **Diseño Adaptativo**: El sistema está optimizado para resoluciones de monitor profesional, con contenedores restringidos para mantener el equilibrio visual.
*   **Eficiencia Visual**: Se evitan placeholders genéricos, utilizando estados de carga y animaciones que mejoran la percepción de velocidad del sistema.
