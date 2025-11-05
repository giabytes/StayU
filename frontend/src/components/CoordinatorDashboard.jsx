import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function CoordinatorDashboard({ programs, onSelectProgram }) {
  // Ordenar de mayor a menor riesgo
  const sorted = [...programs].sort((a, b) => {
    const aPct = ((a.highRisk || 0) / ((a.highRisk + a.mediumRisk + a.lowRisk) || 1)) * 100;
    const bPct = ((b.highRisk || 0) / ((b.highRisk + b.mediumRisk + b.lowRisk) || 1)) * 100;
    return bPct - aPct;
  });

  const data = sorted.map(p => ({
    program: p.program,
    highRiskPct: +(((p.highRisk || 0) / (p.highRisk + p.mediumRisk + p.lowRisk)) * 100).toFixed(1)
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h3 style={{ backgroundColor: "#212121", color: "#fff", padding: "10px", borderRadius: "6px" }}>
        Porcentaje de riesgo de deserción por programa
      </h3>
      <div style={{ width: "100%", height: 400, marginTop: 20 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="program"
            tickFormatter={(name) => name.length > 10 ? name.slice(0, 10) + "…" : name}
            />
            <YAxis unit="%" />
            <Tooltip formatter={(val) => `${val}%`} />
            <Bar dataKey="highRiskPct" fill="#F44336" onClick={(d) => onSelectProgram(d.program)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
