# Changelog Mochi

## [Unreleased] — Sistema de Categorías

### Añadido

#### Backend
- **Modelo `Category`** (`app/models/category.py`): nueva tabla `categories` con `id`, `name` (único) y relación many-to-many con `Word`.
- **Tabla intermedia `word_categories`**: tabla de asociación entre palabras y categorías.
- **Schema `CategoryOut`** (`app/schemas/category.py`): serialización de categorías para la API.
- **Schema actualizado** (`app/schemas/word.py`): campos `categories` (lista de strings) añadidos a `WordCreate`, `WordUpdate` y `WordOut`.
- **`CategoryService`** (`app/services/category_service.py`): lógica de negocio para listar y obtener/crear categorías (`get_all`, `get_or_create`).
- **`WordService` actualizado** (`app/services/word_service.py`):
  - `create()` y `update()` manejan lista de nombres de categorías.
  - `get_random()` acepta filtro opcional por lista de categorías.
  - `get_all()` acepta filtro opcional por categoría.
- **Router de categorías** (`app/routers/categories.py`): endpoint `GET /api/categories` para listar todas las categorías disponibles.
- **Router `words` actualizado** (`app/routers/words.py`):
  - `GET /api/words/random` acepta query param `category` repetible para filtrar.
  - `GET /api/words/` acepta query param `category`.
  - `POST` y `PUT` manejan campo `categories`.
  - Export CSV incluye columna `categories`.
  - Import CSV parsea columna `categories` opcional.
- **`assign_categories.py`**: script de categorización automática que asigna categorías a todas las palabras existentes usando reglas heurísticas.
- **`seed.py` actualizado**: palabras de ejemplo incluyen categorías iniciales.

#### Frontend
- **Dropdown de filtro por categorías** en la página de práctica (`index.html` + `home.js`):
  - Carga dinámica de categorías desde `/api/categories`.
  - Permite seleccionar múltiples categorías (checkboxes).
  - Aplica filtros al pedir palabras aleatorias.
  - Botón "Todas" para restaurar el filtro por defecto.
- **Selector de categorías** en el formulario de añadir/editar palabra (`add_word.html` + `add_word.js`):
  - Lista de checkboxes con todas las categorías disponibles.
  - Se pre-cargan las categorías al editar una palabra.
- **CSS**: estilos para el filtro de categorías en la navbar y en el formulario.

### Modificado
- **`app/models/word.py`**: añadida relación `categories` con `Category` vía tabla intermedia.
- **`app/main.py`**: incluido el router de categorías.
- **Formato CSV**: columna `categories` añadida (opcional, valores separados por comas).

### Base de datos
- Nuevas tablas: `categories`, `word_categories`.
- Las tablas se crean automáticamente al reiniciar la aplicación (`init_db`).
- **Categorías generadas automáticamente** (25 en total):
  `adjetivos`, `adverbios`, `animales`, `colores`, `comida`, `cortesía`, `cuerpo`, `deportes`, `dinero`, `educación`, `emociones`, `familia`, `gramática`, `lugares`, `naturaleza`, `números`, `objetos`, `países`, `personas`, `saludos`, `tiempo`, `trabajo`, `transporte`, `verbos`, `viajes`.
- **Categorización aplicada**: 223 de 236 palabras recibieron al menos una categoría.
- Palabras del CSV importadas a la base de datos existente (230 nuevas, 4 duplicadas omitidas).

### Fix
- **`WordOut` schema**: añadido `field_validator` para convertir objetos `Category` a strings en la respuesta JSON.

### Mejoras adicionales (feedback del usuario)
- **Buscador de categorías** en el dropdown de filtros de práctica (`home.js`).
- **Filtro por categoría** en la lista de palabras de la página "Añadir" (`add_word.html` + `add_word.js`): chips de checkboxes para seleccionar múltiples categorías y filtrar la lista (lógica OR: palabras que pertenezcan a al menos una categoría seleccionada).
- **Nueva categoría `vestimenta`** añadida a las reglas de categorización automática.
- **Checkboxes estilizadas**: fondo beige (`--color-bg-subtle`) cuando no están marcadas, con transición suave y check blanco al marcar. Aplica tanto al filtro de práctica como al selector de formularios.
