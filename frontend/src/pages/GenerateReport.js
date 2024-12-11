import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

const GenerateReport = () => {
  const { boleta } = useParams();
  const navigate = useNavigate();
  const [facebookProfile, setFacebookProfile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (e) => {
    e.preventDefault();

    if (!facebookProfile) {
      alert("Por favor, proporciona un enlace de perfil de Facebook válido.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/report",
        { estudiante_id: boleta, profile_link: facebookProfile },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Reporte generado con éxito: " + response.data.data);
      navigate(`/students/${boleta}/reports`);
    } catch (err) {
      console.error("Error al generar el reporte:", err);
      alert("No se pudo generar el reporte. Verifica el perfil de Facebook o intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Generar Reporte</h1>
      <form onSubmit={handleGenerateReport}>
        <label htmlFor="facebookProfile">Perfil de Facebook:</label>
        <input
          type="url"
          id="facebookProfile"
          value={facebookProfile}
          onChange={(e) => setFacebookProfile(e.target.value)}
          placeholder="https://www.facebook.com/perfil"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generando..." : "Generar Reporte"}
        </button>
      </form>
      <button onClick={() => navigate(-1)}>Cancelar</button>
    </div>
  );
};

export default GenerateReport;
