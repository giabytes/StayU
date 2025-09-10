from flask import Flask, request, jsonify
import requests
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

app = Flask(__name__)

# Conexión a MongoDB Atlas
MONGO_URI = "mongodb+srv://StayU:5uGz8MahKxt6jMOl@cluster0.2t8eyyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)

# Base de datos y colección
db = client["RiskAnalysisDB"]         # Nombre de la base de datos
students_collection = db["StudentRecord"]  # Nombre de la colección

def get_records_from_db():
    # Cargar datos desde MongoDB
    records = list(students_collection.find())
    for record in records:
        record.pop("_id", None)  # Elimina _id si existe
    return records

def calculate_risk_score():
    # Cargar datos desde MongoDB
    # Usar heurística simple para calcular riesgo
    records = list(students_collection.find())
    if not records:
        return jsonify({"error": "No hay registros disponibles para analisis"}), 400

    for record in records:
        risk_score = 0
        # Riesgo académico
        if record.get("average", 0) < 3.0:
            risk_score += 0.3
        elif record.get("average", 0) < 4.0:
            risk_score += 0.2
        
        # Riesgo de asistencia
        if record.get("attendance", 100) < 75:
            risk_score += 0.3
        elif record.get("attendance", 100) < 90:
            risk_score += 0.1
        
        # Riesgo financiero
        if record.get("amount_due", 0) > record.get("amount_paid", 0):
            risk_score += 0.2
        
        if record.get("late_payment", False):
            risk_score += 0.2
        
        # Normalizamos a máximo 1
        risk_score = min(risk_score, 1.0)
        
        # Actualizar el registro con el nivel de riesgo
        students_collection.update_one(
            {"_id": ObjectId(record["_id"])},
            {"$set": {"risk_score": risk_score}}
        )
    return jsonify({"mensaje": "Puntajes de riesgo calculados y actualizados con exito"})

@app.route('/risk-analysis/update-data-and-risk', methods=['GET'])
def update_data_and_risk():
    records = get_records_from_db()

    if not records:
        return jsonify({"error": "No hay registros disponibles para analisis"}), 400

    # Enviar datos al microservicio "AcademicPlatform"
    url_academic = "http://localhost:5000/api/university"
    response_academic = requests.post(url_academic, json=records)

    # Enviar datos al microservicio "PaymentPlatform"
    url_payment = "http://localhost:5001/api/payment"
    response_payment = requests.post(url_payment, json=records)

    # Manejo de respuesta
    if response_academic.status_code == 200 and response_payment.status_code == 200:
        updated_data_academic = response_academic.json()
        updated_data_payment = response_payment.json()

        # Combinar los datos actualizados
        updated_data = []
        for acad, pay in zip(updated_data_academic, updated_data_payment):
            combined_record = {**acad, **pay}
            updated_data.append(combined_record)

        # Actualizar registros en MongoDB
        for updated_record in updated_data:
            student_id = updated_record.get("student_id")
            if student_id:

                record = {
                    "student_id": student_id,
                    "amount_due": updated_record.get("new_amount_due"),
                    "amount_paid": updated_record.get("new_amount_paid"),
                    "late_payment": updated_record.get("new_late_payment"),
                    "average": updated_record.get("new_average"),
                    "attendance": updated_record.get("new_attendance")
                    }

                students_collection.update_one(
                    {"student_id": student_id},
                    {"$set": record}
                )

        calculate_risk_score()
        return jsonify({
            "mensaje": "Datos enviados y actualizados con exito",
            "updated_data": updated_data
        })

    else:
        return jsonify({
            "error": "No se pudieron actualizar los datos con exito"
        }), 500

@app.route('/risk-analysis/create-record', methods=['POST'])
def create_or_update_record():
    data = request.json
    student_id = data.get("student_id")

    if not student_id:
        return jsonify({"error": "student_id es requerido"}), 400

    # Construimos el documento
    record = {
        "student_id": student_id,
        "average": data.get("average"),
        "attendance": data.get("attendance"),
        "amount_due": data.get("amount_due", 0.0),
        "amount_paid": data.get("amount_paid", 0.0),
        "late_payment": data.get("late_payment", False),
        "risk_score": data.get("risk_score")
    }

    # Upsert (si ya existe actualiza, si no existe crea)
    result = students_collection.update_one(
        {"student_id": student_id},
        {"$set": record},
        upsert=True
    )

    return jsonify({"mensaje": "Registro guardado/actualizado con exito"})

@app.route('/risk-analysis/calculate-risk', methods=['GET'])
def calculate_risk():
    return calculate_risk_score()

if __name__ == '__main__':
    app.run(port=5002, debug=True)