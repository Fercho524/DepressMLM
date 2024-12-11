import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar"; // Importamos la Sidebar
import "../App.css";
import { parseChatComponents } from "../reports";
import { parseReportText } from "../reports";

const ReportDetails = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [user, setUser] = useState(null); // Para el Sidebar

  // Fetch del reporte
  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/report/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data)
      setReport(response.data);
    } catch (err) {
      console.error("Error al obtener el reporte:", err);
      alert("No se pudo cargar el reporte.");
    }
  };

  const renderPosts = (posts) => {
    return (
      <div>
        {posts.map((post) => (
          <div key={post.id} className="border-b border-gray-300 py-2">
            <p className="font-bold">Publicación número {post.id}</p>
            {/* <p>
              <strong>Fecha:</strong> {new Date(post.date).toLocaleDateString()}
            </p> */}
            <p>
              {post.text || "Sin texto"}
            </p>
            {post.image_path !== "None" && post.image_path && (
              <p>
                <strong>Imagen:</strong>{" "}
                <p>{post.image_description || "Descripción no disponible"}</p>
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    try {
      const parsedResponse = JSON.parse(report.texto_reporte);
      const components = parseChatComponents(parsedResponse.response)

      const postsContent = parsedResponse.posts
        ? renderPosts(parsedResponse.posts)
        : null;

      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">Respuesta del modelo</h2>
          <div className="text-justify">{components?.assistant}</div>
          {report?.nota_psicologo !== null && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Observaciones propias</h2>
              <div className="text-justify">{report.nota_psicologo}</div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">Publicaciones</h2>
          {postsContent}
        </div>
      );
    } catch (error) {
      console.error("Error al parsear JSON:", error);
      const components = parseChatComponents(report.texto_reporte)
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">Respuesta del modelo</h2>
          <div className="text-justify">{components?.assistant}</div>
          {report?.nota_psicologo !== null && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Observaciones propias</h2>
              <div className="text-justify">{report.nota_psicologo}</div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">Publicaciones</h2>
          {parseReportText(components.user)}
        </div>
      )
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
      console.error("Error al obtener información del usuario:", err);
      alert("Error al obtener información del usuario. Inicia sesión nuevamente.");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  const handleDeleteReport = async () => {
    if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/report/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Reporte eliminado con éxito.");
        navigate(-1);
      } catch (err) {
        console.error("Error al eliminar el reporte:", err);
        alert("No se pudo eliminar el reporte.");
      }
    }
  };

  useEffect(() => {
    fetchReport();
    fetchUser();
  }, [reportId]);

  if (!report || !user) return <p>Cargando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar user={user} />
      </div>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Detalles del Reporte</h1>
          <a
            href={`/students/${report.id_estudiante}`}
            className="text-blue-500 hover:underline text-lg"
          >
            Volver a los datos del estudiante
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reporte ID */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0V6m0 6v6" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Reporte ID</p>
                <p className="text-lg font-bold text-gray-800">{report.id}</p>
              </div>
            </div>

            {/* Fecha */}
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-8 4h8m-8-8h.01" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Fecha</p>
                <p className="text-lg font-bold text-gray-800">{new Date(report.fecha_reporte).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Probabilidad de Depresión */}
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 text-red-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Probabilidad de Depresión</p>
                <p className="text-lg font-bold text-gray-800">{report.prob_depresion}%</p>
              </div>
            </div>

            {/* Perfil de Facebook */}
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 text-indigo-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12h3m-6-6h3m3 6h3m-6 6h3m-3-6H6m3 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Perfil de Facebook</p>
                <a
                  href={report.perfil_facebook || "#"}
                  className="text-lg font-bold text-blue-600 hover:underline"
                >
                  Ver Perfil
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleDeleteReport}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Eliminar Reporte
          </button>
          <button
            onClick={() => navigate(`/edit-report/${report.id}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Editar Reporte
          </button>
          <button
            onClick={() => navigate(`/students/${report.id_estudiante}/reports`)}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Ver Lista de reportes
          </button>
        </div>



        <div className="bg-white rounded-lg mt-6 shadow-md p-6 border border-gray-300">
          <div className="text-lg mt-4">
            <div className="mt-2">{renderContent()}</div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ReportDetails;
