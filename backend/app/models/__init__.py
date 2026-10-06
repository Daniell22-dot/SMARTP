# Models package - import models directly from their modules to avoid circular imports
# Example: from app.models.user import User
# Example: from app.models.property import Property
import importlib
import logging
import pkgutil

logger = logging.getLogger(__name__)


def import_all_models() -> None:
    """Import every model module so all tables are registered on Base.metadata.

    Called before schema creation; safe to call repeatedly (already imported
    modules are cached by Python).
    """
    for module_info in pkgutil.iter_modules(__path__):
        importlib.import_module(f"{__name__}.{module_info.name}")
