from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260816_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "notes",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_notes_title", "notes", ["title"])
    op.create_index("ix_notes_updated_at", "notes", ["updated_at"])
    op.create_table(
        "note_links",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("source_note_id", sa.String(length=36), nullable=False),
        sa.Column("target_title", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["source_note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("source_note_id", "target_title", name="uq_note_link_target"),
    )
    op.create_index("ix_note_links_target_title", "note_links", ["target_title"])
    op.create_table(
        "app_settings",
        sa.Column("key", sa.String(length=100), primary_key=True),
        sa.Column("value", sa.String(length=500), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("app_settings")
    op.drop_index("ix_note_links_target_title", table_name="note_links")
    op.drop_table("note_links")
    op.drop_index("ix_notes_updated_at", table_name="notes")
    op.drop_index("ix_notes_title", table_name="notes")
    op.drop_table("notes")
