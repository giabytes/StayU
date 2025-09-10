import React from "react";

export default function StudentDetail({ student, onBack }) {
  const whatsappLink = `https://wa.me/57${student.phone_number}?text=Hola%20${student.name},%0A%0AEscribimos%20para%20informarte%20que%20hemos%20detectado%20un%20posible%20riesgo%20de%20deserción%20en%20tu%20programa%20académico.%20Estamos%20aquí%20para%20ayudarte%20y%20ofrecerte%20el%20apoyo%20necesario.%0A%0APor%20favor,%20contacta%20con%20la%20oficina%20de%20tu%20programa%20para%20discutir%20opciones%20y%20recursos%20disponibles.%0A%0ASaludos,%0A%0AEquipo%20de%20Bienestar%20Académico`;

  return (
    <div className="student-detail">
      <button className="back-btn" onClick={onBack}>← Volver</button>
      <div className="detail-card">
        <div className="detail-info">
          <h2>{student.name}</h2>
          <p><strong>Programa académico:</strong> {student.academic_program}</p>
          <p><strong>Fecha de nacimiento:</strong> {student.birth_date}</p>
          <p><strong>Cédula:</strong> {student.citizen_id}</p>
          <p><strong>Correo:</strong> {student.email}</p>
          <p><strong>Celular:</strong> {student.phone_number}</p>
          <p className="risk-text">
            Riesgo de deserción:{" "}
            <span style={{ color: student.risk_level > 0.5 ? "red" : student.risk_level > 0.3 ? "orange" : "green" }}>
              {(student.risk_level * 100).toFixed(0)}%
            </span>
          </p>

          {/* Botón WhatsApp */}
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

      {/* Estilos embebidos */}
      <style jsx>{`
        .whatsapp-btn {
          display: inline-block;
          background-color: #25D366; /* Verde WhatsApp */
          color: white;
          padding: 10px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
