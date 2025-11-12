// ProfessorAlertForm.jsx
import React, { useState, useEffect } from "react";

export default function ProfessorAlertForm({ student, onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    participation: "",
    behavior: "",
    observations: "",
    urgency: "",
    date: "",
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Autocompletar fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: today }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("No se encontró información del usuario logueado.");
            return;
        }

        const payload = {
        student_id: student.student_id || student.id, 
        professor_id: user.professorId || user.id,    //  si es profe, usa su ID real
        urgency: formData.urgency,
        responses: {
            participation: formData.participation,
            behavior: formData.behavior,
            observations: formData.observations,
            urgency: formData.urgency,
            date: formData.date,
        },
        };

        console.log("Enviando alerta al backend:", payload);

        const response = await fetch("http://54.210.10.174/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        });

        if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
        }


        const data = await response.json();
        console.log("Respuesta del servidor:", data);

         // Mostrar mensaje de éxito inline
        setMessage({
            type: "success",
            text: `Alerta enviada exitosamente. Riesgo actualizado a ${data.new_risk_score ?? 'un nuevo valor'}.`,
        });

        // Opcional: cerrar automáticamente después de unos segundos
        setTimeout(() => {
            setMessage(null);
            onBack();
        }, 5000);

    } catch (error) {
        console.error("Error enviando la alerta:", error);
        alert(" No se pudo enviar la alerta. Inténtalo nuevamente.");
    }
    };


  return (
    <div className="alert-form-container">
      <div className="alert-form-card">
        <h2>Generar alerta para {student.name}</h2>

        <form onSubmit={handleSubmit}>
          {/* Nombre del estudiante */}
          <div className="form-group">
            <label>Nombre del estudiante</label>
            <input type="text" value={student.name} disabled />
          </div>

          {/* Fecha del reporte */}
          <div className="form-group">
            <label>Fecha del reporte</label>
            <input type="text" value={formData.date} disabled />
          </div>

          {/* Participación */}
          <div className="form-group">
            <label>Participación en clase</label>
            <div className="options">
              {["Alta participación", "Participa ocasionalmente", "Rara vez participa", "No participa"].map((opt) => (
                <label key={opt}>
                  <input
                    type="radio"
                    name="participation"
                    value={opt}
                    checked={formData.participation === opt}
                    onChange={handleChange}
                    required
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Comportamiento */}
          <div className="form-group">
            <label>Comportamiento o actitud</label>
            <div className="options">
              {[
                "No, todo normal",
                "Le noto más desmotivado o distraído",
                "Presenta actitudes preocupantes",
                "Ha expresado intención de abandonar",
              ].map((opt) => (
                <label key={opt}>
                  <input
                    type="radio"
                    name="behavior"
                    value={opt}
                    checked={formData.behavior === opt}
                    onChange={handleChange}
                    required
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div className="form-group">
            <label>Observaciones adicionales</label>
            <textarea
              name="observations"
              rows="4"
              placeholder="Escribe aquí tus observaciones..."
              value={formData.observations}
              onChange={handleChange}
            />
          </div>

          {/* Urgencia */}
          <div className="form-group">
            <label>Nivel de urgencia o alerta</label>
            <div className="options">
              {["Baja", "Media", "Alta"].map((opt) => (
                <label key={opt}>
                  <input
                    type="radio"
                    name="urgency"
                    value={opt}
                    checked={formData.urgency === opt}
                    onChange={handleChange}
                    required
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button type="button" className="back-btn" onClick={onBack}>
              ← Volver
            </button>
            <button type="submit" className="submit-btn">
              Enviar alerta
            </button>
          </div>
        </form>

        {/* Mensaje inline */}
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <style>{`
        .alert-form-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 90vh;
          background-color: #f5f7fb;
          font-family: "Inter", sans-serif;
        }

        .alert-form-card {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          max-width: 600px;
          width: 100%;
        }

        h2 {
          text-align: center;
          color: #103f81ff;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          font-weight: 600;
          color: #333;
          display: block;
          margin-bottom: 6px;
        }

        input[type="text"],
        textarea {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .back-btn {
          background-color: #c9fff9ff;
          color: #000;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .submit-btn {
          background-color: #103f81ff;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .submit-btn:hover {
          background-color: #0d326aff;
        }

        .message {
          margin-top: 20px;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          animation: fadein 0.3s ease;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
        }

        @keyframes fadein {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
