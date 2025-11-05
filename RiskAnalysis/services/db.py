import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

# Obtener la URL desde el .env
MONGO_URL = os.getenv("DATABASE_URL")

if not MONGO_URL:
    raise ValueError(" No se encontró DATABASE_URL en el archivo .env")

# Conectar con MongoDB
client = MongoClient(MONGO_URL)
db = client.get_default_database()  # Usa la BD definida al final de la URL
