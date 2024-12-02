import React from "react";

const Sidebar = ({ user }) => {
  if (!user) return null; // Evita que el Sidebar se renderice si no hay un usuario

  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-6">
      <h2 className="text-xl font-bold mb-6">DepressLM+</h2>
      <ul className="space-y-4">
        <li>
          <a
            href="/dashboard"
            className="block px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Inicio
          </a>
        </li>
        {(user.rol === "Psicólogo") && (
        <li>
          <a
            href="/students"
            className="block px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Estudiantes
          </a>
        </li>
         )}
        {user.rol === "Administrador" && (
          <li>
            <a
              href="/users"
              className="block px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Usuarios
            </a>
          </li>
        )}
        <li>
          <a
            href="/account"
            className="block px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Cuenta
          </a>
        </li>
        <li>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="block w-full text-left px-4 py-2 rounded-md hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;