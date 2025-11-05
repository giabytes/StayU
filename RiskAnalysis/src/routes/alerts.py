# alerts.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from services.db import db
from services.risk_calculator import calculate_adjusted_risk  # <--- se importa aquí

alerts_bp = Blueprint('alerts', __name__)

alerts_collection = db["ProfessorAlerts"]
students_collection = db["StudentRecord"]

@alerts_bp.route('/alerts', methods=['POST'])
def create_alert():
    try:
        data = request.get_json()

        student_id = data.get("student_id")
        professor_id = data.get("professor_id")
        urgency = data.get("urgency")
        responses = data.get("responses", {})

        if not student_id or not professor_id or not urgency:
            return jsonify({"error": "Faltan campos requeridos"}), 400

        # Guardar la alerta
        alert_doc = {
            "student_id": student_id,
            "professor_id": professor_id,
            "urgency": urgency,
            "responses": responses,
            "created_at": datetime.utcnow()
        }
        alerts_collection.insert_one(alert_doc)

        # Obtener el riesgo actual
        student = students_collection.find_one({"student_id": student_id})
        if not student:
            return jsonify({"error": f"No se encontró el estudiante {student_id}"}), 404

        current_risk = student.get("risk_score", 0)

        # Calcular nuevo riesgo usando risk_calculator
        alert_data = {
            "participation": responses.get("participation"),
            "behavior": responses.get("behavior"),
            "urgency": urgency
        }
        new_risk = calculate_adjusted_risk(current_risk, alert_data)

        # Actualizar en Mongo
        students_collection.update_one(
            {"student_id": student_id},
            {"$set": {"risk_level": new_risk}}
        )

        print(f"Alerta registrada y riesgo actualizado de {current_risk}% → {new_risk}%")

        return jsonify({
            "message": "Alerta creada y riesgo actualizado correctamente",
            "student_id": student_id,
            "new_risk_score": new_risk
        }), 201

    except Exception as e:
        print(f"Error creando alerta: {e}")
        return jsonify({"error": str(e)}), 500
