import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar"; // Importamos el Sidebar
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const StudentDetail = () => {
  const { boleta } = useParams(); // Obtener la boleta del estudiante desde la URL
  const navigate = useNavigate(); // Hook para navegación
  const [student, setStudent] = useState(null);
  const [user, setUser] = useState(null); // Para almacenar el usuario
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para la carga
  const [reports, setReports] = useState([]);

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

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/report/history", {
        headers: { Authorization: `Bearer ${token}` },
        params: { boleta },
      });
      console.log(response.data)
      setReports(response.data); // Guardar los reportes
    } catch (err) {
      alert("Error al obtener reportes del estudiante");
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
    fetchReports();
    fetchUser();
  }, [boleta]);

  if (!student || !user) return <p>Cargando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar, pasamos el usuario como prop */}
      <Sidebar user={user} />

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">{student.nombre}</h1>
          <a
            href="/students"
            className="text-blue-500 hover:underline text-lg"
          >
            Volver a la Lista de estudiantes
          </a>
        </div>

        {/* Detalles del estudiante */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Boleta */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7h-4m0 0H7m4 0v10m4-10v10" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Boleta</p>
                <p className="text-lg font-bold text-gray-800">{student.boleta}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12l-4-4m0 0L8 12m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Email</p>
                <p className="text-lg font-bold text-gray-800">{student.email_saes}</p>
              </div>
            </div>


            {/* Objetivos Terapéuticos */}
            <div className="flex items-center space-x-4">
              <div className="bg-teal-100 text-teal-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm0 0L2 6m2-2l2 2" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Objetivos Terapéuticos</p>
                <p className="text-lg font-bold text-gray-800">
                  {student.objetivos_terapeuticos || "No disponibles"}
                </p>
              </div>
            </div>

            {/* Última Interacción */}
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 text-orange-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l9 9m0 0l-9-9m9 9l-9-9" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Última Interacción</p>
                <p className="text-lg font-bold text-gray-800">
                  {student.ultima_interaccion ? new Date(student.ultima_interaccion).toLocaleDateString() : "No disponible"}
                </p>
              </div>
            </div>

            {/* Perfil de Facebook */}
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 text-purple-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Perfil de Facebook</p>
                <p className="text-lg font-bold text-gray-800">
                  {student.perfil_facebook_actual ? (
                    <a href={student.perfil_facebook_actual} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      Ver Perfil
                    </a>
                  ) : (
                    "No proporcionado"
                  )}
                </p>
              </div>
            </div>

            {/* Probabilidad de Depresión */}
            < div className="flex items-center space-x-4">
              <div className="bg-red-100 text-red-500 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Probabilidad de Depresión Promedio</p>
                <p className="text-lg font-bold text-gray-800">
                  {reports.length > 0
                    ? `${(reports.reduce((sum, report) => sum + (report.num_publicaciones || 0), 0) / reports.length).toFixed(2)}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Gráfica de reportes */}
        <div className="bg-white p-4 rounded-lg mt-8 shadow-md h-[400px]">
          {reports.length > 0 ? (
            <Line
              data={{
                labels: reports
                  .slice()
                  .sort((a, b) => {
                    // Ordenar primero por fecha (ascendente) y luego por ID (ascendente)
                    const dateComparison = new Date(a.fecha_reporte) - new Date(b.fecha_reporte);
                    return dateComparison === 0 ? a.id - b.id : dateComparison;
                  })
                  .map((report) => new Date(report.fecha_reporte).toLocaleDateString()),
                datasets: [
                  {
                    label: "Probabilidad de Depresión",
                    data: reports
                      .slice()
                      .sort((a, b) => {
                        const dateComparison = new Date(a.fecha_reporte) - new Date(b.fecha_reporte);
                        return dateComparison === 0 ? a.id - b.id : dateComparison;
                      })
                      .map((report) => report.prob_depresion || 0),
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Progreso del Estudiante",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Probabilidad (%)",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Fecha",
                    },
                  },
                },
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const chartElement = elements[0];
                    const sortedReports = reports
                      .slice()
                      .sort((a, b) => {
                        const dateComparison = new Date(a.fecha_reporte) - new Date(b.fecha_reporte);
                        return dateComparison === 0 ? a.id - b.id : dateComparison;
                      });
                    const selectedReport = sortedReports[chartElement.index];
                    window.location.href = `/reports/${selectedReport.id}`;
                  }
                },
              }}
            />
          ) : (
            <p className="text-center text-gray-500">No se encontraron reportes.</p>
          )}
        </div>



        {/* Botones de acciones */}
        <div className="mt-8 space-x-4">
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


      </main >

      {/* Pantalla de carga */}
      {
        isLoading && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800">Generando reporte...</h2>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default StudentDetail;
