import React from "react";
import AppHeader from "./AppHeader";

export default function StudentDetail({ student, onBack }) {
  const whatsappLink = `https://wa.me/57${student.phone_number}?text=Hola%20${student.name},%0A%0AEscribimos%20para%20informarte%20que%20hemos%20detectado%20un%20posible%20riesgo%20de%20deserción%20en%20tu%20programa%20académico.%20Estamos%20aquí%20para%20ayudarte%20y%20ofrecerte%20el%20apoyo%20necesario.%0A%0APor%20favor,%20contacta%20con%20la%20oficina%20de%20tu%20programa%20para%20discutir%20opciones%20y%20recursos%20disponibles.%0A%0ASaludos,%0A%0AEquipo%20de%20Bienestar%20Académico`;

  const riskColor = (risk) => {
    if (risk >= 70) return "red";      // alto riesgo
    if (risk >= 40) return "orange";   // medio riesgo
    return "green";                    // bajo riesgo
  };

  return (
    <div className="student-detail">
      <AppHeader role="Staff de Bienestar" onLogout={onLogout} />
      <button className="back-btn" onClick={onBack}>← Volver</button>
      <div className="detail-card">
        <h2 className="student-name">{student.name}</h2>
        <div className="detail-item"><strong>Programa académico:</strong> {student.academic_program}</div>
        <div className="detail-item"><strong>Fecha de nacimiento:</strong> {student.birth_date}</div>
        <div className="detail-item"><strong>Cédula:</strong> {student.citizen_id}</div>
        <div className="detail-item"><strong>Correo:</strong> {student.email}</div>
        <div className="detail-item"><strong>Celular:</strong> {student.phone_number}</div>
        <div className="detail-item risk">
          <strong>Riesgo de deserción:</strong>
          <span className="risk-badge" style={{ backgroundColor: riskColor }}>
            {student.risk_score.toFixed(0)}%
          </span>
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

      <style>{`
        .student-detail {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
        }

        .back-btn {
          align-self: flex-start;
          margin-bottom: 20px;
          background-color: #103f81ff;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        }

        .back-btn:hover {
          background-color: #103f81ff;
        }

        .detail-card {
          background-color: #ffffff;
          padding: 30px 40px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          max-width: 500px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .student-name {
          margin: 0 0 15px 0;
          text-align: center;
          color: #213547;
        }

        .detail-item {
          font-size: 16px;
          line-height: 1.5;
        }

        .risk {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: bold;
        }

        .risk-badge {
          padding: 4px 10px;
          border-radius: 8px;
          color: white;
        }

        .whatsapp-btn {
          margin-top: 20px;
          align-self: center;
          display: inline-block;
          background-color: #25D366;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.2s;
        }

        .whatsapp-btn:hover {
          background-color: #1ebe5d;
        }

      `}</style>
    </div>
  );
}
