def calculate_adjusted_risk(existing_score, alert_data):
    """
    Calcula un nuevo risk_score con base en el valor existente y las respuestas del profesor.
    """
    print("HOLAAAAAAAAAAAAAA")
    participation_weights = {
        "Alta participación": -5,
        "Participa ocasionalmente": 0,
        "Rara vez participa": 3,
        "No participa": 6
    }

    behavior_weights = {
        "No, todo normal": 0,
        "Le noto más desmotivado o distraído": 3,
        "Presenta actitudes preocupantes": 6,
        "Ha expresado intención de abandonar": 10
    }

    urgency_weights = {
        "Baja": 2,
        "Media": 6,
        "Alta": 10
    }

    delta = (
        participation_weights.get(alert_data.get("participation"), 0)
        + behavior_weights.get(alert_data.get("behavior"), 0)
        + urgency_weights.get(alert_data.get("urgency"), 0)
    )

    new_score = existing_score + delta * 0.5
    new_score = max(0, min(100, new_score))
    print(f"Calculando nuevo riesgo: {existing_score} -> {new_score}")
    return round(new_score, 2)
