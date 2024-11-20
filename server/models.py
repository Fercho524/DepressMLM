from flask_sqlalchemy import SQLAlchemy

from werkzeug.security import generate_password_hash,check_password_hash


db = SQLAlchemy()


class Rol(db.Model):
    __tablename__ = 'Rol'
    id = db.Column(db.Integer, primary_key=True)
    nombre_rol = db.Column(db.String(50), nullable=False)

    def __init__(self, nombre_rol):
        self.nombre_rol = nombre_rol


class Usuario(db.Model):
    __tablename__ = 'Usuario'
    id = db.Column(db.Integer, primary_key=True)
    rol_id = db.Column(db.Integer, db.ForeignKey('Rol.id'), nullable=False)
    nombre = db.Column(db.String(255), nullable=False)
    sexo = db.Column(db.String(1))
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)

    rol = db.relationship('Rol', backref='usuarios')

    def __init__(self, nombre, sexo, email, rol_id):
        self.nombre = nombre
        self.sexo = sexo
        self.email = email
        self.rol_id = rol_id

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


class Reporte(db.Model):
    __tablename__ = 'Reporte'
    id = db.Column(db.Integer, primary_key=True)
    id_usuario_psicologo = db.Column(db.Integer, db.ForeignKey('Usuario.id'), nullable=False)
    id_estudiante = db.Column(db.Integer, db.ForeignKey('Estudiante.boleta'), nullable=False)
    texto_reporte = db.Column(db.Text, nullable=False)  # Cambiado a db.Text para longitud variable
    num_publicaciones = db.Column(db.Integer, nullable=False)
    ruta_archivo_pdf = db.Column(db.String(255), nullable=False)
    perfil_facebook = db.Column(db.String(255))
    prob_depresion = db.Column(db.Float)
    fecha_reporte = db.Column(db.Date, nullable=False)

    usuario_psicologo = db.relationship('Usuario', backref='reportes', foreign_keys=[id_usuario_psicologo])
    estudiante = db.relationship('Estudiante', backref='reportes', foreign_keys=[id_estudiante])


class Estudiante(db.Model):
    __tablename__ = 'Estudiante'
    boleta = db.Column(db.Integer, primary_key=True)
    ultimo_reporte = db.Column(db.Integer, db.ForeignKey('Reporte.id'))
    email_saes = db.Column(db.String(255), nullable=False, unique=True)
    nombre = db.Column(db.String(255), nullable=False)
    perfil_facebook_actual = db.Column(db.String(255))
    prob_depresion = db.Column(db.Float)

    reporte = db.relationship('Reporte', backref='estudiantes', foreign_keys=[ultimo_reporte])


def insertar_roles_por_defecto():
    roles = ["Administrador", "Psicólogo"]
    for nombre_rol in roles:
        if not Rol.query.filter_by(nombre_rol=nombre_rol).first():
            db.session.add(Rol(nombre_rol=nombre_rol))
    db.session.commit()


def get_user_by_email(email):
    return Usuario.query.filter_by(email=email).first()
