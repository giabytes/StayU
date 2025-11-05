import React, { useEffect, useState } from "react";
import { updateAndGetRiskData, getRecord } from "../services/riskService";
import { getStudents } from "../services/userService";
import RiskList from "../components/RiskList";
import RiskByCareer from "../components/RiskByCareer";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [byCareer, setByCareer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1) Pide a RiskAnalysis que actualice Academic + Payment y devuelva los datos actualizados
        const updated = await updateAndGetRiskData();

        // 2) Trae la base de usuarios para obtener academic_program (puede venir de NestJS)
        const users = await getStudents();
        const usersMap = new Map(users.map(u => [String(u.id ?? u.student_id), u]));

        // 3) Combina los datos actualizados con la info de usuario (programa)
        const merged = updated.map(item => {
          const idStr = String(item.student_id);
          const user = usersMap.get(idStr) || {};
          return {
            ...item,
            academic_program: user.academic_program || user.program || "Unknown"
          };
        });

        // 4) Obtener risk_score para cada estudiante (RiskAnalysis guarda risk_score en DB; endpoint get-record lo devuelve)
        const withScores = await Promise.all(
          merged.map(async s => {
            try {
              const rec = await getRecord(s.student_id);
              // Recuerda que tu DB puede usar field risk_score o risk_score; intentamos ambos.
              return { ...s, risk_score: rec.risk_score ?? rec.risk_score ?? 0 };
            } catch (err) {
              return { ...s, risk_score: 0 };
            }
          })
        );

        setStudents(withScores);

        // 5) calcular promedio de riesgo por carrera
        const careerAgg = {};
        withScores.forEach(s => {
          const career = s.academic_program || "Unknown";
          careerAgg[career] = careerAgg[career] || { sum: 0, count: 0 };
          careerAgg[career].sum += (s.risk_score || 0);
          careerAgg[career].count += 1;
        });
        const careerArr = Object.entries(careerAgg).map(([career, v]) => ({
          career,
          avgRisk: v.count ? v.sum / v.count : 0
        }));
        setByCareer(careerArr);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="container">
      <h1>StayU — Dashboard de riesgo</h1>
      {loading ? (
        <p>Cargando datos…</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <RiskList students={students.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)).slice(0, 50)} />
          <RiskByCareer data={byCareer} />
        </>
      )}
    </div>
  );
}
