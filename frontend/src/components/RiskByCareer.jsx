import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import React from "react";

export default function RiskByCareer({ data }) {
  if (!data || !Array.isArray(data)) return <p>Cargando datos...</p>;

  // Calculamos porcentaje de riesgo alto por programa y ordenamos de mayor a menor
  const sortedPrograms = data
    .map(p => {
      const total = p.highRisk + p.mediumRisk + p.lowRisk;
      const highRiskPct = total > 0 ? (p.highRisk / total) * 100 : 0;
      return { program: p.program, highRiskPct: +highRiskPct.toFixed(1) };
    })
    .sort((a, b) => b.highRiskPct - a.highRiskPct);

  return (
    <div className="risk-panel">
      {/* Encabezado */}
      <div className="panel-header">
        <h3>Riesgo de deserción por programa</h3>
      </div>

      {/* Lista de programas */}
      <div className="program-list">
        {sortedPrograms.map(p => (
          <div className="program-card" key={p.program}>
            <span className="program-name">{p.program}</span>
            <span
              className="risk-value"
              style={{
                color:
                  p.highRiskPct >= 20
                    ? "red"
                    : p.highRiskPct >= 10
                    ? "orange"
                    : "green"
              }}
            >
              {p.highRiskPct}%
            </span>
          </div>
        ))}
      </div>

      {/* Estilos embebidos */}
      <style>{`
        .risk-panel {
          border-radius: 10px;
          overflow: hidden;
          background-color: #ffffff;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }
        .panel-header {
          background-color: #111;
          color: #fff;
          padding: 1px;
          text-align: center;
        }
        .program-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px 15px 15px 15px;
        }
        .program-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          border-radius: 6px;
          background-color: #f4f4f4;
          transition: transform 0.2s, background-color 0.2s;
        }
        .program-card:hover {
          transform: translateY(-2px);
          background-color: #eaeaea;
        }
        .program-name {
          font-weight: 500;
        }
        .risk-value {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
