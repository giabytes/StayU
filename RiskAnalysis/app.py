from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/risk', methods=['POST'])
def analysis():
    data = request.json
    student_id = data.get("id")
    average = data.get("average")
    attendance = data.get("attendance")
    
    #Enviar datos al microservicio "AcademicPlatform"
    url = "http://localhost:5000/api/university"
    response = requests.post(url, json={
        "id": student_id,
        "average": average,
        "attendance": attendance
    })
    
    if response.status_code == 200:
        updated_data = response.json()
        #Por ahora, solo devolvemos lo que nos manda el otro microservicio
        return jsonify({
            "mensaje": "Datos analizados con éxito",
            "updated_data": updated_data
        })
    else:
        return jsonify({"error": "No se pudo conectar con plataforma académica"}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)