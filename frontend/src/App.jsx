// App.jsx
import { BrowserRouter as Router } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import StudentCard from "./components/StudentCard";
import StudentDetail from "./components/StudentDetail";
import ProgramStats from "./components/ProgramStats";
import { apiFetch } from "./utils/api";
import "./App.css";
import AppHeader from "./components/AppHeader";
import ProfessorDashboard from "./components/ProfessorDashboard";
import RiskByCareer from "./components/RiskByCareer";

const VIEW_STUDENTS = "students";
const VIEW_STATS = "stats";

function App() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentView, setCurrentView] = useState(VIEW_STUDENTS);
  const [statsReport, setStatsReport] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [search, setSearch] = useState("");

  // 🔹 Función para traer estudiantes y sus registros de riesgo
  const fetchStudents = async () => {
    try {
      // Traer información básica
      const studentsData = await apiFetch("http://localhost:3000/students");
      // Traer registros de riesgo
      const records = await apiFetch("http://localhost:5002/risk-analysis/get-all-records");

      // Combinar info de estudiantes con riesgo
      const merged = studentsData.map((student) => {
        const record = records?.find(r => String(r.student_id) === String(student.student_id));
        const risk = record ? parseFloat(String(record.risk_score)) : 0;
        return { ...student, risk_score: risk };
      });

      // Ordenar por riesgo descendente
      merged.sort((a, b) => b.risk_score - a.risk_score);
      setStudents(merged);

      // Generar reporte por programa
      const programs = {};
      merged.forEach((s) => {
        const program = s.academic_program || "Sin programa";
        if (!programs[program]) programs[program] = { total: 0, count: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 };
        programs[program].total += s.risk_score || 0;
        programs[program].count++;
        const risk = s.risk_score || 0;
        if (risk >= 70) programs[program].highRisk++;
        else if (risk >= 40) programs[program].mediumRisk++;
        else programs[program].lowRisk++;
      });

      const programReport = Object.entries(programs).map(([program, data]) => ({
        program,
        avgRisk: Number((data.total / data.count).toFixed(2)),
        highRisk: data.highRisk,
        mediumRisk: data.mediumRisk,
        lowRisk: data.lowRisk,
      }));

      setStatsReport({ generated_at: new Date().toISOString(), programs: programReport });
    } catch (err) {
      console.error("Error cargando datos", err);
    }
  };

  // 🔹 Cargar usuario guardado si ya inició sesión
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (storedToken && storedRole) {
      setUser({ role: storedRole });
    }
  }, []);

  // 🔹 Cargar estudiantes según rol
  useEffect(() => {
    if (!user) return;

    if (user.role === "WELLBEING_STAFF") {
      // Traer datos inicialmente
      fetchStudents();

      // Polling cada 5 segundos
      const interval = setInterval(() => {
        fetchStudents();
      }, 5000);

      return () => clearInterval(interval);
    } else if (user.role === "PROFESSOR") {
      // Para profesores, solo cargar una vez al montar
      fetchStudents();
    }
  }, [user]);

  // 🔹 Filtrado por búsqueda (para staff y profesor)
  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  // 🔹 Renderizar vistas
  if (!user) return <Login onLogin={setUser} />;

  if (user.role === "ACADEMIC_COORDINATOR") {
    return (
      <>
        <AppHeader role="Coordinador" onLogout={logout} />
        <div className="app-container">
          <ProgramStats
            report={statsReport}
            selectedProgram={selectedProgram}
            onSelectProgram={setSelectedProgram}
            onBackToGeneral={() => setSelectedProgram(null)}
          />
        </div>
      </>
    );
  }

  if (user.role === "WELLBEING_STAFF") {
    if (selectedStudent) {
      return (
        <>
          <AppHeader
            role="Staff de Bienestar"
            searchValue={search}
            onSearchChange={setSearch}
            onLogout={logout}
          />
          <div className="app-container">
            <StudentDetail
              student={selectedStudent}
              onBack={() => setSelectedStudent(null)}
            />
          </div>
        </>
      );
    }

    return (
      <>
        <AppHeader
          role="Staff de Bienestar"
          searchValue={search}
          onSearchChange={setSearch}
          onLogout={logout}
        />
        <div className="app-container">
          <div className="main-content">
            <div className="students-list">
              <h2>Estudiantes en riesgo de deserción</h2>
              {filteredStudents.map((s) => (
                <StudentCard
                  key={s.student_id}
                  student={s}
                  onClick={() => setSelectedStudent(s)}
                />
              ))}
            </div>

            <div className="program-risk-panel">
              <RiskByCareer data={statsReport?.programs} />
            </div>
          </div>

          <style>{`
            .main-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 30px;
            }
            .students-list {
              flex: 3;
            }
            .program-risk-panel {
              flex: 1;
            }
          `}</style>
        </div>
      </>
    );
  }

  if (user.role === "PROFESSOR") {
    return (
      <>
        <AppHeader role="Profesor" onLogout={logout} />
        <div className="app-container">
          <ProfessorDashboard
            students={students}
            logout={logout}
            onUpdateStudentRisk={(studentId, data) => {
              console.log("Actualizar riesgo:", studentId, data);
            }}
          />
        </div>
      </>
    );
  }

  return null;
}

export default App;
