# DepressMLM+

Servidor y aplicación de escritorio


Nuevos cambios en la base de datos

    nota_psicologo = db.Column(db.Text, nullable=True)
    nivel_severidad = db.Column(db.String(50), nullable=True)
    hora_reporte = db.Column(db.Time, nullable=True, default=date.today())
    

Rutas de reportes por actualizar:

@report_bp.route("/report/<int:report_id>", methods=["PUT"])
@psicologo_required
def edit_report(report_id):
    report = Reporte.query.get(report_id)
    if not report:
        return jsonify({"msg": "Reporte no encontrado"}), 404

    # Obtener los datos enviados por el cliente
    data = request.json

    # Actualizar los campos del reporte si están presentes en los datos
    if "id_usuario_psicologo" in data:
        report.id_usuario_psicologo = data["id_usuario_psicologo"]
    if "id_estudiante" in data:
        report.id_estudiante = data["id_estudiante"]
    if "texto_reporte" in data:
        report.texto_reporte = data["texto_reporte"]
    if "num_publicaciones" in data:
        report.num_publicaciones = data["num_publicaciones"]
    if "ruta_archivo_pdf" in data:
        report.ruta_archivo_pdf = data["ruta_archivo_pdf"]
    if "perfil_facebook" in data:
        report.perfil_facebook = data["perfil_facebook"]
    if "prob_depresion" in data:
        report.prob_depresion = data["prob_depresion"]
    if "fecha_reporte" in data:
        report.fecha_reporte = data["fecha_reporte"]

    # Guardar los cambios en la base de datos
    try:
        db.session.commit()
        return jsonify({"msg": "Reporte actualizado con éxito"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error al actualizar el reporte: {str(e)}"}), 500


@report_bp.route("/report", methods=["POST"])
@psicologo_required
def add_report():
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)

    if not usuario or usuario.rol.nombre_rol != "Psicólogo":
        return jsonify({"msg": "Acceso denegado"}), 403

    estudiante_id = request.json.get("estudiante_id")
    estudiante = Estudiante.query.get(estudiante_id)

    if not estudiante:
        return jsonify({"msg": "Estudiante no encontrado"}), 404

    # profile_link = estudiante.perfil_facebook_actual
    # Obtener la respuesta del modelo de IA
    profile_link = request.json.get("profile_link")

    if not profile_link:
        return jsonify({"msg": "No se proporcionó perfil de facebook"}),400

    texto_reporte = get_model_response(profile_link)

    # Verificar si la respuesta es un diccionario y contiene la clave "response"
    if "response" in texto_reporte.keys():
        nuevo_reporte = Reporte(
            id_usuario_psicologo=current_user_id,
            id_estudiante=estudiante_id,
            texto_reporte=texto_reporte["user_data"],
            num_publicaciones=texto_reporte["numero_publicaciones"],
            ruta_archivo_pdf="None",
            perfil_facebook=texto_reporte["perfilFacebook"],
            prob_depresion=0.0,
            fecha_reporte=datetime.utcnow().date()
        )

        db.session.add(nuevo_reporte)
        db.session.commit()
        return jsonify({"msg": "Reporte añadido exitosamente", "data" :texto_reporte["response"] }), 201
    else:
        return jsonify({"msg": "Ocurrió un error al procesar la respuesta del modelo"}), 500



@report_bp.route("/report/<int:report_id>", methods=["GET"])
@psicologo_required
def get_report(report_id):
    report = Reporte.query.get(report_id)
    if not report:
        return jsonify({"msg": "Reporte no encontrado"}), 404

    report_data = {
        "id": report.id,
        "id_usuario_psicologo": report.id_usuario_psicologo,
        "id_estudiante": report.id_estudiante,
        "texto_reporte": report.texto_reporte,
        "num_publicaciones": report.num_publicaciones,
        "ruta_archivo_pdf": report.ruta_archivo_pdf,
        "perfil_facebook": report.perfil_facebook,
        "prob_depresion": report.prob_depresion,
        "fecha_reporte": report.fecha_reporte
    }
    return jsonify(report_data), 200






import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar"; // Importamos el Sidebar

const EditStudent = () => {
  const { boleta } = useParams(); // Obtener boleta de la URL
  const navigate = useNavigate(); // Para redirigir a otra página
  const [student, setStudent] = useState({
    nombre: "",
    email_saes: "",
    perfil_facebook_actual: "",
    prob_depresion: "",
  });
  const [user, setUser] = useState(null);  // Para almacenar el usuario

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/student/${boleta}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(response.data);
      } catch (err) {
        alert("Error al obtener los datos del estudiante");
      }
    };

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/id", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);  // Guardar el usuario
      } catch (err) {
        console.error("Error al obtener información del usuario", err);
        alert("Error al obtener información del usuario. Inicia sesión nuevamente.");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    fetchStudent();
    fetchUser();
  }, [boleta]);

  // Manejar el cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Enviar los cambios al servidor
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put(`/student`, student, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Estudiante actualizado con éxito");
      navigate(`/students/${boleta}`); // Redirigir a los detalles del estudiante
    } catch (err) {
      alert("Error al actualizar los datos del estudiante");
    }
  };

  if (!student || !user) return <p>Cargando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar, pasamos el usuario como prop */}
      <Sidebar user={user} />

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Editar Estudiante</h1>

        {/* Formulario de edición de estudiante */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-lg font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={student.nombre}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label htmlFor="email_saes" className="block text-lg font-medium text-gray-700">Email SAES</label>
                <input
                  type="email"
                  id="email_saes"
                  name="email_saes"
                  value={student.email_saes}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label htmlFor="perfil_facebook_actual" className="block text-lg font-medium text-gray-700">Perfil de Facebook</label>
                <input
                  type="text"
                  id="perfil_facebook_actual"
                  name="perfil_facebook_actual"
                  value={student.perfil_facebook_actual}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label htmlFor="prob_depresion" className="block text-lg font-medium text-gray-700">Probabilidad de Depresión</label>
                <input
                  type="text"
                  id="prob_depresion"
                  name="prob_depresion"
                  value={student.prob_depresion}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/students/${boleta}`)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditStudent;








Cambios en la tabla estudiante : 


    intervalo_diagnostico_modelo = db.Column(db.Integer, nullable=True) # Cada cierto tiempo se realiza un diagnóstico de forma automática
    ultima_interaccion = db.Column(db.Date, nullable=True)
    objetivos_terapeuticos = db.Column(db.Text, nullable=True)


Rutas por modificar : 

@student_bp.route("/student/<int:boleta>", methods=["GET"])
@psicologo_required
def get_student(boleta):
    student = Estudiante.query.get(boleta)
    if not student:
        return jsonify({"msg": "Estudiante no encontrado"}), 404
    
    student_data = {
        "boleta": student.boleta,
        "nombre": student.nombre,
        "email_saes": student.email_saes,
        "perfil_facebook_actual": student.perfil_facebook_actual,
        "prob_depresion": student.prob_depresion
    }
    return jsonify(student_data), 200

@student_bp.route("/student", methods=["PUT"])
@psicologo_required
def update_student():
    data = request.get_json()
    boleta = data.get("boleta")
    student = Estudiante.query.get(boleta)
    
    if not student:
        return jsonify({"msg": "Estudiante no encontrado"}), 404

    student.nombre = data.get("nombre", student.nombre)
    student.email_saes = data.get("email_saes", student.email_saes)
    student.perfil_facebook_actual = data.get("perfil_facebook_actual", student.perfil_facebook_actual)
    student.prob_depresion = data.get("prob_depresion", student.prob_depresion)

    db.session.commit()
    return jsonify({"msg": "Estudiante actualizado con éxito"}), 200
