// StudentDetail.jsx
import React from "react";
import AppHeader from "./AppHeader"; // Header igual que en App.jsx

export default function StudentDetail({ student, onBack, logout }) {
  const whatsappLink = `https://wa.me/57${student.phone_number}?text=Hola%20${student.name},%0A%0AEscribimos%20para%20informarte%20que hemos detectado un posible riesgo de deserción en tu programa académico.%20Estamos aquí para ayudarte.%0A%0APor favor, contacta con tu oficina de programa.%0A%0ASaludos,%0AEquipo de Bienestar Académico`;

  const getRiskColor = (risk) => {
    if (risk >= 70) return "#ff4d4f";
    if (risk >= 40) return "#faad14";
    return "#52c41a";
  };

  return (
    <div className="student-detail-page">
      <AppHeader role="Staff de Bienestar" onLogout={logout} />

      <div className="student-detail-container">
        <button className="back-btn" onClick={onBack}>← Volver</button>

        <div className="student-card">
          <h2>{student.name}</h2>

          <div className="card-content">
            {/* Izquierda: datos */}
            <div className="info-column">
              <div className="info-item">
                <span className="label">Programa académico</span>
                <span className="value">{student.academic_program}</span>
              </div>
              <div className="info-item">
                <span className="label">Fecha de nacimiento</span>
                <span className="value">{student.birth_date}</span>
              </div>
              <div className="info-item">
                <span className="label">Cédula</span>
                <span className="value">{student.citizen_id}</span>
              </div>
              <div className="info-item">
                <span className="label">Correo</span>
                <span className="value">{student.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Celular</span>
                <span className="value">{student.phone_number}</span>
              </div>
            </div>

            {/* Derecha: riesgo */}
            <div className="risk-column">
              <div className="risk-percentage" style={{ color: getRiskColor(student.risk_score) }}>
                {student.risk_score.toFixed(0)}%
              </div>
              <div className="risk-bar-container">
                <div 
                  className="risk-bar" 
                  style={{ width: `${student.risk_score}%`, backgroundColor: getRiskColor(student.risk_score) }}
                ></div>
              </div>
            </div>
          </div>

          <a
            href={whatsappLink}
            className="whatsapp-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enviar WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        .student-detail-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f4f6f8;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .student-detail-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          padding: 40px 20px;
        }

        .back-btn {
          align-self: flex-start;
          margin-bottom: 20px;
          background: none;
          border: none;
          color: #0047AB;
          font-size: 1em;
          cursor: pointer;
          font-weight: 600;
        }

        .student-card {
          background-color: white;
          border-radius: 20px;
          padding: 30px 25px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          width: 100%;
          max-width: 780px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .student-card h2 {
          text-align: center;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1.9em;
          color: #1c1c1c;
        }

        .card-content {
          display: flex;
          justify-content: space-between;
          gap: 50px;
          height: 260px;
        }

        .info-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 28px; /* más separación entre cada fila */
          justify-content: center;
          padding-left: 15px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 45px;
          border-radius: 12px;
          background-color: #edededff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          font-size: 0.92em; /* fuente un poco más pequeña */
        }

        .label {
          font-weight: 500;
          color: #555;
        }

        .value {
          font-weight: 600;
          color: #333;
        }

        .risk-column {
          flex: 0.5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .risk-percentage {
          font-size: 1.7em;
          font-weight: 600;
        }

        .risk-bar-container {
          width: 100%;
          height: 20px;
          background-color: #e6e6e6;
          border-radius: 12px;
          overflow: hidden;
        }

        .risk-bar {
          height: 100%;
          border-radius: 12px;
        }

        .whatsapp-btn {
          margin-top: 25px;
          padding: 12px 22px;
          background-color: #25D366;
          color: white;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          text-align: center;
          align-self: center;
          width: 25%;
          transition: background-color 0.2s;
        }

        .whatsapp-btn:hover {
          background-color: #1ebe5d;
        }

        @media (max-width: 800px) {
          .card-content {
            flex-direction: column;
            height: auto;
          }
          .risk-column {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }
          .risk-bar-container {
            flex: 1;
            margin-left: 10px;
          }
          .risk-percentage {
            font-size: 1.5em;
          }
        }
      `}</style>
    </div>
  );
}
