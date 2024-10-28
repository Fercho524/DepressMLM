from flask import Flask

from flask_jwt_extended import JWTManager

from flask_migrate import Migrate
from models import db,insertar_roles_por_defecto

from routes import *

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
app.register_blueprint(user_bp)
app.register_blueprint(student_bp)
app.register_blueprint(report_bp)


if __name__ == "__main__":
    app.run(debug=True)