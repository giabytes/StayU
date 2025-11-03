import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function RiskByCareer({ data }) {
  const formatted = data.map(d => ({ career: d.career, avgRiskPct: +(d.avgRisk * 100).toFixed(1) }));

  return (
    <section>
      <h2>Riesgo promedio por carrera</h2>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="career" />
            <YAxis />
            <Tooltip formatter={(val) => `${val}%`} />
            <Bar dataKey="avgRiskPct" name="Riesgo (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
