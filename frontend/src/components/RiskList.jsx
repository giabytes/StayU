import React from "react";

export default function RiskList({ students }) {
  return (
    <section>
      <h2>Estudiantes con mayor riesgo</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Programa</th>
            <th>Riesgo</th>
            <th>Promedio</th>
            <th>Asistencia</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.student_id}>
              <td>{s.student_id}</td>
              <td>{s.academic_program}</td>
              <td>{((s.risk_score || 0)*100).toFixed(1)}%</td>
              <td>{s.new_average ?? s.average}</td>
              <td>{s.new_attendance ?? s.attendance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
