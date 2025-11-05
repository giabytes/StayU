import React, { useState } from "react";
import AppHeader from "./AppHeader";
import ProfessorAlertForm from "./ProfessorAlertForm";

export default function ProfessorDashboard({ students, onUpdateStudentRisk, logout }) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmedStudent, setConfirmedStudent] = useState(null);

  // Filtrado de estudiantes (case insensitive)
  const filteredStudents = (students || []).filter((s) =>
  s.name?.toLowerCase().includes(search.toLowerCase())
);
console.log("Students disponibles:", students);
  return (
    <div className="professor-dashboard">
      <AppHeader role="Profesor" onLogout={logout} />

      {/* Vista de búsqueda */}
      {!confirmedStudent && (
        <div className="center-container">
          <h2>¡Hola, profesor!</h2>
          <p>Gracias por ayudarnos a orientar a nuestros estudiantes</p>

          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Buscar estudiante por nombre"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedStudent(null);
              }}
              className="search-bar"
            />

            {/*  Dropdown de sugerencias */}
            {search && !selectedStudent && filteredStudents.length > 0 &&  (
              <ul className="dropdown">
                {filteredStudents.map((s) => (
                  <li
                    key={s.student_id}
                    onClick={() => {
                      setSelectedStudent(s);
                      setSearch(s.name);
                    }}
                  >
                    {s.name} — {s.academic_program}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Botón para confirmar selección */}
          {selectedStudent && (
            <button
              className="continue-btn"
              onClick={() => setConfirmedStudent(selectedStudent)}
            >
              Continuar
            </button>
          )}
        </div>
      )}

      {/* Vista del formulario */}
      {confirmedStudent && (
        <ProfessorAlertForm
          student={confirmedStudent}
          onBack={() => {
            setConfirmedStudent(null);
            setSelectedStudent(null);
            setSearch("");
          }}
          onSubmit={(formData) => {
            console.log("Formulario enviado:", formData);
            onUpdateStudentRisk(confirmedStudent.student_id, formData);
            setConfirmedStudent(null);
            setSelectedStudent(null);
            setSearch("");
          }}
        />
      )}

      <style>{`
        .professor-dashboard {
          font-family: "Inter", sans-serif;
          padding: 0;
          overflow-x: hidden;
        }

        .center-container {
          max-width: 600px;
          margin: 150px auto;
          text-align: center;
          padding: 50px 40px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 20px rgba(62, 76, 76, 0.49);
          position: relative;
          z-index: 1;
        }

        .search-wrapper {
          position: relative;
          width: 100%;
        }

        .search-bar {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #001286ff;
          font-size: 16px;
        }

        /* Asegura que la lista se vea encima */
        .dropdown {
          position: absolute;
          top: 105%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ccc;
          border-radius: 6px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 9999;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .dropdown li {
          padding: 8px 12px;
          cursor: pointer;
        }

        .dropdown li:hover {
          background-color: #f0f0f0;
        }

        .continue-btn {
          margin-top: 20px;
          padding: 10px 16px;
          background-color: #0008a1ff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .continue-btn:hover {
          background-color: #000ed5ff;
        }
      `}</style>
    </div>
  );
}
