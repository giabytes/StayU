import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = { highRisk: "#F44336", mediumRisk: "#FFC107", lowRisk: "#4CAF50" };

export default function ProgramDetailView({ programData, onBack }) {
  const total = programData.highRisk + programData.mediumRisk + programData.lowRisk;

  const pieData = [
    { name: "Alto riesgo", value: programData.highRisk, color: COLORS.highRisk },
    { name: "Medio riesgo", value: programData.mediumRisk, color: COLORS.mediumRisk },
    { name: "Bajo riesgo", value: programData.lowRisk, color: COLORS.lowRisk },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={onBack} style={{ marginBottom: "10px" }}>← Volver</button>
      <h2 style={{ color: "#030cb3ff" }}>{programData.program}</h2>
      <p>Total estudiantes: {total}</p>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`}
            >
              {pieData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {pieData.map(p => (
          <div key={p.name} style={{ flex: 1, padding: "10px", borderRadius: "6px", backgroundColor: "#f0f0f0", textAlign: "center" }}>
            <h4 style={{ color: p.color }}>{p.name}</h4>
            <p>{p.value} estudiantes</p>
          </div>
        ))}
      </div>
    </div>
  );
}
