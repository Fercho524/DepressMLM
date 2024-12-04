import subprocess
from flask import current_app
from flask.cli import with_appcontext
import click

@click.command("backup-db")
@with_appcontext
def backup_db():
    """Realiza una copia de seguridad de la base de datos."""
    db_uri = current_app.config['SQLALCHEMY_DATABASE_URI']
    parsed = urlparse(db_uri)

    db_name = parsed.path[1:]
    user = parsed.username
    password = parsed.password
    host = parsed.hostname
    port = parsed.port or 5432  # Puerto por defecto de PostgreSQL

    backup_file = "backup.dump"
    backup_command = [
        "pg_dump",
        "-U", user,
        "-h", host,
        "-p", str(port),
        "-d", db_name,
        "-F", "c",
        "-f", backup_file
    ]

    env = {"PGPASSWORD": password}  # Evitar que pida la contraseña
    try:
        subprocess.run(backup_command, env=env, check=True)
        print(f"Backup creado: {backup_file}")
    except subprocess.CalledProcessError as e:
        print("Error al realizar el backup:", e)

# Registrar el comando en tu aplicación Flask
def register_commands(app):
    app.cli.add_command(backup_db)
