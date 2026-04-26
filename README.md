# Mochi 

**Mochi** es una aplicación web minimalista y elegante diseñada para ayudarte a memorizar vocabulario japonés de forma efectiva. Utiliza un sistema de flashcards interactivas donde puedes practicar tanto la lectura como la traducción, todo con un diseño cálido (Warm Linen) y una experiencia de usuario fluida.

---

## Características principales

- **Práctica dual**: Cambia entre el modo **Japonés → Español** (leer hiragana) y **Español → Japonés** (recordar la palabra).
- **Doble alfabeto**: Practica en pantallas separadas de **Hiragana** y **Katakana** con el mismo flujo de flashcards.
- **Escritura inteligente**: Escribe en romaji y el sistema te muestra kana en tiempo real.
- **Gestión de vocabulario**: Añade, edita y elimina palabras fácilmente. Incluye buscador y validación de duplicados.
- **Importar y exportar CSV**: Descarga tu colección o súbela con un archivo CSV.
- **Temas**: Modo claro y oscuro con estética cálida.
- **Historial**: Seguimiento de aciertos, errores y rachas durante la práctica, con botón de audio en cada entrada.
- **Audio japonés**: Botón de altavoz para escuchar la pronunciación en la tarjeta y en el historial.

---

## Estructura del proyecto

Aquí tienes un desglose de los ficheros y su propósito en el proyecto:

### Backend (Python/FastAPI)
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

### Frontend (HTML/CSS/JS)
- **`app/templates/`**: Plantillas HTML con Jinja2.
    - **`base.html`**: Estructura principal, navegación y lógica global del tema.
    - **`index.html`**: Pantalla principal de práctica e historial.
    - **`add_word.html`**: Panel de gestión y creación de vocabulario.
- **`app/static/css/style.css`**: Sistema de diseño completo (variables, modo oscuro, componentes y animaciones).
- **`app/static/js/`**
    - **`home.js`**: Lógica de la sesión de práctica, estadísticas y el historial en tiempo real.
    - **`add_word.js`**: Lógica para añadir palabras, buscador y el modal de edición.
    - **`romaji.js`**: El corazón de la conversión a Hiragana en el navegador.

### Otros
- **`run.py`**: Script de conveniencia para arrancar el servidor `uvicorn`.
- **`requirements.txt`**: Lista de dependencias del proyecto.
- **`mochi.db`**: Base de datos SQLite persistente.

---

## Cómo empezar

1. **Instalar dependencias**:

```bash
pip install -r requirements.txt
```

2. **Arrancar la app**:

```bash
python run.py
```

3. **Acceder**: Abre `http://127.0.0.1:8000` en tu navegador.

---

## Importación y exportación CSV

Puedes exportar o importar palabras desde la pantalla de **Añadir** usando el menú de ajustes.

El formato esperado del CSV es:

```csv
romaji,translation,note
sakura,cerezo,Flor de cerezo
neko,gato,
```

- El campo `note` es opcional.
- El sistema genera el hiragana automáticamente.

---