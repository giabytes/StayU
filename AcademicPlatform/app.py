from flask import Flask, request, jsonify
import random

app = Flask(__name__)

@app.route('/api/university', methods=['POST'])
def process_data():
    data = request.json
    student_id = data.get("id")
    average = data.get("average")
    attendance = data.get("attendance")
    
    #Simulación de promedio
    if average < 3.0:  #Estudiante en riesgo
        change = random.uniform(-0.5, 0.3)  #Más probabilidad de bajar
    elif average > 4.0: 
        change = random.uniform(-0.3, 0.2)  #Puede bajar un poco o mejorar poquito
    else:
        change = random.uniform(-0.4, 0.4)  #Normal

    new_average = max(0.0, min(5.0, average + change))  #Para controlar límites

    #Simulación de asistencia
    if attendance < 70:
        change_attendance = random.uniform(-15, 10)  #Más probabilidad de bajar
    else:
        change_attendance = random.uniform(-10, 10)  #Normal

    new_attendance = max(0, min(100, attendance + change_attendance))
    
    return jsonify({
        "id": student_id,
        "new_average": round(new_average, 2),
        "new_attendance": new_attendance
    })
        
if __name__=='__main__':
    app.run(port=5000, debug=True)
    