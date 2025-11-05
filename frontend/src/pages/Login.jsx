import React, { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("WELLBEING_STAFF");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) throw new Error("Credenciales inválidas");
      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError("Correo, contraseña o rol incorrectos");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="title">StayU</h1>
        <p className="subtitle">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
          <label>Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="WELLBEING_STAFF">Staff de Bienestar</option>
            <option value="PROFESSOR">Profesor</option>
            <option value="ACADEMIC_COORDINATOR">Coordinador</option>
          </select>

          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-msg">{error}</p>}

          <button type="submit">Ingresar</button>
        </form>
      </div>

      {/* Estilos internos */}
      <style>{`
       html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

        .login-page {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: 
          linear-gradient(rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.18)),
          url("/background.jpeg");
        background-size: cover;
        background-position: center;
        backdrop-filter: blur(3px);
        font-family: "Inter", sans-serif;
      }

        .login-card {
          background: rgba(228, 228, 228, 0.81);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          padding: 40px 50px;
          width: 360px;
          text-align: center;
          animation: fadeIn 0.6s ease;
        }

        .title {
          color: #103f81ff;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .subtitle {
          color: #525252ff;
          font-size: 1rem;
          margin-bottom: 30px;
        }

        form {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        label {
          margin-top: 10px;
          font-weight: 500;
          color: #333;
        }

        input,
        select {
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #103f81ff;
          margin-top: 5px;
          outline: none;
          transition: all 0.2s ease;
        }

        input:focus,
        select:focus {
          border-color: #103f81ff;
          box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
        }

        button {
          margin-top: 25px;
          background-color: #0008a1ff;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:hover {
          background-color: #000ed5ff;
          transform: translateY(-2px);
        }

        .error-msg {
          color: #e74c3c;
          margin-top: 10px;
          text-align: center;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
