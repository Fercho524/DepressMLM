"""Campos adicionales para seguimiento más profundos

Revision ID: b0a9f596a99e
Revises: afb7a24f1027
Create Date: 2024-12-10 18:55:31.622573

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b0a9f596a99e'
down_revision = 'afb7a24f1027'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Estudiante', schema=None) as batch_op:
        batch_op.add_column(sa.Column('intervalo_diagnostico_modelo', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('ultima_interaccion', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('objetivos_terapeuticos', sa.Text(), nullable=True))

    with op.batch_alter_table('Reporte', schema=None) as batch_op:
        batch_op.add_column(sa.Column('nota_psicologo', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('nivel_severidad', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('hora_reporte', sa.Time(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Reporte', schema=None) as batch_op:
        batch_op.drop_column('hora_reporte')
        batch_op.drop_column('nivel_severidad')
        batch_op.drop_column('nota_psicologo')

    with op.batch_alter_table('Estudiante', schema=None) as batch_op:
        batch_op.drop_column('objetivos_terapeuticos')
        batch_op.drop_column('ultima_interaccion')
        batch_op.drop_column('intervalo_diagnostico_modelo')

    # ### end Alembic commands ###
