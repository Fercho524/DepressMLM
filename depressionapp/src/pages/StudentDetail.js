import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar"; // Importamos el Sidebar

const StudentDetail = () => {
  const { boleta } = useParams(); // Obtener la boleta del estudiante desde la URL
  const navigate = useNavigate(); // Hook para navegación
  const [student, setStudent] = useState(null);
  const [user, setUser] = useState(null); // Para almacenar el usuario
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para la carga

  // Obtener detalles del estudiante desde la API
  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/student/${boleta}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(response.data);
    } catch (err) {
      alert("Error al obtener detalles del estudiante");
    }
  };

  // Obtener los datos del usuario
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/user/id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data); // Guardar el usuario
    } catch (err) {
      console.error("Error al obtener información del usuario", err);
      alert("Error al obtener información del usuario. Inicia sesión nuevamente.");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  // Eliminar estudiante
  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de eliminar este estudiante?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/student/${boleta}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Estudiante eliminado");
        navigate("/students");
      } catch (err) {
        alert("Error al eliminar estudiante");
      }
    }
  };

  // Función para generar un reporte
  const handleGenerateReport = async () => {
    const profileLink = student.perfil_facebook_actual || prompt("Introduce el enlace al perfil de Facebook del estudiante:");

    if (!profileLink) {
      alert("Debes proporcionar un enlace de Facebook.");
      return;
    }

    setIsLoading(true); // Activar el estado de carga

    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/report",
        { estudiante_id: boleta, profile_link: profileLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Reporte generado exitosamente:\n${response.data.data}`);
    } catch (err) {
      alert("Error al generar el reporte");
    } finally {
      setIsLoading(false); // Desactivar el estado de carga
    }
  };

  // Obtener detalles del estudiante y usuario al cargar el componente
  useEffect(() => {
    fetchStudent();
    fetchUser();
  }, [boleta]);

  if (!student || !user) return <p>Cargando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar, pasamos el usuario como prop */}
      <Sidebar user={user} />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Detalles del Estudiante</h1>
          <a
            href="/students"
            className="text-blue-500 hover:underline text-lg"
          >
            Volver a la Lista de estudiantes
          </a>
        </div>

        {/* Detalles del estudiante */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-lg"><strong>Nombre:</strong> {student.nombre}</p>
          <p className="text-lg"><strong>Boleta:</strong> {student.boleta}</p>
          <p className="text-lg"><strong>Email:</strong> {student.email_saes}</p>
          <p className="text-lg"><strong>Perfil de Facebook:</strong> {student.perfil_facebook_actual || "No proporcionado"}</p>
          <p className="text-lg"><strong>Probabilidad de Depresión:</strong> {student.prob_depresion || "No calculada"}</p>
        </div>

        {/* Botones de acciones */}
        <div className="space-x-4">
          <button
            onClick={() => navigate(`/students/edit/${boleta}`)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Modificar Datos
          </button>
          <button
            onClick={handleGenerateReport}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Generar Reporte
          </button>
          <button
            onClick={() => navigate(`/students/${boleta}/reports`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ver Reportes
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Eliminar Estudiante
          </button>
        </div>
      </main>

      {/* Pantalla de carga */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800">Generando reporte...</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
