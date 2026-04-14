# 🍡 Mochi — Tu Compañero para Aprender Japonés

**Mochi** es una aplicación web minimalista y elegante diseñada para ayudarte a memorizar vocabulario japonés de forma efectiva. Utiliza un sistema de flashcards interactivas donde puedes practicar tanto la lectura como la traducción, todo con un diseño cálido (Warm Linen) y una experiencia de usuario fluida.

---

## ✨ Características Principales

- **Práctica Dual**: Cambia entre el modo **Japonés → Español** (leer hiragana) y **Español → Japonés** (recordar la palabra).
- **Escritura Inteligente**: Escribe en romaji y el sistema te mostrará una previsualización en hiragana en tiempo real.
- **Gestión de Vocabulario**: Añade, edita y elimina palabras fácilmente. Incluye un buscador integrado y un sistema de advertencia para evitar duplicados.
- **Temas**: Soporta modo claro y oscuro con una estética premium basada en tonos beige y marrones.
- **Historial y Estadísticas**: Seguimiento de tus aciertos, errores y rachas durante las sesiones de práctica.

---

## 📂 Estructura del Proyecto

Aquí tienes un desglose de los ficheros y su propósito en el proyecto:

### 🏠 Backend (Python/FastAPI)
- **`app/main.py`**: Punto de entrada de la aplicación. Configura la API, los esquemas de base de datos y monta los routers.
- **`app/database.py`**: Configuración de SQLAlchemy y la conexión a la base de datos SQLite (`mochi.db`).
- **`app/config.py`**: Variables de configuración globales.
- **`app/models/word.py`**: Modelo de datos de SQLAlchemy para la tabla de palabras.
- **`app/schemas/word.py`**: Modelos de Pydantic (`WordCreate`, `WordUpdate`, `WordOut`) para la validación de datos en la API.
- **`app/routers/`**
    - **`words.py`**: Endpoints de la API para el CRUD de palabras (GET, POST, PUT, DELETE).
    - **`pages.py`**: Rutas que sirven las páginas HTML utilizando Jinja2.
- **`app/services//`**
    - **`word_service.py`**: Lógica de negocio (CRUD, conteo de palabras, lógica de actualización).
    - **`romaji.py`**: Conversor de Romaji a Hiragana en el lado del servidor.

### 🎨 Frontend (HTML/CSS/JS)
- **`app/templates/`**: Plantillas HTML con Jinja2.
    - **`base.html`**: Estructura principal, navegación y lógica global del tema.
    - **`index.html`**: Pantalla principal de práctica e historial.
    - **`add_word.html`**: Panel de gestión y creación de vocabulario.
- **`app/static/css/style.css`**: Sistema de diseño completo (variables, modo oscuro, componentes y animaciones).
- **`app/static/js/`**
    - **`home.js`**: Lógica de la sesión de práctica, estadísticas y el historial en tiempo real.
    - **`add_word.js`**: Lógica para añadir palabras, buscador y el modal de edición.
    - **`romaji.js`**: El corazón de la conversión a Hiragana en el navegador.

### ⚙️ Otros
- **`run.py`**: Script de conveniencia para arrancar el servidor `uvicorn`.
- **`requirements.txt`**: Lista de dependencias del proyecto.
- **`mochi.db`**: Base de datos SQLite persistente.

---

## 🚀 Cómo Empezar

1. **Instalar dependencias**: `pip install -r requirements.txt`
2. **Arrancar la app**: `python run.py`
3. **Acceder**: Abre `http://127.0.0.1:8000` en tu navegador.

---

## 🔮 Futuras Mejoras Planeadas

### Nivel 1: Alto Impacto (Próximo)

- **🧠 Sistema de Repaso Inteligente (SRS)**
  - Algoritmo SM-2 para optimizar el aprendizaje
  - Ajuste automático de intervalos de revisión basado en rendimiento
  - Estadísticas persistentes de cada palabra
  - Modo de práctica enfocado en palabras difíciles

- **🔊 Síntesis de Voz (TTS) en Japonés**
  - Botón para escuchar pronunciación nativa
  - Audio cacheado para mejor rendimiento
  - Integración con Google Text-to-Speech

- **📊 Dashboard de Estadísticas**
  - Gráficos de progreso a lo largo del tiempo
  - Tasa de éxito por palabra
  - Mejor racha personal
  - Palabras más difíciles vs más fáciles

### Nivel 2: Funcionalidad Avanzada

- **📱 Export/Import de Colecciones**
  - Descargar vocabulario en CSV/JSON
  - Importar colecciones desde archivo
  - Compartir colecciones con otros usuarios

- **🎓 Categorías y Etiquetas**
  - Organizar palabras por tema (alimentos, números, verbos, etc.)
  - Filtrar práctica por categoría
  - Estadísticas desglosadas por categoría

- **🏆 Sistema de Logros**
  - Badges por hitos: "Primer paso", "Coleccionista", "Racha 🔥"
  - Desafíos semanales
  - Tabla de clasificación (local o global)

- **📅 Calendario de Racha**
  - Visualización tipo GitHub contributions
  - Contador de días consecutivos de práctica
  - Motivación visual para consistencia

### Nivel 3: Características Avanzadas

- **🔐 Autenticación y Cuentas de Usuario**
  - Login/Registro de usuarios
  - Sincronización multi-dispositivo
  - Copias de seguridad automáticas en la nube

- **🌐 Marketplace de Colecciones**
  - Comunidad compartiendo colecciones pre-hechas
  - "JLPT N4 Vocabulario", "Comida Japonesa", etc.
  - Sistema de ratings y comentarios

- **🎮 Modos de Práctica Adicionales**
  - **Modo Kanji**: Mostrar kanji + furigana
  - **Modo Pronunciación**: Audio + escribir romaji
  - **Modo Contexto**: Frase de ejemplo + adivinar palabra
  - **Modo Velocidad**: Timer de 5 segundos, máximos puntos por rapidez
  - **Modo Escritura**: Prácticar caligrafía (canvas)

- **🗣️ Reconocimiento de Voz**
  - Usuario habla su respuesta
  - Verificación automática con TTS
  - Práctica de comprensión auditiva

### Nivel 4: Experimental/IA

- **🤖 Generador de Contexto con IA**
  - OpenAI/Claude genera automáticamente:
    - Frases de ejemplo
    - Mnemotécnicas personalizadas
    - Imágenes relacionadas
  - Mejora el aprendizaje mediante contexto

- **🔗 Integración Jisho API**
  - Al añadir palabra, buscar automáticamente:
    - Kanji oficial y furigana
    - Múltiples definiciones
    - Sinónimos
    - Información de frecuencia (común/poco común)

- **📚 Integración con Anki**
  - Exportar a formato Anki
  - Importar mazos de Anki
  - Sincronización bidireccional

---

## 💡 Roadmap Estimado

| Trimestre | Enfoque | Características |
|-----------|---------|-----------------|
| **Q2 2026** | Aprendizaje | SRS, TTS, Dashboard |
| **Q3 2026** | Comunidad | Export/Import, Categorías, Logros |
| **Q4 2026** | Escalabilidad | Autenticación, Marketplace |
| **2027** | Experiencia | IA, Reconocimiento de voz, Anki |

---

¡Disfruta aprendiendo japonés con Mochi! 🍡
