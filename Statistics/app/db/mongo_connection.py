# app/db/mongo_connection.py

from pymongo import MongoClient
from config import (
    MONGO_URI,
    USERS_DB_NAME,
    RISK_DB_NAME,
    STATISTICS_DB_NAME
)

#ÚNICA conexión al clúster
_client = MongoClient(MONGO_URI)


# Base de datos del Módulo Users (programa académico)
def get_users_db():
    return _client[USERS_DB_NAME]


# Base del Módulo RiskAnalysis (StudentRecord con riesgo, notas, pagos)
def get_risk_db():
    return _client[RISK_DB_NAME]


# Base del Microservicio Statistics (para Reports históricos)
def get_statistics_db():
    return _client[STATISTICS_DB_NAME]
