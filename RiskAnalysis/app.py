from flask import Flask, request, jsonify
import requests
from pymongo import MongoClient
from bson import ObjectId
import numpy as np
from flask_cors import CORS
import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression 

app = Flask(__name__)
CORS(app) 

try:
    MODEL = joblib.load('risk_model.pkl')
    print("Modelo de Regresión Lineal Múltiple cargado exitosamente en memoria :))))")
except Exception as e:
    print(f"Error al cargar el modelo: {e}")
    MODEL = None # Si falla, la API no podrá predecir

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
    if MODEL is None:
        return jsonify({"error": "El modelo de riesgo no está cargado. No se puede realizar la predicción."}), 500

     # 1. Obtener todos los registros de la base de datos
    records = list(students_collection.find())
    if not records:
        return jsonify({"error": "No hay registros disponibles para el análisis."}), 400

    # 2. Preparar datos para el modelo ML
    data_for_df = []
    # Lista para mantener los IDs en el mismo orden que las filas del DataFrame
    ids_for_update = [] 
    
    for record in records:
        try:
        # Crear el diccionario de características. Los nombres de las claves deben coincidir 
        # exactamente con los utilizados durante el entrenamiento del modelo.
            features = {
                'average': record['average'],
                'attendance': record['attendance'],
                'amount_due': record['amount_due'],
                'amount_paid': record['amount_paid'],
                # Convertir booleano 'late_payment' a entero 0 o 1
                'late_payment': 1 if record['late_payment'] else 0
            }
            data_for_df.append(features)
            
            # Guardar los IDs necesarios para la actualización posterior
            ids_for_update.append({
                '_id': record['_id'],
                'student_id': record['student_id']
            })
        except KeyError:
            # Si a un registro le faltan campos clave, lo saltamos y lo notificamos
            print(f"Advertencia: Registro con student_id {record.get('student_id', 'desconocido')} omitido por datos incompletos.")
            continue 

    if not data_for_df:
        return jsonify({"error": "No hay registros con datos completos para la predicción ML."}), 400

    df_features = pd.DataFrame(data_for_df)

    # 3. Predecir el puntaje de riesgo usando el modelo cargado
    predicted_risk_scores = MODEL.predict(df_features)

    # 4. Actualizar MongoDB y el servicio de usuario
    # Iterar sobre las predicciones
    for i, score in enumerate(predicted_risk_scores):
        
        record_ids = ids_for_update[i]
        
        # Asegurar que el puntaje sea no negativo (LinearRegression puede dar valores < 0)
        final_score = max(0.0, float(score)) 
        rounded_score = round(final_score, 2)
        
        # A. Actualizar el registro en MongoDB
        students_collection.update_one(
            {"_id": record_ids['_id']},
            {"$set": {"risk_score": rounded_score}}
        )
        
        # B. Enviar el nivel de riesgo al microservicio de usuario
        url_user = "http://localhost:3000/students/" + record_ids['student_id']
        requests.put(url_user, json={"risk_level": rounded_score})

    return jsonify({"mensaje": "Puntajes de riesgo calculados y actualizados con el modelo ML."})



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

@app.route('/risk-analysis/get-record/<student_id>', methods=['GET'])
def get_student_record(student_id):
    """
    Busca y devuelve el registro de un estudiante específico por su ID.
    """
    record = students_collection.find_one({"student_id": student_id})
    if record:
        record.pop("_id", None)
        return jsonify(record)
    else:
        return jsonify({"error": f"No se encontró un registro para el student_id: {student_id}"}), 404


@app.route('/risk-analysis/get-all-records', methods=['GET'])
def get_all_records():
    records = get_records_from_db()
    return jsonify(records)

if __name__ == '__main__':
    app.run(port=5002, debug=True)