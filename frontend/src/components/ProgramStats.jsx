import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Colores para las categorías de riesgo
const COLORS = {
  low_risk: '#4CAF50', // Verde
  medium_risk: '#FFC107', // Amarillo/Naranja
  high_risk: '#F44336', // Rojo
};

// --- Componente de Detalle de Programa ---
function ProgramDetailView({ programData, onBack }) {
  if (!programData || !programData.risk_segments) return null;

  const { program, total_students, risk_segments } = programData;
  const segments = Object.entries(risk_segments).map(([key, data]) => ({
    name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), // Ej: Low Risk
    count: data.count,
    range: data.range,
    avg_grade: data.avg_grade,
    payments: data.payments,
    grade_distribution: data.grade_distribution,
    color: COLORS[key],
  }));

  // Datos para el gráfico de torta de riesgo
  const riskData = segments.map(s => ({
    name: s.name,
    value: s.count,
    fill: s.color
  }));

  return (
    <div className="program-detail-view">
      <button className="back-btn" onClick={onBack}>← Volver a Estadísticas</button>
      <h2 style={{color: '#646cff'}}>{program}</h2>
      <p>Total de estudiantes: <strong>{total_students}</strong></p>

      {/* 🔹 Gráfico de Distribución de Riesgo */}
      <div className="stats-section chart-container">
        <h3>Distribución de Riesgo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {riskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Detalle por Segmento de Riesgo */}
      <div className="stats-section segment-details">
        <h3>Análisis Detallado por Segmento</h3>
        {segments.map(s => (
          <div key={s.name} className="segment-card" style={{borderColor: s.color}}>
            <h4 style={{color: s.color}}>{s.name} ({s.range})</h4>
            <p>Estudiantes en este rango: <strong>{s.count}</strong></p>
            <p>Promedio de Notas: <strong>{s.avg_grade !== null ? s.avg_grade : 'N/A'}</strong></p>
            <p>Pagos a Tiempo: <strong>{s.payments.on_time}</strong> | Pagos Retrasados: <strong>{s.payments.late}</strong></p>
            
            {/* Opcional: Distribución de Notas (se puede hacer un gráfico de barras) */}
            <div className="grade-dist">
              <h5>Distribución de Notas (promedio redondeado):</h5>
              <ul>
                {Object.entries(s.grade_distribution).map(([grade, count]) => (
                  <li key={grade}>{grade}: {count} estudiantes</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Sugerencia de estilos embebidos */}
      <style jsx>{`
        .program-detail-view { padding: 20px; }
        .stats-section { margin-top: 20px; padding: 15px; border-radius: 8px; background-color: #f0f0f0; }
        .chart-container { background-color: white; padding: 20px; }
        .segment-details { display: flex; flex-wrap: wrap; gap: 20px; }
        .segment-card { 
          flex: 1 1 calc(33% - 20px); 
          border: 2px solid; 
          padding: 15px; 
          border-radius: 8px; 
          background-color: white;
        }
        .grade-dist ul { list-style: none; padding: 0; }
        .grade-dist li { margin-bottom: 5px; }
      `}</style>
    </div>
  );
}


// --- Componente de Vista General de Estadísticas ---
export default function ProgramStats({ report, onBack, selectedProgram, onSelectProgram, onBackToGeneral }) {
  if (selectedProgram) {
    return <ProgramDetailView programData={selectedProgram} onBack={onBackToGeneral} />;
  }

  if (!report || !report.programs) {
    return (
      <div className="stats-container">
        <button className="back-btn" onClick={onBack}>← Volver</button>
        <h2>Estadísticas de Programas</h2>
        <p>Cargando reporte o reporte no disponible...</p>
      </div>
    );
  }

  // Calculamos la tabla general: Promedio de riesgo por programa (como porcentaje)
  // Nota: El reporte del back no da el promedio directo, lo calculamos aquí o en el back.
  // Por ahora, para simplificar el frontend, usaremos solo el "total de estudiantes".
  // Idealmente, se calcularía el % de "high_risk" o un promedio ponderado.
  const programSummaries = report.programs.map(p => {
    const highRiskCount = p.risk_segments.high_risk.count;
    const lowRiskCount = p.risk_segments.low_risk.count;
    const mediumRiskCount = p.risk_segments.medium_risk.count;
    
    // Calculamos el % de riesgo alto (el más crítico)
    const totalSegmented = highRiskCount + mediumRiskCount + lowRiskCount;
    const highRiskPct = totalSegmented > 0 ? ((highRiskCount / totalSegmented) * 100).toFixed(1) : 0;

    return {
      program: p.program,
      totalStudents: p.total_students,
      highRiskCount,
      highRiskPct: parseFloat(highRiskPct),
      data: p // Guardamos el objeto completo para la vista de detalle
    };
  }).sort((a, b) => b.highRiskPct - a.highRiskPct); // Ordenamos por el % de riesgo alto

  // --- Renderizado de la Vista General ---
  return (
    <div className="stats-container">
      <button className="back-btn" onClick={onBack}>← Volver a Estudiantes</button>
      <h2>Reporte General de Deserción por Programa 📊</h2>
      <p>Reporte generado el: {new Date(report.generated_at).toLocaleString()}</p>

      {/* 🔹 Tabla con resumen de programas */}
      <table className="program-summary-table">
        <thead>
          <tr>
            <th>Programa Académico</th>
            <th>Estudiantes (Total)</th>
            <th>Estudiantes con Riesgo Alto (50-100%)</th>
            <th>% Riesgo Alto</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {programSummaries.map((p) => (
            <tr key={p.program}>
              <td className="program-name-cell">{p.program}</td>
              <td>{p.totalStudents}</td>
              <td>{p.highRiskCount}</td>
              <td style={{ color: p.highRiskPct >= 20 ? 'red' : p.highRiskPct >= 10 ? 'orange' : 'green', fontWeight: 'bold' }}>
                {p.highRiskPct}%
              </td>
              <td>
                <button 
                  className="detail-btn" 
                  onClick={() => onSelectProgram(p.data)}
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sugerencia de estilos para la tabla */}
      <style jsx>{`
        .stats-container { padding: 20px; }
        .program-summary-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .program-summary-table th, .program-summary-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .program-summary-table th {
          background-color: #f2f2f2;
          color: #213547; /* Color oscuro para el texto en fondo claro */
        }
        .program-summary-table tr:hover {
          background-color: #f9f9f9;
        }
        .detail-btn {
          padding: 5px 10px;
          font-size: 0.9em;
          background-color: #535bf2;
          color: white;
          border: none;
        }
        .detail-btn:hover {
          background-color: #646cff;
        }
        .program-name-cell { font-weight: 500; }
      `}</style>
    </div>
  );
}