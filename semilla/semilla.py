from pymongo import MongoClient
from faker import Faker
import random

def generate_student():
    fake = Faker('es_CO')
    fake.unique.clear()
    
    # Parámetros base
    matricula_promedio = 6000000  # valor promedio matrícula en universidad privada de Medellín (COP)
    desviacion_matricula = 1000000
    
    num_students = 150
    students = []
    records = []

    for i in range(num_students):
        # ---- STUDENTS ----
        student = {
            "student_id": str(i+1),
            "email": fake.unique.email(),
            "name": fake.name(),
            "role": "STUDENT",
            "academic_program": random.choice([
                "Ingeniería de Sistemas",
                "Administración de Empresas",
                "Diseño Gráfico",
                "Ingeniería Industrial",
                "Psicología",
                "Comunicación Social",
                "Economía",
                "Diseño Interactivo",
                "Negocios Internacionales",
                "Ingeniería Matemática",
                "Ingeniería Física",
                "Ciencias Políticas",
                "Ingeniería de Diseño de Producto",
                "Ingeniería Civil",
                "Mercadeo",
                "Finanzas",
                "Derecho",
                "Biología"
            ]),
            "birth_date": str(fake.date_of_birth(minimum_age=18, maximum_age=30).isoformat()),
            "citizen_id": str(fake.unique.random_int(min=10000000, max=99999999)),
            "phone_number": str(fake.phone_number()),
            "risk_score": 0.0
        }
        students.append(student)
        
        # ---STUDENT RECORD----
        # ---- ASISTENCIA ----
        # Mayoría de estudiantes asisten bien (0.75 - 1.0)
        if random.random() < 0.85:
            attendance = round(random.uniform(0.75, 1.0), 2)
        else:
            attendance = round(random.uniform(0.4, 0.75), 2)

        # ---- PROMEDIO ----
        # Mayor probabilidad de estar entre 3.0 y 4.5
        if random.random() < 0.85:
            average = round(random.uniform(3.0, 4.5) * (0.85 + 0.15 * attendance), 2)
        else:
            average = round(random.uniform(1.5, 3.0) * (0.85 + 0.15 * attendance), 2)
        average = min(5, max(0, average))  # mantener dentro del rango 0–5

        # ---- DATOS FINANCIEROS ----
        total_matricula = round(random.normalvariate(matricula_promedio, desviacion_matricula))
        
        # 75% de los estudiantes ya pagaron toda la matrícula
        if random.random() < 0.75:
            amount_paid = total_matricula
        else:
            amount_paid = round(random.uniform(total_matricula * 0.4, total_matricula * 0.95), -3)
        
        amount_due = max(0, total_matricula - amount_paid)
        
        record = {
            "student_id": student["student_id"],
            "amount_due": amount_due,
            "amount_paid": amount_paid,
            "attendance": attendance,
            "average": average,
            "late_payment": random.choice([True, False]),
            "risk_score": 0.0
        }
        records.append(record)
        
    return [students, records]
        

#data = generate_student()
#print(data[0][:5])
#print(data[1][:5])

def data_seed():
    MONGO_URI = "mongodb+srv://StayU:5uGz8MahKxt6jMOl@cluster0.2t8eyyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(MONGO_URI)

    # Base de datos y colección
    db = client["RiskAnalysisDB"]         # Nombre de la base de datos
    record_collection = db["StudentRecord"]  # Nombre de la colección
    db2 = client["primerdb"]
    students_collection = db2["Student"]
    
    students_collection.delete_many({})
    record_collection.delete_many({})
    
    #if record_collection.count_documents({}) == 0:
    data = generate_student()
    students_collection.insert_many(data[0])
    record_collection.insert_many(data[1])
    print(f"Se insertaron los estudiantes en MongoDB.")


data_seed()