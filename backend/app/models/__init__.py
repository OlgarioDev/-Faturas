# Expose models
from .core import Company, User, SubscriptionStatus
from .billing import Invoice, InvoiceLine, Tax
# backend/app/models/__init__.py
from .client import Client
from .product import Product

# Em backend/app/models/__init__.py (se tiveres este ficheiro) ou similar

from app.models.invoice import Invoice, InvoiceLine  # <-- Adiciona esta linha!
