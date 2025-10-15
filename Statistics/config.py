# config.py

# 🔗 URI directo del clúster MongoDB (mismo que usas en NestJS y Flask)
MONGO_URI = "mongodb+srv://StayU:5uGz8MahKxt6jMOl@cluster0.2t8eyyc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# 🗄️ Bases de datos dentro del mismo cluster
USERS_DB_NAME = "primerdb"          # <- Aquí reside la colección Student (programa académico)
RISK_DB_NAME = "RiskAnalysisDB"     # <- Aquí están los StudentRecord
STATISTICS_DB_NAME = "Statistics"    # <- Aquí guardaremos los Reports

# 📚 Colecciones específicas
STUDENT_COLLECTION = "Student"            # users module
STUDENT_RECORD_COLLECTION = "StudentRecord"  # risk module
REPORTS_COLLECTION = "Reports"              # statistics module
