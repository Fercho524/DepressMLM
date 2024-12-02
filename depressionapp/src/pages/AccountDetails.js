import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useNavigate } from "react-router-dom";

const AccountDetails = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/account/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        alert("Error al obtener los detalles de la cuenta");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    fetchUserDetails();
  }, []);

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete("/account/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Cuenta eliminada con éxito");
      localStorage.removeItem("token");
      window.location.href = "/"; // Redirigir a la página principal
    } catch (err) {
      alert("Error al eliminar la cuenta");
    }
  };

  if (!user) return <p className="text-center text-gray-600">Cargando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Detalles de la Cuenta</h1>
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <p>
            <span className="font-semibold text-gray-700">Nombre:</span> {user.nombre}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Sexo:</span> {user.sexo}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Rol:</span> {user.rol}
          </p>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => navigate("/account/edit")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Actualizar Cuenta
            </button>
            {user.rol === "Administrador" && (
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Eliminar Cuenta
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountDetails;
