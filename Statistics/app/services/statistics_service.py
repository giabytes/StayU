# app/services/statistics_service.py
"""
Servicio de estadísticas: lee primerdb.Student y RiskAnalysisDB.StudentRecord,
construye reporte global por programa y lo guarda en Statistics.Reports.
Comentarios breves al inicio de cada función.
"""

from typing import Dict, List, Any
from collections import defaultdict
from pymongo import DESCENDING

from app.db.mongo_connection import get_risk_db, get_users_db, get_statistics_db
from app.utils.helpers import (
    normalize_risk_to_percentage,
    grade_bucket,
    now_isoutc,
)
from config import (
    STUDENT_COLLECTION,
    STUDENT_RECORD_COLLECTION,
    REPORTS_COLLECTION,
)

# ---------- Helpers internos ----------

def _map_segment_key(seg_short: str) -> str:
    """Mapea 'low'|'medium'|'high' a los nombres descriptivos requeridos."""
    if seg_short == "low":
        return "low_risk"
    if seg_short == "medium":
        return "medium_risk"
    return "high_risk"

def _empty_segment_struct() -> Dict[str, Any]:
    """Estructura base para cada segmento (uso interno)."""
    return {
        "range": "",
        "count": 0,
        "grade_sum": 0.0,    # interno para promedio
        "grade_count": 0,    # interno para promedio
        "avg_grade": None,
        "grade_distribution": {},  # e.g. {"4.3": 5}
        "payments": {"on_time": 0, "late": 0}
    }

def _determine_segment_label_from_pct(pct: float) -> str:
    """Dado un porcentaje normalizado devuelve 'low'|'medium'|'high'."""
    if pct is None:
        return None
    if pct < 30:
        return "low"
    if pct < 50:
        return "medium"
    return "high"

# ---------- Lectura de colecciones ----------

def _read_all_records() -> List[Dict[str, Any]]:
    """Lee todos los documentos de StudentRecord desde RiskAnalysisDB."""
    risk_db = get_risk_db()
    coll = risk_db[STUDENT_RECORD_COLLECTION]
    return list(coll.find({}))

def _read_student_map() -> Dict[str, Dict[str, Any]]:
    """Construye map student_id -> student_doc desde primerdb.Student."""
    users_db = get_users_db()
    coll = users_db[STUDENT_COLLECTION]
    student_map: Dict[str, Dict[str, Any]] = {}
    for s in coll.find({}):
        sid = s.get("student_id")
        if sid is None:
            sid = s.get("_id")
        sid_key = str(sid) if sid is not None else ""
        student_map[sid_key] = s
    return student_map

# ---------- Operaciones sobre Reports (Statistics DB) ----------

def _get_reports_collection():
    """Retorna la colección Reports de la DB Statistics."""
    stats_db = get_statistics_db()
    return stats_db[REPORTS_COLLECTION]

def save_report(report: Dict[str, Any]) -> str:
    """Guarda el reporte en Statistics.Reports y retorna el id insertado (str)."""
    coll = _get_reports_collection()
    res = coll.insert_one(report)
    return str(res.inserted_id)

def get_latest_report() -> Dict[str, Any] or None:
    """Devuelve el último reporte (documento) o None si no existe."""
    coll = _get_reports_collection()
    doc = coll.find_one(sort=[("generated_at", DESCENDING)])
    return doc

def list_reports(limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
    """Lista reportes con paginado simple (orden descendente por fecha)."""
    coll = _get_reports_collection()
    cursor = coll.find().sort("generated_at", DESCENDING).skip(skip).limit(limit)
    return list(cursor)

# ---------- Construcción del reporte global ----------

def build_global_report() -> Dict[str, Any]:
    """
    Construye y devuelve el reporte global:
    - Agrupa StudentRecord por academic_program (leer desde primerdb.Student).
    - Para cada programa calcula rangos low/medium/high con estadisticas pedidas.
    """
    records = _read_all_records()
    student_map = _read_student_map()

    # estructura temporal: program -> segments (low|medium|high)
    programs_temp: Dict[str, Dict[str, Any]] = {}

    # Iterate records and join with student to get academic_program
    for rec in records:
        sid = rec.get("student_id")
        sid_key = str(sid) if sid is not None else ""
        student = student_map.get(sid_key, {})
        program = student.get("academic_program") or "Programa Desconocido"

        # Normalize risk to percentage and determine short segment label
        risk_pct = normalize_risk_to_percentage(rec)
        seg_short = _determine_segment_label_from_pct(risk_pct)

        # grade value (average) and grade bucket string
        grade_val = rec.get("average")
        grade_cat = grade_bucket(grade_val)

        # payment lateness normalization (support new_late_payment etc)
        late_field = rec.get("late_payment")
        if late_field is None:
            late_field = rec.get("new_late_payment", False)
        late_bool = bool(late_field)

        # ensure program exists
        if program not in programs_temp:
            programs_temp[program] = {
                "program": program,
                "total_students": 0,
                "risk_segments": {
                    "low": _empty_segment_struct(),
                    "medium": _empty_segment_struct(),
                    "high": _empty_segment_struct()
                }
            }

        p = programs_temp[program]
        p["total_students"] += 1

        # If risk is undefined, we count in total but skip segment stats
        if seg_short is None:
            continue

        seg_struct = p["risk_segments"][seg_short]
        seg_struct["count"] += 1

        # accumulate grade sum/count for average
        if isinstance(grade_val, (int, float)):
            try:
                seg_struct["grade_sum"] += float(grade_val)
                seg_struct["grade_count"] += 1
            except Exception:
                pass

        # accumulate grade distribution
        seg_struct["grade_distribution"][grade_cat] = seg_struct["grade_distribution"].get(grade_cat, 0) + 1

        # payments
        if late_bool:
            seg_struct["payments"]["late"] += 1
        else:
            seg_struct["payments"]["on_time"] += 1

    # finalize program blocks: compute averages, convert segment keys to descriptive ones
    programs_list: List[Dict[str, Any]] = []
    for prog_name, pdata in programs_temp.items():
        final_segments: Dict[str, Any] = {}
        for short_key, seg_vals in pdata["risk_segments"].items():
            # compute average grade if available
            gcount = seg_vals.get("grade_count", 0)
            if gcount > 0:
                seg_vals["avg_grade"] = round(seg_vals["grade_sum"] / gcount, 2)
            else:
                seg_vals["avg_grade"] = None

            # clean internal fields
            seg_vals.pop("grade_sum", None)
            seg_vals.pop("grade_count", None)

            # set descriptive range string
            if short_key == "low":
                seg_vals["range"] = "0-30%"
            elif short_key == "medium":
                seg_vals["range"] = "30-50%"
            else:
                seg_vals["range"] = "50-100%"

            # map to descriptive key
            final_key = _map_segment_key(short_key)
            final_segments[final_key] = seg_vals

        programs_list.append({
            "program": pdata["program"],
            "total_students": pdata["total_students"],
            "risk_segments": final_segments
        })

    report = {
        "generated_at": now_isoutc(),
        "programs": programs_list
    }
    return report

# ---------- Utility: generate and save report (convenience) ----------

def generate_and_save_report() -> Dict[str, Any]:
    """Genera el reporte global y lo guarda en Statistics.Reports; retorna el documento guardado."""
    report = build_global_report()
    inserted_id = save_report(report)
    report["_id"] = inserted_id
    return report
