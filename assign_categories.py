"""Automatically assign categories to all existing words in the database."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.database import SessionLocal, init_db
from app.models.word import Word
from app.services.category_service import CategoryService


CATEGORY_RULES: dict[str, list[str]] = {
    "saludos": [
        "konnichiwa", "konbanwa", "ohayou", "ohayou gozaimasu",
        "sayounara", "mata ne", "oyasumi", "oyasumi nasai", "youkoso",
        "hai", "iie", "jaa",
    ],
    "cortesía": [
        "arigatou", "arigatou gozaimasu", "onegaishimasu",
        "yoroshiku onegaishimasu", "sumimasen", "shitsurei shimasu",
        "kashikomarimashita", "irasshaimashe", "kudasai",
    ],
    "familia": [
        "chichi", "otousan", "haha", "musuko", "musume", "shujin",
        "tsuma", "kanai", "kyoudai", "okaasan", "musuko-san",
        "musume-san", "go-shujin", "okusan", "go-kyoudai",
        "go-kazoku", "kocchi", "kono ko",
    ],
    "lugares": [
        "ie", "eki", "uchi", "jimusho", "suupaa", "daigaku", "ginkoo",
    ],
    "comida": [
        "ocha", "wain", "tamago", "osushi", "keeki", "ringo",
        "hirugohan", "asagohan", "bangohan", "shokuji", "mizu",
    ],
    "transporte": [
        "kuruma", "densha",
    ],
    "animales": [
        "neko", "inu",
    ],
    "naturaleza": [
        "sakura", "mizu", "aki", "kusa", "yoake", "sekai",
    ],
    "verbos": [
        "tabemasu", "okimasu", "ikimasu", "shimasu", "yomimasu",
        "kakimasu", "nemasu", "nomimasu", "hanashimasu", "mimasu",
        "kikimasu", "kaimasu", "hatarakimasu", "tsukurimasu",
        "kaerimasu", "kimasu", "tsukimasu", "souji shimasu",
        "denwa shimasu", "gorogoro shimasu", "benkyou shimasu",
        "shigoto shimasu", "sakkaa o shimasu", "gorufu o shimasu",
        "shokuji shimasu", "ryokou shimasu", "kaimono shimasu",
        "hipparu", "hanatsu", "au",
    ],
    "personas": [
        "sensei", "tomodachi", "shufu", "boku", "anata", "kare",
        "kanojo", "watashitachi", "anatatachi", "karera", "kanojotachi",
        "nihonjin", "dare",
    ],
    "tiempo": [
        "asa", "kesa", "ashita", "kyou", "konshuu", "kongetsu",
        "kotoshi", "raishuu", "raigetsu", "rainen", "nichi", "shuu",
        "getsu", "tsuki", "nen", "toshi", "mainichi", "maishuu",
        "maitsuki", "mainen", "maitoshi", "gogo", "yoru", "ji",
        "goro",
    ],
    "números": [
        "hitotsu", "futatsu", "mittsu", "yottsu", "itsutsu", "muttsu",
        "nanatsu", "yattsu", "kokonotsu", "too", "juu nana", "ni juu",
        "yonjuu go", "nanajuu ichi", "ichigatsu", "nigatsu", "shigatsu",
        "shichigatsu", "juuichigatsu", "sen", "hyaku-en",
    ],
    "objetos": [
        "hon", "meishi", "shinbun", "tokei", "kitte", "yukata", "sensu",
        "denchi", "kaban", "hagaki", "ningyou", "o-hashi", "keitai",
        "o-sake", "kutsu", "kami", "kaado", "e",
    ],
    "gramática": [
        "no", "ni", "de", "ga", "to", "kara", "wa", "desu",
        "dewa arimasen", "ja arimasen", "ja nai arimasen",
        "imasu", "arimasu", "nani", "dono", "dore", "ikura",
        "zenbu de", "made",
    ],
    "adjetivos": [
        "aoi", "akai", "ookii", "oishii", "suki",
    ],
    "adverbios": [
        "hayaku", "itsumo", "tokidoki", "sorekara", "taitei",
        "tama ni", "yoku", "osoku", "zenzen", "issho ni",
    ],
    "dinero": [
        "hyaku-en", "ikura", "ginkoo", "sen", "zenbu de",
    ],
    "viajes": [
        "ryokou", "kankoku", "chuugoku", "nihon", "eki", "densha",
    ],
    "trabajo": [
        "shigoto", "hatarakimasu", "shigoto shimasu", "jimusho",
        "shufu",
    ],
    "educación": [
        "sensei", "daigaku", "benkyou", "benkyou shimasu", "gakku",
    ],
    "deportes": [
        "sakkaa", "gorufu", "sakkaa o shimasu", "gorufu o shimasu",
    ],
    "cuerpo": [
        "kao", "kokoro", "koe",
    ],
    "emociones": [
        "ai", "suki",
    ],
    "colores": [
        "aoi", "akai",
    ],
    "países": [
        "nihon", "kankoku", "chuugoku",
    ],
    "vestimenta": [
        "kaban", "kutsu", "yukata", "keitai",
    ],
}


def assign_categories_to_words(db: Session) -> None:
    """Assign categories to all words based on heuristic rules."""
    words = db.query(Word).all()
    assigned_count = 0

    for word in words:
        categories_to_assign: set[str] = set()
        romaji = word.romaji.lower()
        translation = word.translation.lower()
        note = (word.note or "").lower()

        # Direct romaji match
        for category, romaji_list in CATEGORY_RULES.items():
            for r in romaji_list:
                if r.lower() == romaji:
                    categories_to_assign.add(category)

        # Translation / note keyword matching for broader coverage
        keyword_map: dict[str, list[str]] = {
            "familia": ["padre", "madre", "hijo", "hija", "esposo", "esposa", "hermano", "familia", "niño"],
            "comida": ["comer", "desayuno", "almuerzo", "cena", "té", "sushi", "huevo", "manzana", "pastel", "vino", "agua", "arroz", "comida"],
            "lugares": ["casa", "hogar", "oficina", "supermercado", "universidad", "banco", "estación"],
            "transporte": ["coche", "tren"],
            "animales": ["gato", "perro"],
            "naturaleza": ["cerezo", "flor", "otoño", "hierba", "amanecer", "mundo", "agua"],
            "tiempo": ["mañana", "hoy", "semana", "mes", "año", "día", "noche", "tarde", "hora"],
            "verbos": ["ir", "venir", "comer", "beber", "ver", "leer", "escribir", "hablar", "oír", "comprar", "trabajar", "hacer", "levantar", "acostar", "dormir", "limpiar", "estudiar", "viajar", "jugar", "tirar", "soltar", "conocer"],
            "personas": ["profesor", "maestro", "amigo", "persona", "hombre", "mujer", "nosotros", "vosotros", "ellos", "ellas"],
            "saludos": ["hola", "adiós", "buenos", "buenas", "bienvenido", "hasta luego"],
            "cortesía": ["gracias", "por favor", "disculpe", "perdón", "encantado", "saludar", "cliente"],
            "dinero": ["yen", "yenes", "dinero", "banco", "total", "cuesta"],
            "viajes": ["viaje", "viajar", "corea", "china", "japón"],
            "trabajo": ["trabajo", "trabajar", "empleo"],
            "educación": ["estudiar", "universidad", "estudio"],
            "deportes": ["fútbol", "golf", "deporte"],
            "cuerpo": ["cara", "corazón", "voz"],
            "emociones": ["amor", "gustar"],
            "colores": ["azul", "rojo", "color"],
            "países": ["japón", "corea", "china", "país"],
            "objetos": ["libro", "periódico", "reloj", "sello", "kimono", "abanico", "pila", "bolso", "postal", "muñeca", "palillo", "móvil", "teléfono", "zapato", "papel", "tarjeta", "asiento", "dibujo"],
            "adjetivos": ["grande", "rico", "sabroso", "azul", "rojo"],
            "adverbios": ["pronto", "siempre", "a veces", "normalmente", "generalmente", "de vez en cuando", "a menudo", "frecuentemente", "tarde", "nada", "juntos"],
            "gramática": ["pero", "y", "con", "desde", "hasta", "soy", "eres", "partícula", "posesión"],
            "números": ["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "diecisiete", "veinte", "cuarenta", "setenta", "cien", "mil", "enero", "febrero", "abril", "julio", "noviembre"],
        }

        combined_text = f"{translation} {note}"
        for category, keywords in keyword_map.items():
            for kw in keywords:
                if kw in combined_text:
                    categories_to_assign.add(category)
                    break

        if categories_to_assign:
            categories = [CategoryService.get_or_create(db, name) for name in categories_to_assign]
            word.categories = categories
            assigned_count += 1

    db.commit()
    print(f"Assigned categories to {assigned_count} words.")


if __name__ == "__main__":
    init_db()
    with SessionLocal() as db:
        assign_categories_to_words(db)
