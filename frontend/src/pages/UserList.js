import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal
  const [newUser, setNewUser] = useState({
    nombre: "",
    sexo: "",
    email: "",
    password: "",
    rol_id: 1,
  });

  // Obtener la lista de usuarios
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/user/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      alert("Error al obtener los usuarios");
    }
  };

  // Obtener el usuario actual para la Sidebar
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

  // Filtrar usuarios en tiempo real según la búsqueda
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    if (event.target.value) {
      const filtered = users.filter((user) =>
        user.nombre.toLowerCase().includes(event.target.value.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  // Manejar cambios en el formulario del modal
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({ ...prevState, [name]: value }));
  };

  // Crear un nuevo usuario
  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Validar que todos los campos requeridos están completos
      if (!newUser.email || !newUser.password || !newUser.rol_id || !newUser.nombre || !newUser.sexo) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return;
      }

      // Enviar la solicitud a la API
      await api.post(
        "/user",
        {
          email: newUser.email,
          password: newUser.password,
          rol_id: Number(newUser.rol_id), // Asegurarse de que `rol_id` sea numérico
          nombre: newUser.nombre,
          sexo: newUser.sexo,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Usuario creado con éxito");
      setShowModal(false); // Cierra el modal
      fetchUsers(); // Actualiza la lista de usuarios
    } catch (err) {
      console.error("Error al crear el usuario:", err);

      // Verificar si el error tiene una respuesta de la API
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("No se pudo crear el usuario. Revisa los datos e inténtalo de nuevo.");
      }
    }
  };


  useEffect(() => {
    fetchUsers();
    fetchUser();
  }, []);

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar user={user} />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Lista de Usuarios</h1>

        {/* Barra de búsqueda y botón de agregar usuario */}
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={search}
            onChange={handleSearchChange}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => setShowModal(true)}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            Agregar Usuario
          </button>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-100">
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4">{user.nombre}</td>
                    <td className="py-3 px-4">{user.rol_id === 1 ? "Administrador" : "Psicólogo"}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/users/details/${user.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        Ver Detalles
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-3 px-4 text-center text-gray-500">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal para agregar usuario */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Agregar Usuario</h2>
              <form onSubmit={handleCreateUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={newUser.nombre}
                    onChange={handleModalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Sexo</label>
                  <select
                    name="sexo"
                    value={newUser.sexo}
                    onChange={handleModalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleModalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleModalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    name="rol_id"
                    value={newUser.rol_id}
                    onChange={handleModalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="1">Administrador</option>
                    <option value="2">Psicólogo</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserList;
