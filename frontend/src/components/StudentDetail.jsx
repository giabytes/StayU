import React from "react";

export default function StudentDetail({ student, onBack }) {
  return (
    <div className="student-detail">
      <button className="back-btn" onClick={onBack}>← Volver</button>
      <div className="detail-card">
        <div className="detail-info">
          <h2>{student.name}</h2>
          <p><strong>Programa académico:</strong> {student.academic_program}</p>
          <p><strong>Fecha de nacimiento:</strong> {student.birth_date}</p>
          <p><strong>Cédula:</strong> {student.citizen_id}</p>
          <p><strong>Correo:</strong> {student.email}</p>
          <p><strong>Celular:</strong> {student.phone_number}</p>
          <p className="risk-text">
            Riesgo de deserción:{" "}
            <span style={{ color: student.risk_level > 0.5 ? "red" : "orange" }}>
              {(student.risk_level * 100).toFixed(0)}%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
