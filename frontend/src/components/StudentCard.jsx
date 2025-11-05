import React from "react";

export default function StudentCard({ student, onClick }) {
  const getRiskColor = (risk) => {
  if (risk >= 70) return "red";      // alto riesgo
  if (risk >= 40) return "orange";   // medio riesgo
  return "green";                    // bajo riesgo
  };

  return (
    <div className="student-card" onClick={onClick}>
      <img
        src={`https://ui-avatars.com/api/?name=${student.name}&background=random`}
        alt="foto"
        className="student-photo"
      />
      <div className="student-info">
        <h3>{student.name}</h3>
        <p>{student.academic_program}</p>
      </div>
      <div className="risk">
        <span style={{ color: getRiskColor(student.risk_score) }}>
          {(student.risk_score).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
