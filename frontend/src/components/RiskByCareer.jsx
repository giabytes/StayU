import React from "react";
// Se eliminan las importaciones de Recharts ya que no se usan en este componente.

export default function RiskByCareer({ data }) {
 if (!data || !Array.isArray(data)) return <p>Cargando datos...</p>;

 // 1. Usar la métrica avgRisk (Riesgo Promedio del Programa) que ya viene calculada de App.jsx
 // 2. Ordenar los programas basándose en este riesgo promedio.
 const sortedPrograms = data
  .map(p => ({
   program: p.program,
   // Utilizamos el avgRisk (ya está en un formato numérico con 2 decimales)
   riskValue: p.avgRisk,
  }))
  .sort((a, b) => b.riskValue - a.riskValue);

 // Función para determinar el color basado en el riesgo promedio
 const getColor = (riskValue) => {
  // Usamos los mismos umbrales que la clasificación (Alto >= 70, Medio >= 40)
  if (riskValue >= 70) return "red";
  if (riskValue >= 40) return "orange";
  return "green";
 };

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
       style={{ color: getColor(p.riskValue) }}
      >
       {/* Mostramos el valor como porcentaje con un decimal */}
       {p.riskValue.toFixed(1)}%
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
     font-family: 'Inter', sans-serif; /* Usamos una fuente más moderna */
     max-width: 350px; /* Limita un poco el ancho */
    }
    .panel-header {
     background-color: #111;
     color: #fff;
     padding: 10px 0; /* Más relleno para el encabezado */
     text-align: center;
    }
    .panel-header h3 {
     margin: 0;
     font-size: 1.1em;
    }
    .program-list {
     display: flex;
     flex-direction: column;
     gap: 4px; /* Espaciado más reducido */
     padding: 15px;
    }
    .program-card {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 8px 10px; /* Menos padding */
     border-radius: 6px;
     background-color: #f7f7f7;
     border-left: 3px solid #ccc; /* Pequeña línea visual */
    }
    .program-card:hover {
     background-color: #eee;
     border-left-color: #111;
    }
    .program-name {
     font-weight: 400; /* Más sutil */
     font-size: 0.9em;
    }
    .risk-value {
     font-weight: 700;
          font-size: 1em;
}
        `}</style>
    </div>
);
}