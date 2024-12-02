import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar"; // Importamos la Sidebar
import "../App.css"

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
      setReport(response.data);
    } catch (err) {
      console.error("Error al obtener el reporte:", err);
      alert("No se pudo cargar el reporte.");
    }
  };

  const parseReportText = (text) => {
    if (!text) return null;

    // Reemplazar errores comunes en el texto
    text = text.replace(/Publ icación/g, "Publicación");

    const lines = text.split("\n"); // Divide el texto en líneas
    const elements = [];

    let listItems = [];
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Detectar palabras clave y aplicar estilo en negritas
      if (/^<|im_start|>system|^<|im_start|>user|^<|im_start|>assistant/i.test(trimmedLine)) {
        elements.push(
          <p key={`section-${index}`} className="font-bold text-gray-800  model-section mb-2">
            {trimmedLine.replace("<|im_start|>", "")}
          </p>
        );
      } else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
        // Es un elemento de lista
        listItems.push(trimmedLine.substring(2));
      } else {
        if (listItems.length > 0) {
          // Finaliza la lista y agrégala
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-8 mb-2">
              {listItems.map((item, i) => (
                <li key={`item-${i}`} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          );
          listItems = []; // Limpia la lista temporal
        }

        if (trimmedLine) {
          // Agrega un párrafo
          elements.push(
            <p key={`line-${index}`} className="text-gray-700 mb-2">
              {trimmedLine}
            </p>
          );
        }
      }
    });

    // Agregar cualquier lista restante
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-final`} className="list-disc pl-8 mb-2">
          {listItems.map((item, i) => (
            <li key={`item-final-${i}`} className="text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return elements;
  };



  // Fetch del usuario para la Sidebar
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

  // Eliminar reporte
  const handleDeleteReport = async () => {
    if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/report/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Reporte eliminado con éxito.");
        navigate(-1); // Regresar a la lista de reportes
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
      {/* Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar user={user} />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6"></h1>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Detalles del Reporte</h1>
          <a
            href={`/students/${report.id_estudiante}/reports`}
            className="text-blue-500 hover:underline text-lg"
          >
            Volver a la lista de reportes
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <p className="text-lg">
            <strong className="font-bold text-gray-800">Reporte ID:</strong> {report.id}
          </p>
          <p className="text-lg mt-2">
            <strong className="font-bold text-gray-800">Número de Publicaciones:</strong>{" "}
            {report.num_publicaciones}
          </p>
          <p className="text-lg mt-2">
            <strong className="font-bold text-gray-800">Fecha:</strong>{" "}
            {new Date(report.fecha_reporte).toLocaleDateString()}
          </p>
          <p className="text-lg mt-2">
            <strong className="font-bold text-gray-800">Probabilidad de Depresión:</strong>{" "}
            {report.prob_depresion}
          </p>
          <p className="text-lg mt-2">
            <strong className="font-bold text-gray-800">Perfil de Facebook:</strong>{" "}
            <a href={report.perfil_facebook || "#"}>Perfil de Facebook</a>
          </p>

          <div className="text-lg mt-2">
            <strong className="font-bold text-gray-800">Texto del Reporte:</strong>
            <div className="mt-2">{parseReportText(report.texto_reporte)}</div>
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
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Volver
          </button>
        </div>
      </main>
    </div>
  );
};

export default ReportDetails;
