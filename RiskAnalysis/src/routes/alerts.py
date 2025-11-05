# alerts.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from flask_cors import cross_origin
from services.db import db
from services.risk_calculator import calculate_adjusted_risk

alerts_bp = Blueprint('alerts', __name__)

alerts_collection = db["ProfessorAlerts"]
students_collection = db["StudentRecord"]

@alerts_bp.route('', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_alert():
    if request.method == "OPTIONS":
        response = jsonify({"status": "preflight ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200

    try:
        print("Paso 0 - Entrando al endpoint /alerts")
        data = request.get_json()
        print("Paso 1 - Datos recibidos:", data)

        student_id = data.get("student_id")
        professor_id = data.get("professor_id")
        urgency = data.get("urgency")
        responses = data.get("responses", {})

        if not student_id or not professor_id or not urgency:
            print("Paso 1a - Faltan campos requeridos")
            return jsonify({"error": "Faltan campos requeridos"}), 400

        # Guardar alerta en Mongo
        try:
            print("Paso 2 - Guardando alerta en Mongo")
            alert_doc = {
                "student_id": student_id,
                "professor_id": professor_id,
                "urgency": urgency,
                "responses": responses,
                "created_at": datetime.utcnow()
            }
            alerts_collection.insert_one(alert_doc)
            print("Paso 2b - Alerta guardada exitosamente")
        except Exception as e:
            print(f"Error en Paso 2 - insert alerta: {e}")
            return jsonify({"error": f"Error guardando alerta: {e}"}), 500

        # Actualizar riesgo del estudiante
        try:
            print("Paso 3 - Buscando estudiante en DB")
            student = students_collection.find_one({"student_id": student_id})
            if not student:
                print(f"Paso 3a - Estudiante no encontrado: {student_id}")
                return jsonify({"error": f"No se encontró el estudiante {student_id}"}), 404
            print("Paso 3b - Estudiante encontrado:", student)
        except Exception as e:
            print(f"Error en Paso 3 - find estudiante: {e}")
            print("Colecciones disponibles:", db.list_collection_names())
            return jsonify({"error": f"Error buscando estudiante: {e}"}), 500

        current_risk = student.get("risk_score", 0)
        alert_data = {
            "participation": responses.get("participation"),
            "behavior": responses.get("behavior"),
            "urgency": urgency
        }

        try:
            print("Paso 4 - Calculando nuevo riesgo")
            new_risk = calculate_adjusted_risk(current_risk, alert_data)
            print(f"Paso 4b - Nuevo riesgo calculado: {new_risk}")
        except Exception as e:
            print(f"Error en Paso 4 - calcular riesgo: {e}")
            return jsonify({"error": f"Error calculando riesgo: {e}"}), 500

        try:
            print("Paso 5 - Actualizando riesgo en DB")
            students_collection.update_one(
                {"student_id": student_id},
                {"$set": {"risk_score": new_risk}}
            )
            print(f"Paso 5b - Riesgo actualizado de {current_risk}% → {new_risk}%")
        except Exception as e:
            print(f"Error en Paso 5 - update riesgo: {e}")
            return jsonify({"error": f"Error actualizando riesgo: {e}"}), 500

        print("Paso 6 - Retornando respuesta exitosa")
        return jsonify({
            "message": "Alerta creada y riesgo actualizado correctamente",
            "student_id": student_id,
            "new_risk_score": new_risk
        }), 201

    except Exception as e:
        print(f"Error general creando alerta: {e}")
        return jsonify({"error": str(e)}), 500
