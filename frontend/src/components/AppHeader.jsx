// AppHeader.jsx
import React from "react";


export default function AppHeader({ role, searchValue, onSearchChange, onLogout }) {
  return (
    <header className="app-header">
      <h1>StayU</h1>
      <h3>{role}</h3>

      {searchValue !== undefined && onSearchChange && (
        <input
          className="search-input"
          placeholder="Buscar estudiante"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      )}

      <button className="logout-btn" onClick={onLogout}>
        Cerrar sesión
      </button>

      <style>{`
        body, html {
          margin: 0;
          padding: 0;
        }
        .app-header {
          background-color: #103f81ff; /* Azul StayU */
          color: white;
          padding: 30px 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          width: 100%;          /* Ocupa todo el ancho */
          box-sizing: border-box; /* Evita que el padding genere scroll horizontal */
          position: fixed;
          margin: 0;
          top: 0;
          left: 0;
          z-index: 1000;
        }
        .app-header h1 {
          margin: 0;
          font-size: 1.8em;
        }
        .app-header h3 {
          margin: 0;
          font-weight: normal;
        }
        .search-input {
          margin-left: auto;
          padding: 8px 10px;
          border-radius: 6px;
          border: none;
        }
        .logout-btn {
          background-color: #bdfdffff;
          color: #000000ff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
      `}</style>
    </header>
  );
}
