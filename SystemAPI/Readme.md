Considera la siguiente aplicación en Flask

config.py

```python
import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "clave_secreta_por_defecto"
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "tu_secreto_para_jwt"
    
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "postgresql://postgres:524835@localhost/depression"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

db.py

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
```

app.py

```python
from flask import Flask

from flask_jwt_extended import JWTManager

from flask_migrate import Migrate
from models import db,insertar_roles_por_defecto

from routes import auth_bp,content_bp

from config import Config


# Aplicación
app = Flask(__name__)
app.config.from_object(Config)

# JWT Auth
jwt = JWTManager(app)

# Base de datos
db.init_app(app)

with app.app_context():
    db.create_all()
    insertar_roles_por_defecto() 

migrate = Migrate(app, db)

# Rutas
app.register_blueprint(auth_bp)
app.register_blueprint(content_bp)

if __name__ == "__main__":
    app.run(debug=True)
```

models.py

```python
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
    texto_reporte = db.Column(db.String(255), nullable=False)
    num_publicaciones = db.Column(db.Integer, nullable=False)
    ruta_archivo_pdf = db.Column(db.String(255), nullable=False)
    perfil_facebook = db.Column(db.String(255))
    prob_depresion = db.Column(db.Float)
    fecha_reporte = db.Column(db.Date, nullable=False)

    usuario_psicologo = db.relationship('Usuario', backref='reportes', foreign_keys=[id_usuario_psicologo])


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

```

routes.py

```python
from datetime import timedelta


from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

from models import get_user_by_email, db, Usuario, Rol

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



content_bp = Blueprint("other", __name__)


@content_bp.route("/", methods=["GET"])
@jwt_required()
def get_sensitive_data():
    current_user_id = get_jwt_identity()
    return jsonify({"msg": "Acceso permitido", "user_id": current_user_id}), 200

```

Considerando este código base debemos crear las siguientes rutas:

**Cuenta**
- DELETE account/delete : Eliminar cuenta de usuario
- UPDATE account/update : Actualizar datos de la cuenta
- POST account/recover : Recuperar contraseña

**Control de estudiantes**
- DELETE student/: Eliminar estudiante
- POST  student/ : Añadir estudiante
- GET ONE  student/:id : Obtener datos de un estudiante
- GET LIST  student/all : Lista de estudiantes con un límite
- PUT student/ :  Actualizar datos de estudiante
- FIND BY NAME student&name="Name" : Buscar por nombre o número de boleta

**Control de Usuarios  (Sólo administradores)**
- DELETE user/:id : Eliminar usuario
- POST  user/ : Añadir usuario
- GET ONE  user/:id : Ver datos de usuario exepto contraseña
- GET LIST  user/all : Ver lista de usuarios
- PUT user/:id : Actualizar usuario
- FIND BY NAME user&name="Name" :  Buscar por nombre

**Control de reportes**
- POST : report/add : Añadir reporte, esta función llama a un servidor externo, pero por ahora no la vamos a hacer.
- DELETE : report/:reportID : Elimina un único reporte
- DELETE BY ESTUDIANTE : report/ : Eliminar todos los reportes de un estudiante
- GET ONE : report/ : Ver datos de un reporte
- GET LIST BY STUDENT : report/ : Ver historial de reportes ordenados por fecha

Por el momento, guarda bien esta información, yo te diré cuando comenzar y por favor, limítate sólo a mostrar los cambios que añades.


Token admin : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczMDA1NDMwMiwianRpIjoiY2UxYmRhNTUtODQ2ZC00NWE4LWExZWUtMDFiMmE3NDBmODkwIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NCwibmJmIjoxNzMwMDU0MzAyLCJjc3JmIjoiYTBiMGI1ZTQtNTBkYi00MjIwLTlhOGItODkxN2M4MTY0MzU4IiwiZXhwIjoxNzMxMzUwMzAyfQ.Hzrz3C2O8SG4nyLbqgv1fEgTNdm4T6vXTVKXpIhwg48

Psicologo token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczMDA1NzQ3MiwianRpIjoiOTA1YTQxYzItNWY0MC00OTNkLWFhY2ItNGYzNmQxY2IzNWE5IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NiwibmJmIjoxNzMwMDU3NDcyLCJjc3JmIjoiMGUzMzkzZjEtYjNhMy00YjFkLTgyNDEtNjQzZTE2YWJjMjY2IiwiZXhwIjoxNzMxMzUzNDcyfQ.9EmwAYhJoB2nM7su8irv5DcRgKsQ2DAURwIn5X3eCYo