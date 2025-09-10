import React, { useEffect, useState } from "react";
import StudentCard from "./components/StudentCard";
import StudentDetail from "./components/StudentDetail";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [programRisk, setProgramRisk] = useState([]); // 🔹 nuevo estado

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Traer estudiantes
        const resStudents = await fetch("http://localhost:3000/students", {
          method: "GET"
        });
        const studentsData = await resStudents.json();

        // 2. Traer records de riesgo
        const resRecords = await fetch("http://localhost:5002/risk-analysis/calculate-risk", {
          method: "GET"
        });
        await resRecords.json(); // dispara el cálculo

        const resUpdated = await fetch("http://localhost:5002/risk-analysis/get-all-records", {
          method: "GET"
        });
        const updatedData = await resUpdated.json();

        // ⚠️ Verifica en consola cómo viene la respuesta
        console.log("Estudiantes DB:", studentsData);
        console.log("Datos riesgo DB:", updatedData);

        // 3. Hacer merge por student_id
        const merged = studentsData.map((student) => {
          const record = updatedData?.updated_data?.find(
            (r) => r.student_id === student.student_id
          );
          return {
            ...student,
            risk_score: record?.risk_score ?? 0,
          };
        });

        setStudents(merged);

        // 4. Calcular riesgo por programa académico
const riskByProgram = {};
merged.forEach((s) => {
  if (!riskByProgram[s.academic_program]) {
    riskByProgram[s.academic_program] = { total: 0, count: 0 };
  }
  riskByProgram[s.academic_program].total += s.risk_level; // sigue en [0,1]
  riskByProgram[s.academic_program].count += 1;
});

// Transformar en array con promedio
const programData = Object.entries(riskByProgram).map(([program, data]) => ({
  program,
  avgRisk: Math.round((data.total / data.count) * 100), // convertir a porcentaje
}));

setProgramRisk(programData);

      } catch (err) {
        console.error("Error cargando datos", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>StayU</h1>
        <input className="search-input" placeholder="Buscar estudiante" />
        <button className="logout-btn">Cerrar sesión</button>
      </header>

      {!selectedStudent ? (
        <div className="main-content">
          <div className="students-list">
            <h2>Estudiantes en riesgo de deserción</h2>
            {students.map((s) => (
              <StudentCard
                key={s.student_id}
                student={s}
                onClick={() => setSelectedStudent(s)}
              />
            ))}
          </div>

          {/* 🔹 Nueva sección */}
          <div className="program-risk">
            <h3>Riesgo de deserción por programa académico</h3>
            <ul>
              {programRisk.map((p, idx) => (
                <li key={idx} className="program-risk-item">
                  <span className="program-name">{p.program}</span>
                  <span className="program-risk-score">{p.avgRisk}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <StudentDetail student={selectedStudent} onBack={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}

export default App;
