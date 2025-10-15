from flask import Blueprint, jsonify, request
from app.services.statistics_service import (
    build_global_report,
    save_report,
    get_latest_report,
    list_reports
)

statistics_bp = Blueprint("statistics", __name__)

@statistics_bp.route("/generate", methods=["GET"])
def generate_report():
    """
    Genera el reporte global y lo guarda en Statistics.Reports.
    """
    report = build_global_report()

    # add ranges labels per segment
    for p in report["programs"]:
        segs = p["risk_segments"]
        segs["low_risk"]["range"] = "0-30%"
        segs["medium_risk"]["range"] = "30-50%"
        segs["high_risk"]["range"] = "50-100%"

    inserted_id = save_report(report)
    report["_id"] = str(inserted_id)
    return jsonify({"message": "report generated", "report": report}), 201

@statistics_bp.route("/notify-risk-updated", methods=["POST"])
def notify_and_generate():
    """
    Hook que puede llamar RiskAnalysis cada vez que actualice los riesgos.
    Opcionalmente puede enviar un body sencillo; ignoramos su contenido y regeneramos.
    """
    report = build_global_report()

    for p in report["programs"]:
        segs = p["risk_segments"]
        segs["low_risk"]["range"] = "0-30%"
        segs["medium_risk"]["range"] = "30-50%"
        segs["high_risk"]["range"] = "50-100%"

    inserted_id = save_report(report)
    report["_id"] = str(inserted_id)
    return jsonify({"message": "report generated via hook", "report_id": str(inserted_id)}), 201

@statistics_bp.route("/latest", methods=["GET"])
def latest():
    doc = get_latest_report()
    if not doc:
        return jsonify({"error": "no reports found"}), 404
    # convert _id to str for JSON
    doc["_id"] = str(doc["_id"])
    return jsonify(doc), 200

@statistics_bp.route("/history", methods=["GET"])
def history():
    # simple pagination: ?limit=20&skip=0
    try:
        limit = int(request.args.get("limit", 50))
        skip = int(request.args.get("skip", 0))
    except ValueError:
        return jsonify({"error": "invalid pagination params"}), 400

    docs = list_reports(limit=limit, skip=skip)
    # convert ids
    for d in docs:
        d["_id"] = str(d["_id"])
    return jsonify({"reports": docs}), 200

@statistics_bp.route("/program/<program_name>", methods=["GET"])
def program_detail(program_name):
    """
    Extrae del último reporte el bloque del programa solicitado.
    """
    doc = get_latest_report()
    if not doc:
        return jsonify({"error": "no reports found"}), 404

    for p in doc.get("programs", []):
        if p.get("program", "").lower() == program_name.lower():
            return jsonify(p), 200

    return jsonify({"error": "program not found in latest report"}), 404
