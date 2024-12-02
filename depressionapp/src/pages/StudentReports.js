import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar"; // Importamos el Sidebar

const StudentReports = () => {
  const { boleta } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Para el Sidebar

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/report/history?boleta=${boleta}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener los reportes:", err);
      alert("No se pudieron cargar los reportes del estudiante.");
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/user/id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (err) {
      console.error("Error al obtener información del usuario", err);
      alert("Error al obtener información del usuario. Inicia sesión nuevamente.");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  const handleDeleteAllReports = async () => {
    if (window.confirm("¿Estás seguro de eliminar todos los reportes del estudiante?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/report`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { boleta },
        });
        alert("Todos los reportes del estudiante han sido eliminados.");
        setReports([]); // Limpia la lista de reportes
      } catch (err) {
        console.error("Error al eliminar reportes:", err);
        alert("No se pudieron eliminar los reportes.");
      }
    }
  };

  useEffect(() => {
    fetchReports();
    fetchUser();
  }, [boleta]);

  if (loading || !user) return <p>Cargando reportes...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar user={user} />
      </div>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Reportes del estudiante</h1>
          <a
            href={`/students/${boleta}`}
            className="text-blue-500 hover:underline text-lg"
          >
            Volver a detalles del estudiante
          </a>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleDeleteAllReports}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Eliminar Todos los Reportes
          </button>
        </div>

        {reports.length === 0 ? (
          <p className="text-lg text-gray-700">No se encontraron reportes para este estudiante.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-300"
              >
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  Reporte ID: {report.id}
                </h2>
                <p className="text-gray-700">
                  <strong>Fecha:</strong> {new Date(report.fecha_reporte).toLocaleDateString()}
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => navigate(`/reports/${report.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentReports;
