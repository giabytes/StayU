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

  // Cargar usuario guardado si ya inició sesión
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (storedToken && storedRole) {
      setUser({ role: storedRole });
    }
  }, []);

  // Traer datos solo si el usuario es staff de bienestar
  useEffect(() => {
    if (user?.role === "WELLBEING_STAFF" || user?.role === "ACADEMIC_COORDINATOR" || user?.role === "PROFESSOR") {
      const fetchData = async () => {
        try {
          const studentsData = await apiFetch("http://localhost:3000/students");
          const records = await apiFetch("http://localhost:5002/risk-analysis/get-all-records");

          const merged = studentsData.map((student) => {
            const record = records?.updated_data?.find(
              (r) => r.student_id === student.student_id
            );
          
            const risk = record
              ? parseFloat(String(record.risk_score).replace(",", "."))
              : 0;
          console.log("App.jsx - estudiantes cargados:", students);

          return {
            ...student, risk_score: risk ?? 0,
          };
        });

          // Ordenamos de mayor a menor riesgo
          merged.sort((a, b) => b.risk_score - a.risk_score);

          setStudents(merged);
          const programs = {};
          merged.forEach((s) => {
            const program = s.academic_program || "Sin programa";
            if (!programs[program]) {
              programs[program] = {
                total: 0,
                count: 0,
                highRisk: 0,
                mediumRisk: 0,
                lowRisk: 0,
              };
            }
            programs[program].total += s.risk_score || s.risk_score || 0;
            programs[program].count++;

            // Clasificación por nivel
            const risk = s.risk_score || s.risk_score || 0;
            if (risk >= 70) programs[program].highRisk++;
            else if (risk >= 40) programs[program].mediumRisk++;
            else programs[program].lowRisk++;
          })

          // Generar array de salida
          const programReport = Object.entries(programs).map(([program, data]) => ({
            program,
            avgRisk: Number((data.total / data.count).toFixed(2)),
            highRisk: data.highRisk,
            mediumRisk: data.mediumRisk,
            lowRisk: data.lowRisk,
          }));

          // Guardar en estado
          setStatsReport({
          generated_at: new Date().toISOString(),
          programs: programReport
          });
          console.log("Reporte por programa:", programReport);
        } catch (err) {
          console.error("Error cargando datos", err);
        }
      };

      fetchData();
    }
  }, [user])

  // Filtrado por búsqueda sobre el array ya ordenado
  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  //  Si no hay login → pantalla de login
  if (!user) return <Login onLogin={setUser} />;

  //  Vista del Coordinador (solo estadísticas)
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

  //  Vista del Staff de Bienestar (lista de estudiantes)
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

  //  Vista del Profesor (por ahora sin funcionalidad)
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
