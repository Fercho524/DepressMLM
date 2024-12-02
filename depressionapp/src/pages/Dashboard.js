import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
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

    fetchUser();
  }, []);

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} />
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-800">
          {user.sexo == "M" ? "Bienvenido" : "Bienvenida"}, {user.nombre}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          {user.rol == "Administrador" ?
            <span className="font-medium text-gray-700">Administración</span>
            : <span className="font-medium text-gray-700">Estudiantes</span>
          }
        </p>
        <p className="mt-4 text-gray-600">
          Este sistema está diseñado para facilitar la administración, consulta y gestión de información relacionada con usuarios y reportes. A continuación, encontrarás las funciones principales que puedes realizar según tu rol.
        </p>

        {user.rol === "Administrador" ? (
          <div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Administración</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Gestionar usuarios del sistema, incluyendo creación, actualización y eliminación.</li>
              <li>Supervisar los reportes generados por los psicólogos.</li>
              <li>Configurar permisos y roles para cada usuario.</li>
              <li>Acceso completo a las funciones de auditoría y reportes globales.</li>
            </ul>
          </div>
        ) : user.rol === "Psicólogo" ? (
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Psicólogos</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Crear reportes detallados sobre estudiantes.</li>
              <li>Consultar el historial de reportes asociados a cada estudiante.</li>
              <li>Generar y descargar reportes en formato PDF.</li>
              <li>Realizar análisis sobre perfiles de redes sociales y estados emocionales.</li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">Estudiantes</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Consultar tu historial de reportes psicológicos.</li>
              <li>Acceder a recursos de bienestar y orientación emocional.</li>
              <li>Comunicarte con el equipo de psicólogos para recibir ayuda.</li>
            </ul>
          </div>
        )}


      </main>
    </div>
  );
};

export default Dashboard;
