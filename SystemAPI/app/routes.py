from datetime import timedelta
from functools import wraps

from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

from datetime import datetime

from models import get_user_by_email, db, Usuario, Rol,Estudiante,Reporte

from utils import get_model_response

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        current_user = Usuario.query.get(current_user_id)
        
        if not current_user or current_user.rol.nombre_rol != "Administrador":
            return jsonify({"msg": "Acceso denegado: solo para administradores"}), 403

        return fn(*args, **kwargs)
    
    return wrapper



auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    
    if not email or not password:
        return jsonify({"msg": "Email o contraseña no proporcionados"}), 400
    
    user = get_user_by_email(email)
    
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    # Verificar la contraseña
    if not user.check_password(password):
        return jsonify({"msg": "Credenciales inválidas"}), 401
    
    # Crear el token con el ID del usuario
    expires = timedelta(minutes=21600)
    access_token = create_access_token(identity=user.id,expires_delta=expires)
    return jsonify(access_token=access_token), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    email = request.json.get("email")
    password = request.json.get("password")
    rol_id = request.json.get("rol_id")
    nombre = request.json.get("nombre")
    sexo = request.json.get("sexo")

    # Verificar que no falten datos
    if not email or not password or not rol_id or not nombre or not sexo:
        return jsonify({"msg": "Faltan datos para el registro"}), 400

    # Crear nuevo usuario
    new_user = Usuario(
        email=email,
        rol_id=rol_id,
        nombre=nombre,
        sexo=sexo
    )

    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario registrado con éxito"}), 201


@auth_bp.route("/account/update", methods=["PUT"])
@jwt_required()
def update_account():
    current_user_id = get_jwt_identity()
    user = Usuario.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    # Obtener nuevos datos del request
    email = request.json.get("email", user.email)
    nombre = request.json.get("nombre", user.nombre)
    sexo = request.json.get("sexo", user.sexo)
    new_password = request.json.get("password")

    # Actualizar los datos
    user.email = email
    user.nombre = nombre
    user.sexo = sexo

    if new_password:
        user.set_password(new_password)

    db.session.commit()

    return jsonify({"msg": "Cuenta actualizada exitosamente"}), 200


@auth_bp.route("/account/details", methods=["GET"])
@jwt_required()
def account_details():
    # Obtener el ID del usuario actual a partir del token JWT
    current_user_id = get_jwt_identity()
    user = Usuario.query.get(current_user_id)

    # Verificar si el usuario existe
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    # Preparar los datos de la cuenta a devolver, excluyendo la contraseña
    account_data = {
        "id": user.id,
        "email": user.email,
        "nombre": user.nombre,
        "sexo": user.sexo,
        "rol": user.rol.nombre_rol
    }

    return jsonify(account_data), 200


@auth_bp.route("/account/delete", methods=["DELETE"])
@jwt_required()
def delete_account():
    current_user_id = get_jwt_identity()
    user = Usuario.query.get(current_user_id)

    if not user or user.rol.nombre_rol != "Administrador":
        return jsonify({"msg": "Acceso denegado: solo los administradores pueden eliminar cuentas"}), 403

    # Verificar que haya al menos otro administrador
    admin_count = Usuario.query.join(Rol).filter(Rol.nombre_rol == "Administrador", Usuario.id != user.id).count()
    if admin_count < 1:
        return jsonify({"msg": "Debe haber al menos otro administrador en el sistema"}), 400

    # Eliminar la cuenta del usuario
    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "Cuenta eliminada con éxito"}), 200


content_bp = Blueprint("other", __name__)


@content_bp.route("/", methods=["GET"])
@jwt_required()
def get_sensitive_data():
    current_user_id = get_jwt_identity()
    return jsonify({"msg": "Acceso permitido", "user_id": current_user_id}), 200



user_bp = Blueprint("user", __name__)





@user_bp.route("/user/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Usuario eliminado con éxito"}), 200


@user_bp.route("/user", methods=["POST"])
@admin_required
def create_user():
    data = request.get_json()
    nombre = data.get("nombre")
    sexo = data.get("sexo")
    email = data.get("email")
    password = data.get("password")
    rol_id = data.get("rol_id")
    
    if not all([nombre, sexo, email, password, rol_id]):
        return jsonify({"msg": "Faltan datos para crear el usuario"}), 400
    
    new_user = Usuario(nombre=nombre, sexo=sexo, email=email, rol_id=rol_id)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "Usuario creado con éxito"}), 201


@user_bp.route("/user/<int:user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    user_data = {
        "id": user.id,
        "nombre": user.nombre,
        "sexo": user.sexo,
        "email": user.email,
        "rol_id": user.rol_id
    }
    return jsonify(user_data), 200


@user_bp.route("/user/all", methods=["GET"])
@admin_required
def get_user_list():
    users = Usuario.query.all()
    users_data = [
        {"id": user.id, "nombre": user.nombre, "sexo": user.sexo, "email": user.email, "rol_id": user.rol_id}
        for user in users
    ]
    return jsonify(users_data), 200


@user_bp.route("/user/<int:user_id>", methods=["PUT"])
@admin_required
def update_user(user_id):
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    data = request.get_json()
    user.nombre = data.get("nombre", user.nombre)
    user.sexo = data.get("sexo", user.sexo)
    user.email = data.get("email", user.email)
    user.rol_id = data.get("rol_id", user.rol_id)
    
    db.session.commit()
    return jsonify({"msg": "Usuario actualizado con éxito"}), 200


@user_bp.route("/user", methods=["GET"])
@admin_required
def find_user_by_name():
    name = request.args.get("name")
    if not name:
        return jsonify({"msg": "Nombre no proporcionado"}), 400
    
    users = Usuario.query.filter(Usuario.nombre.ilike(f"%{name}%")).all()
    if not users:
        return jsonify({"msg": "No se encontraron usuarios con ese nombre"}), 404
    
    users_data = [{"id": user.id, "nombre": user.nombre, "email": user.email, "sexo": user.sexo, "rol_id": user.rol_id} for user in users]
    return jsonify(users_data), 200


student_bp = Blueprint("student", __name__)


@student_bp.route("/student/<int:boleta>", methods=["DELETE"])
@admin_required
def delete_student(boleta):
    student = Estudiante.query.get(boleta)
    if not student:
        return jsonify({"msg": "Estudiante no encontrado"}), 404

    db.session.delete(student)
    db.session.commit()
    return jsonify({"msg": "Estudiante eliminado con éxito"}), 200


@student_bp.route("/student", methods=["POST"])
@admin_required
def create_student():
    data = request.get_json()
    boleta = data.get("boleta")
    nombre = data.get("nombre")
    email_saes = data.get("email_saes")
    perfil_facebook_actual = data.get("perfil_facebook_actual", None)
    prob_depresion = data.get("prob_depresion", None)
    
    if not all([boleta, nombre, email_saes]):
        return jsonify({"msg": "Faltan datos para crear el estudiante"}), 400
    
    new_student = Estudiante(
        boleta=boleta,
        nombre=nombre,
        email_saes=email_saes,
        perfil_facebook_actual=perfil_facebook_actual,
        prob_depresion=prob_depresion
    )

    db.session.add(new_student)
    db.session.commit()
    return jsonify({"msg": "Estudiante creado con éxito"}), 201


@student_bp.route("/student/<int:boleta>", methods=["GET"])
@admin_required
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


@student_bp.route("/student/all", methods=["GET"])
@admin_required
def get_student_list():
    limit = request.args.get("limit", type=int, default=10)
    students = Estudiante.query.limit(limit).all()
    students_data = [
        {"boleta": student.boleta, "nombre": student.nombre, "email_saes": student.email_saes}
        for student in students
    ]
    return jsonify(students_data), 200


@student_bp.route("/student", methods=["PUT"])
@admin_required
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


@student_bp.route("/student", methods=["GET"])
@admin_required
def find_student_by_name():
    name = request.args.get("name", None)
    if not name:
        return jsonify({"msg": "Nombre o boleta no proporcionado"}), 400

    students = Estudiante.query.filter(Estudiante.nombre.ilike(f"%{name}%")).all()

    if not students:
        return jsonify({"msg": "No se encontraron estudiantes con ese nombre o boleta"}), 404

    students_data = [{"boleta": student.boleta, "nombre": student.nombre, "email_saes": student.email_saes} for student in students]
    return jsonify(students_data), 200





report_bp = Blueprint("report", __name__)


@report_bp.route("/report", methods=["POST"])
@jwt_required()
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
    texto_reporte = get_model_response("soobsluv.zip")

    # Verificar si la respuesta es un diccionario y contiene la clave "response"
    if "response" in texto_reporte.keys():
        nuevo_reporte = Reporte(
            id_usuario_psicologo=current_user_id,
            id_estudiante=estudiante_id,
            texto_reporte=texto_reporte["response"],
            num_publicaciones=0,
            ruta_archivo_pdf="ruta_de_archivo_ejemplo.pdf",
            perfil_facebook=estudiante.perfil_facebook_actual,
            prob_depresion=0.0,
            fecha_reporte=datetime.utcnow().date()
        )

        db.session.add(nuevo_reporte)
        db.session.commit()
        return jsonify({"msg": "Reporte añadido exitosamente", "data" :texto_reporte["response"] }), 201
    else:
        return jsonify({"msg": "Ocurrió un error al procesar la respuesta del modelo"}), 500



@report_bp.route("/report/<int:report_id>", methods=["DELETE"])
@jwt_required()
def delete_report(report_id):
    report = Reporte.query.get(report_id)
    if not report:
        return jsonify({"msg": "Reporte no encontrado"}), 404

    db.session.delete(report)
    db.session.commit()
    return jsonify({"msg": "Reporte eliminado con éxito"}), 200


@report_bp.route("/report", methods=["DELETE"])
@jwt_required()
def delete_reports_by_student():
    student_boleta = request.json.get("boleta")
    if not student_boleta:
        return jsonify({"msg": "Número de boleta es requerido"}), 400

    student = Estudiante.query.get(student_boleta)
    if not student:
        return jsonify({"msg": "Estudiante no encontrado"}), 404

    Reporte.query.filter_by(id_estudiante=student_boleta).delete()
    db.session.commit()
    return jsonify({"msg": "Reportes del estudiante eliminados con éxito"}), 200


@report_bp.route("/report/<int:report_id>", methods=["GET"])
@jwt_required()
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


@report_bp.route("/report/history", methods=["GET"])
@jwt_required()
def get_reports_history():
    student_boleta = request.args.get("boleta")
    if not student_boleta:
        return jsonify({"msg": "Número de boleta es requerido"}), 400

    reports = Reporte.query.filter_by(id_estudiante=student_boleta).order_by(Reporte.fecha_reporte.desc()).all()
    reports_data = [
        {
            "id": report.id,
            "texto_reporte": report.texto_reporte,
            "num_publicaciones": report.num_publicaciones,
            "fecha_reporte": report.fecha_reporte
        }
        for report in reports
    ]
    return jsonify(reports_data), 200

