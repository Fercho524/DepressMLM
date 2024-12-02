import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";

const UserDetails = () => {
  const { userId } = useParams(); // Obtenemos el ID del usuario desde la URL
  const navigate = useNavigate(); // Para redirigir después de eliminar o actualizar
  const [user, setUser] = useState(null); // Estado para almacenar los detalles del usuario
  const [currentUser, setCurrentUser] = useState(null); // Estado para almacenar el usuario actual (Sidebar)
  const [reports, setReports] = useState([]); // Estado para almacenar los reportes del usuario
  const [loadingReports, setLoadingReports] = useState(true); // Estado para mostrar el estado de carga de reportes

  // Obtener el usuario actual para la Sidebar
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/user/id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data);
    } catch (err) {
      console.error("Error al obtener información del usuario:", err);
      alert("Error al obtener información del usuario. Inicia sesión nuevamente.");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  // Obtener los detalles del usuario
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (err) {
      alert("Error al obtener los detalles del usuario");
    }
  };

  // Obtener los reportes asociados al usuario
  const fetchUserReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/report/user-reports?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data);
    } catch (err) {
      console.error("Error al obtener los reportes del usuario:", err);
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUserDetails();
    fetchUserReports();
  }, [userId]);

  const handleDeleteUser = async () => {
    if (reports.length > 0) {
      alert("No se puede eliminar un usuario con reportes asociados.");
      return;
    }

    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Usuario eliminado con éxito");
        navigate("/users"); // Redirigir a la lista de usuarios después de eliminar
      } catch (err) {
        alert("Error al eliminar el usuario");
      }
    }
  };

  const handleUpdateUser = () => {
    navigate(`/users/update/${userId}`); // Redirigir a la página de actualización de usuario
  };

  if (!currentUser) {
    return <div>Cargando información del usuario...</div>;
  }

  if (!user) {
    return <div>Cargando detalles del usuario...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar user={currentUser} />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Detalles del Usuario</h1>
          <a
            href="/users"
            className="text-blue-500 hover:underline text-lg"
          >
            Volver a la Lista de Usuarios
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <div className="mb-4">
            <strong className="block text-gray-700">Nombre:</strong> {user.nombre}
          </div>
          <div className="mb-4">
            <strong className="block text-gray-700">Email:</strong> {user.email}
          </div>
          <div className="mb-4">
            <strong className="block text-gray-700">Sexo:</strong> {user.sexo}
          </div>
          <div className="mb-4">
            <strong className="block text-gray-700">Rol:</strong>
            {user.rol_id === 1 ? "Administrador" : "Psicólogo"}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Reportes Asociados</h2>
            {loadingReports ? (
              <p>Cargando reportes...</p>
            ) : reports.length > 0 ? (
              <ul className="list-disc ml-6 mt-2">
                {reports.map((report) => (
                  <li key={report.id}>
                    Reporte #{report.id} - Fecha: {report.fecha_reporte}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay reportes asociados a este usuario.</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleUpdateUser}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
            >
              Actualizar Cuenta
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
            >
              Eliminar Usuario
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDetails;
