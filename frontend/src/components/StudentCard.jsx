import React from "react";

export default function StudentCard({ student, onClick }) {
  const getRiskColor = (risk) => {
    if (risk >= 0 && risk < 30.0) return "green";
    if (risk >= 30.0 && risk < 50.0) return "orange";
    if (risk >= 50.0 && risk <= 100) return "red";
    return "black";
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
        <span style={{ color: getRiskColor(student.risk_level) }}>
          {(student.risk_level).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
