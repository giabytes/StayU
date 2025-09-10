from flask import Flask, request, jsonify
import random

app = Flask(__name__)

@app.route('/api/university', methods=['POST'])
def process_data():
    students_data = request.json
    processed_students = []

    for student in students_data:
        student_id = student.get("student_id")
        average = student.get("average")
        attendance = student.get("attendance")
        
        # Simulación de promedio
        if average < 3.0: 
            change = random.uniform(-0.5, 0.3)
        elif average > 4.0: 
            change = random.uniform(-0.3, 0.2)
        else:
            change = random.uniform(-0.4, 0.4)

        new_average = max(0.0, min(5.0, average + change))

        # Simulación de asistencia
        if attendance < 70:
            change_attendance = random.uniform(-15, 10)
        else:
            change_attendance = random.uniform(-10, 10)

        new_attendance = max(0, min(100, attendance + change_attendance))
        
        processed_students.append({
            "student_id": student_id,
            "new_average": round(new_average, 2),
            "new_attendance": round(new_attendance, 2)
        })
    
    return jsonify(processed_students)
        
if __name__=='__main__':
    app.run(port=5000, debug=True)