// App.jsx

import React, { useEffect, useState } from "react";
import StudentCard from "./components/StudentCard";
import StudentDetail from "./components/StudentDetail";
import ProgramStats from "./components/ProgramStats"; // 🔹 Importar nuevo componente
import "./App.css";

// 🔹 Constantes para las vistas
const VIEW_STUDENTS = "students";
const VIEW_STATS = "stats";

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // Eliminamos programRisk (lo obtiene ProgramStats), pero añadimos la vista
  const [currentView, setCurrentView] = useState(VIEW_STUDENTS); // 🔹 Nuevo estado de vista
  const [statsReport, setStatsReport] = useState(null); // 🔹 Para guardar el reporte completo
  const [selectedProgram, setSelectedProgram] = useState(null); // 🔹 Para el detalle de programa

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Traer estudiantes
        const resStudents = await fetch("http://localhost:3000/students", {
          method: "GET"
        });
        const studentsData = await resStudents.json();

        // 2. Traer records de riesgo (y disparar cálculo si necesario, como estaba)
        const resRecords = await fetch("http://localhost:5002/risk-analysis/calculate-risk", {
          method: "GET"
        });
        await resRecords.json();

        const resUpdated = await fetch("http://localhost:5002/risk-analysis/get-all-records", {
          method: "GET"
        });
        const updatedData = await resUpdated.json();

        // Verifica en consola cómo viene la respuesta
        console.log("Estudiantes DB:", studentsData);
        console.log("Datos riesgo DB:", updatedData);

        // 3. Hacer merge por student_id
        const merged = studentsData.map((student) => {
          const record = updatedData?.updated_data?.find(
            (r) => r.student_id === student.student_id
          );
          // Usamos 'risk_level' de los datos originales o calculados
          const risk = record?.risk_level ?? 0; 
          return {
            ...student,
            risk_level: risk, // Usar risk_level para el StudentCard
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
  avgRisk: Math.round((data.total / data.count)), // convertir a porcentaje
}));

setProgramRisk(programData);

        // NOTA: Se elimina la lógica anterior de cálculo de riesgo por programa
        // porque ahora viene del endpoint /latest
        
      } catch (err) {
        console.error("Error cargando datos", err);
        // Si el reporte falla, intentamos generarlo (opcional, para inicialización)
        // Opcional: Llamar a /generate si /latest falla al inicio
      }
    };

    fetchData();
  }, []);

  // 🔹 Función para cambiar a la vista de estudiantes
  const showStudents = () => {
    setCurrentView(VIEW_STUDENTS);
    setSelectedProgram(null);
  }

  // 🔹 Función para cambiar a la vista de estadísticas
  const showStats = () => {
    setCurrentView(VIEW_STATS);
    setSelectedProgram(null);
  }

  // 🔹 Función para ver el detalle de un programa (usada en ProgramStats)
  const viewProgramDetail = (programData) => {
    setSelectedProgram(programData);
  }


  // --- Renderizado Condicional ---

  let content;
  
  // 1. Detalle del estudiante
  if (selectedStudent) {
    content = (
      <StudentDetail 
        student={selectedStudent} 
        onBack={() => setSelectedStudent(null)} 
      />
    );
  } 
  // 2. Vista de Estadísticas (General o Detalle de Programa)
  else if (currentView === VIEW_STATS) {
    content = (
      <ProgramStats
        report={statsReport}
        onBack={showStudents} // Vuelve a la lista de estudiantes
        selectedProgram={selectedProgram}
        onSelectProgram={viewProgramDetail}
        onBackToGeneral={() => setSelectedProgram(null)} // Vuelve a la general
      />
    );
  }
  // 3. Lista de Estudiantes (vista por defecto)
  else { 
    content = (
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
        {/* Eliminamos la sección program-risk de App.jsx */}
      </div>
    );
  }


  return (
    <div className="app-container">
      <header className="app-header">
        <h1>StayU</h1>
        <div className="nav-buttons">
            <button 
                className={`nav-btn ${currentView === VIEW_STUDENTS ? 'active' : ''}`}
                onClick={showStudents}
            >
                Estudiantes
            </button>
            <button 
                className={`nav-btn ${currentView === VIEW_STATS ? 'active' : ''}`}
                onClick={showStats}
            >
                Estadísticas
            </button>
        </div>
        <input className="search-input" placeholder="Buscar estudiante" />
        <button className="logout-btn">Cerrar sesión</button>
      </header>
      
      {content}

      {/* 🔹 Estilos para los botones de navegación (sugeridos) */}
      <style jsx>{`
        .nav-buttons {
          display: flex;
          gap: 10px;
          margin-left: 20px;
        }
        .nav-btn.active {
          background-color: #646cff;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default App;