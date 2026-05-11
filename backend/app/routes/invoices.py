# backend/app/routes/invoices.py
from flask import Blueprint, request, jsonify
from app.models.invoice import Invoice, InvoiceLine
from app.models.core import User # Importante para o company_id
from app.extensions import db
from app.middleware import require_auth
from datetime import datetime
import traceback
from app.utils.sequence import generate_document_number

# O nome da variável TEM de ser exatamente invoices_bp para o __init__.py funcionar
invoices_bp = Blueprint('invoices', __name__)

def get_local_user():
    """Auxiliar para buscar o utilizador da DB local usando o ID do Supabase"""
    supabase_user = getattr(request, 'current_user', None)
    if not supabase_user:
        return None
    return User.query.filter_by(supabase_auth_id=supabase_user.get('id')).first()

@invoices_bp.route('/', methods=['POST'])
@require_auth
def create_invoice(): # REMOVIDO current_user
    user = get_local_user()
    if not user:
        return jsonify({"error": "Utilizador não sincronizado"}), 401

    data = request.get_json()
    
    if not data or not data.get('client_id') or not data.get('items'):
        return jsonify({"error": "Dados incompletos (Cliente e Itens são obrigatórios)"}), 400

    try:
        due_date_str = data.get('due_date')
        parsed_due_date = None
        if due_date_str:
            parsed_due_date = datetime.fromisoformat(due_date_str.replace('Z', ''))

        document_type = data.get('document_type', 'Factura')
        related_id = data.get('related_document_id')

        # Agora usamos o user.company_id da nossa DB
        doc_number = generate_document_number(user.company_id, document_type)

        new_invoice = Invoice(
            company_id=user.company_id,
            client_id=data.get('client_id'),
            document_type=document_type,
            document_number=doc_number,
            related_document_id=related_id,
            status='Emitida',
            due_date=parsed_due_date,
            observations=data.get('observations', '') 
        )

        # Lógica de Nota de Crédito
        if document_type == 'NC' and related_id:
            original_inv = Invoice.query.filter_by(
                id=related_id, 
                company_id=user.company_id
            ).first()
            if original_inv:
                original_inv.status = 'Anulada'

        total_net = 0
        total_tax = 0

        for item in data.get('items'):
            qty = float(item.get('quantity', 1))
            price = float(item.get('unit_price', 0))
            tax_percentage = float(item.get('tax_percentage', 14))
            discount = float(item.get('discount', 0)) 
            
            net_before_discount = qty * price
            line_net = net_before_discount * (1 - (discount / 100))
            line_tax = line_net * (tax_percentage / 100)
            
            total_net += line_net
            total_tax += line_tax

            line = InvoiceLine(
                product_id=item.get('product_id'),
                description=item.get('description', 'Sem descrição'),
                quantity=qty,
                unit_price=price,
                tax_percentage=tax_percentage,
                discount=discount,
                line_total_net=line_net,
                line_total_tax=line_tax
            )
            new_invoice.lines.append(line)

        new_invoice.total_net = total_net
        new_invoice.total_tax = total_tax
        new_invoice.total_gross = total_net + total_tax

        db.session.add(new_invoice)
        db.session.commit()

        return jsonify({
            "message": f"{document_type} criada com sucesso", 
            "id": new_invoice.id,
            "number": doc_number
        }), 201

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@invoices_bp.route('/', methods=['GET'])
@require_auth
def get_invoices(): # REMOVIDO current_user
    user = get_local_user()
    try:
        invoices = Invoice.query.filter_by(company_id=user.company_id)\
                          .order_by(Invoice.created_at.desc()).all()
        
        results = []
        for i in invoices:
            client_name = "Consumidor Final"
            if i.client:
                client_name = getattr(i.client, 'name', "Consumidor Final")

            results.append({
                "id": i.id,
                "number": i.document_number or f"Rascunho",
                "client": client_name,
                "type": i.document_type,
                "date": i.created_at.isoformat() if hasattr(i, 'created_at') else datetime.utcnow().isoformat(),
                "total": float(i.total_gross or 0),
                "status": i.status or "Rascunho"
            })
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@invoices_bp.route('/<invoice_id>', methods=['GET'])
@require_auth
def get_invoice_detail(invoice_id): # REMOVIDO current_user
    user = get_local_user()
    try:
        invoice = Invoice.query.filter_by(id=invoice_id, company_id=user.company_id).first()
        
        if not invoice:
            return jsonify({"error": "Documento não encontrado"}), 404
        
        return jsonify({
            "id": invoice.id,
            "number": invoice.document_number or "Rascunho",
            "document_type": invoice.document_type,
            "client": getattr(invoice.client, 'name', "Consumidor Final") if invoice.client else "Consumidor Final",
            "total_gross": float(invoice.total_gross),
            "status": invoice.status,
            "lines": [{
                "description": l.description,
                "quantity": l.quantity,
                "unit_price": l.unit_price,
                "total": float(l.line_total_net + l.line_total_tax)
            } for l in invoice.lines]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500