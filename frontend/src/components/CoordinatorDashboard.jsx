import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function CoordinatorDashboard({ programs, onSelectProgram }) {
 // Aseguramos que 'programs' sea un array válido antes de operar
 if (!programs || !Array.isArray(programs)) {
  return <p style={{ padding: "20px" }}>Cargando datos del programa...</p>;
 }

 // 1. Ordenar de mayor a menor utilizando el Riesgo Promedio (avgRisk)
 const sorted = [...programs].sort((a, b) => {
  // Si avgRisk no está definido, usamos 0 para la comparación.
  const aAvg = a.avgRisk || 0;
  const bAvg = b.avgRisk || 0;
  return bAvg - aAvg;
 });

 // 2. Mapear los datos para la gráfica, usando avgRisk
 const data = sorted.map(p => ({
  program: p.program,
  // Utilizamos avgRisk y aseguramos que tenga un decimal para la visualización.
  avgRisk: p.avgRisk ? parseFloat(p.avgRisk.toFixed(1)) : 0,
 }));

 return (
  <div style={{ padding: "20px" }}>
   <h3 style={{ backgroundColor: "#212121", color: "#fff", padding: "10px", borderRadius: "6px" }}>
    Riesgo Promedio de Deserción por Programa
   </h3>
   <div style={{ width: "100%", height: 400, marginTop: 20 }}>
    <ResponsiveContainer>
     <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
       dataKey="program"
       tickFormatter={(name) => name.length > 10 ? name.slice(0, 10) + "…" : name}
      />
      <YAxis unit="%" domain={[0, 100]} />
      {/* Muestra el valor de avgRisk en el Tooltip */}
      <Tooltip formatter={(val) => [`${val.toFixed(1)}%`, 'Riesgo Promedio']} />
      {/* Grafica la clave avgRisk, no highRiskPct */}
      <Bar
       dataKey="avgRisk"
       fill="#F44336"
       onClick={(d) => onSelectProgram(d.program)}
      />
     </BarChart>
    </ResponsiveContainer>
   </div>
  </div>
 );
}