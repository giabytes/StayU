import React from "react";

export default function StudentCard({ student, onClick }) {
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
        <span style={{ color: student.risk_level > 0.5 ? "red" : "orange" }}>
          {(student.risk_level * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
