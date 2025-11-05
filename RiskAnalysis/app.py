# app.py
from flask import Flask, request, jsonify
import requests
from pymongo import MongoClient
import pandas as pd
from flask_cors import CORS
import joblib
from src.routes.alerts import alerts_bp  # Importar blueprint
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "OPTIONS"])

# -------------------------------
# Cargar modelo de riesgo
# -------------------------------
try:
    MODEL = joblib.load('risk_model.pkl')
    print("Modelo de Regresión Lineal Múltiple cargado exitosamente en memoria :))))")
except Exception as e:
    print(f"Error al cargar el modelo: {e}")
    MODEL = None  # Si falla, la API no podrá predecir

# -------------------------------
# Conexión a MongoDB Atlas
# -------------------------------
MONGO_URI = "mongodb+srv://StayU:5uGz8MahKxt6jMOl@cluster0.2t8eyyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["RiskAnalysisDB"]          
students_collection = db["StudentRecord"]

# -------------------------------
# Funciones internas
# -------------------------------
def get_records_from_db():
    records = list(students_collection.find())
    for record in records:
        record.pop("_id", None)
    return records

def calculate_risk_score():
    if MODEL is None:
        return jsonify({"error": "El modelo de riesgo no está cargado. No se puede realizar la predicción."}), 500

    records = list(students_collection.find())
    if not records:
        return jsonify({"error": "No hay registros disponibles para el análisis."}), 400

    data_for_df = []
    ids_for_update = []

    for record in records:
        try:
            features = {
                'average': record['average'],
                'attendance': record['attendance'],
                'amount_due': record['amount_due'],
                'amount_paid': record['amount_paid'],
                'late_payment': 1 if record['late_payment'] else 0
            }
            data_for_df.append(features)
            ids_for_update.append({
                '_id': record['_id'],
                'student_id': record['student_id']
            })
        except KeyError:
            print(f"Advertencia: Registro con student_id {record.get('student_id', 'desconocido')} omitido por datos incompletos.")
            continue

    if not data_for_df:
        return jsonify({"error": "No hay registros con datos completos para la predicción ML."}), 400

    df_features = pd.DataFrame(data_for_df)
    predicted_risk_scores = MODEL.predict(df_features)

    for i, score in enumerate(predicted_risk_scores):
        record_ids = ids_for_update[i]
        final_score = max(0.0, float(score))
        rounded_score = round(final_score, 2)

        # Actualizar Mongo
        students_collection.update_one(
            {"_id": record_ids['_id']},
            {"$set": {"risk_score": rounded_score}}
        )

        # Enviar al microservicio de usuario
        url_user = f"http://localhost:3000/students/{record_ids['student_id']}"
        try:
            requests.put(url_user, json={"risk_score": rounded_score})
        except:
            print(f"No se pudo actualizar riesgo para {record_ids['student_id']} en microservicio de usuario.")

    return jsonify({"mensaje": "Puntajes de riesgo calculados y actualizados con el modelo ML."})

# -------------------------------
# Endpoints principales
# -------------------------------
@app.route('/risk-analysis/update-data-and-risk', methods=['GET'])
def update_data_and_risk():
    records = get_records_from_db()
    if not records:
        return jsonify({"error": "No hay registros disponibles para análisis"}), 400

    try:
        url_academic = "http://localhost:5000/api/university"
        updated_data_academic = requests.post(url_academic, json=records).json()

        url_payment = "http://localhost:5001/api/payment"
        updated_data_payment = requests.post(url_payment, json=records).json()
    except Exception as e:
        return jsonify({"error": f"No se pudieron enviar datos a los microservicios: {e}"}), 500

    updated_data = []
    for acad, pay in zip(updated_data_academic, updated_data_payment):
        combined_record = {**acad, **pay}
        updated_data.append(combined_record)

        student_id = combined_record.get("student_id")
        if student_id:
            record = {
                "student_id": student_id,
                "amount_due": combined_record.get("new_amount_due"),
                "amount_paid": combined_record.get("new_amount_paid"),
                "late_payment": combined_record.get("new_late_payment"),
                "average": combined_record.get("new_average"),
                "attendance": combined_record.get("new_attendance")
            }
            students_collection.update_one({"student_id": student_id}, {"$set": record})

    calculate_risk_score()
    return jsonify({"mensaje": "Datos enviados y actualizados con éxito", "updated_data": updated_data})

@app.route('/risk-analysis/create-record', methods=['POST'])
def create_or_update_record():
    data = request.json
    student_id = data.get("student_id")
    if not student_id:
        return jsonify({"error": "student_id es requerido"}), 400

    record = {
        "student_id": student_id,
        "average": data.get("average"),
        "attendance": data.get("attendance"),
        "amount_due": data.get("amount_due", 0.0),
        "amount_paid": data.get("amount_paid", 0.0),
        "late_payment": data.get("late_payment", False),
        "risk_score": data.get("risk_score")
    }

    students_collection.update_one({"student_id": student_id}, {"$set": record}, upsert=True)
    return jsonify({"mensaje": "Registro guardado/actualizado con éxito"})

@app.route('/risk-analysis/calculate-risk', methods=['GET'])
def calculate_risk():
    return calculate_risk_score()

@app.route('/risk-analysis/get-record/<student_id>', methods=['GET'])
def get_student_record(student_id):
    record = students_collection.find_one({"student_id": student_id})
    if record:
        record.pop("_id", None)
        return jsonify(record)
    return jsonify({"error": f"No se encontró un registro para el student_id: {student_id}"}), 404

@app.route('/risk-analysis/get-all-records', methods=['GET'])
def get_all_records():
    return jsonify(get_records_from_db())

# -------------------------------
# Registrar blueprint alerts con url_prefix
# -------------------------------
app.register_blueprint(alerts_bp, url_prefix='/alerts', strict_slashes=False)

# -------------------------------
# Ejecutar aplicación
# -------------------------------
if __name__ == '__main__':
    with app.app_context():
        print("Calculando riesgo inicial para todos los estudiantes...")
        calculate_risk_score()
    print("Rutas registradas en Flask:")
    for rule in app.url_map.iter_rules():
        print(rule)
    app.run(port=5002, debug=True)
