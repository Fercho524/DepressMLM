import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";

const UserUpdate = () => {
  const { userId } = useParams(); // Obtener el ID del usuario desde la URL
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nombre: "",
    email: "",
    sexo: "",
    rol_id: "",
  });
  const [currentUser, setCurrentUser] = useState(null); // Usuario actual para el Sidebar

  // Cargar los detalles del usuario actual para el Sidebar
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

  // Cargar los detalles del usuario para su edición
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        nombre: response.data.nombre,
        email: response.data.email,
        sexo: response.data.sexo,
        rol_id: response.data.rol_id,
      });
    } catch (err) {
      alert("Error al obtener los detalles del usuario");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUserDetails();
  }, [userId]);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/user/${userId}`,
        { ...user },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Usuario actualizado con éxito");
      navigate(`/users/details/${userId}`); // Redirigir a los detalles del usuario después de actualizar
    } catch (err) {
      alert("Error al actualizar el usuario" + err);
    }
  };

  if (!currentUser) {
    return <div>Cargando información del usuario...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar user={currentUser} />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Actualizar Usuario</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-300"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={user.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Sexo</label>
            <select
              name="sexo"
              value={user.sexo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value={user.sexo == "F" ? "Femenino" : "Masculino" }>Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              name="rol_id"
              value={user.rol_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="1">Administrador</option>
              <option value="2">Psicólogo</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/users/details/${userId}`)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UserUpdate;
