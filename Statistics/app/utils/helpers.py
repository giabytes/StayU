from datetime import datetime, timezone
from collections import defaultdict
import math

def now_isoutc():
    return datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()

def normalize_risk_to_percentage(rec):
    """
    Dado un documento record, extrae el riesgo y lo normaliza a porcentaje (0-100).
    Soporta claves 'risk_level' o 'risk_score'.
    Si no existe, devuelve None.
    """
    r = rec.get("risk_score")
    if r is None:
        r = rec.get("risk_score")
    if r is None:
        return None

    try:
        r = float(r)
    except (TypeError, ValueError):
        return None

    # si está en 0-1 lo convertimos
    if 0 <= r <= 1:
        return round(r * 100, 2)
    # si ya es 0-100, lo normalizamos al rango y lo recortamos
    if r > 1 and r <= 100:
        return round(r, 2)

    # si entra cualquier otro valor, limitar a 0..100
    if r < 0:
        return 0.0
    return min(100.0, r)

def risk_segment_label(risk_pct):
    """
    Segmentos:
      low: 0 <= risk < 30
      medium: 30 <= risk < 50
      high: 50 <= risk <= 100
    """
    if risk_pct is None:
        return None
    if risk_pct < 30:
        return "low"
    if risk_pct < 50:
        return "medium"
    return "high"

def grade_bucket(grade):
    """
    Bucket para distribución de calificaciones.
    Redondeamos a un decimal (ej 4.33 -> 4.3).
    Si no hay grade, retornamos 'unknown'.
    """
    if grade is None:
        return "unknown"
    try:
        g = float(grade)
    except (TypeError, ValueError):
        return "unknown"
    # redondeo a 1 decimal
    rounded = math.floor(g * 10 + 0.5) / 10.0
    # formato como string con 1 decimal
    return f"{rounded:.1f}"
