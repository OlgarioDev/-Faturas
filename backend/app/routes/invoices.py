# backend/app/routes/invoices.py

from flask import Blueprint, request, jsonify
from app.models.invoice import Invoice, InvoiceLine
from app.extensions import db
from app.middleware import require_auth
from datetime import datetime

# Usando um nome de blueprint seguro para evitar conflitos de registo
invoices_bp = Blueprint('invoices_api_v1', __name__)

@invoices_bp.route('/', methods=['POST'])
@require_auth
def create_invoice():
    data = request.get_json()
    
    # 1. Validação Básica
    if not data or not data.get('client_id') or not data.get('items'):
        return jsonify({"error": "Dados incompletos (Cliente e Itens são obrigatórios)"}), 400

    try:
        # 2. Criar a instância da Fatura (Cabeçalho)
        # O company_id 1 é usado como padrão até implementar multi-empresa real
        new_invoice = Invoice(
            company_id=1, 
            client_id=data.get('client_id'),
            document_type=data.get('document_type', 'Factura'),
            status='Rascunho',
            due_date=datetime.fromisoformat(data.get('due_date').replace('Z', '')) if data.get('due_date') else None
        )

        total_net = 0
        total_tax = 0

        # 3. Processar as Linhas (Itens)
        for item in data.get('items'):
            qty = float(item.get('quantity', 1))
            price = float(item.get('unit_price', 0))
            tax_rate = float(item.get('tax_percentage', 14)) / 100
            
            line_net = qty * price
            line_tax = line_net * tax_rate
            
            total_net += line_net
            total_tax += line_tax

            line = InvoiceLine(
                product_id=item.get('product_id'),
                description=item.get('description'),
                quantity=qty,
                unit_price=price,
                tax_percentage=item.get('tax_percentage', 14),
                line_total_net=line_net,
                line_total_tax=line_tax
            )
            new_invoice.lines.append(line)

        # 4. Atualizar Totais Finais
        new_invoice.total_net = total_net
        new_invoice.total_tax = total_tax
        new_invoice.total_gross = total_net + total_tax

        db.session.add(new_invoice)
        db.session.commit()

        return jsonify({
            "message": "Fatura criada com sucesso", 
            "id": new_invoice.id,
            "total": new_invoice.total_gross
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao criar fatura: {str(e)}"}), 500

@invoices_bp.route('/', methods=['GET'])
@require_auth
def get_invoices():
    try:
        # Lista faturas da mais recente para a mais antiga
        invoices = Invoice.query.order_by(Invoice.created_at.desc()).all()
        
        results = []
        for i in invoices:
            results.append({
                "id": i.id,
                "number": i.document_number or "Rascunho",
                # Proteção: se o cliente não for encontrado, não quebra a API
                "client": i.client.name if i.client else "Consumidor Final",
                "date": i.issue_date.isoformat(),
                "total": i.total_gross,
                "status": i.status
            })
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao listar faturas: {str(e)}"}), 500

@invoices_bp.route('/<invoice_id>', methods=['GET'])
@require_auth
def get_invoice_detail(invoice_id):
    try:
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return jsonify({"error": "Documento não encontrado"}), 404
        
        return jsonify({
            "id": invoice.id,
            "number": invoice.document_number,
            "document_type": invoice.document_type,
            "client": invoice.client.name if invoice.client else "Consumidor Final",
            "client_nif": invoice.client.nif if invoice.client else "999999999",
            "date": invoice.issue_date.isoformat(),
            "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
            "total_net": invoice.total_net,
            "total_tax": invoice.total_tax,
            "total_gross": invoice.total_gross,
            "status": invoice.status,
            "lines": [{
                "description": line.description,
                "quantity": line.quantity,
                "unit_price": line.unit_price,
                "tax_percentage": line.tax_percentage
            } for line in invoice.lines]
        }), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao obter detalhe: {str(e)}"}), 500

@invoices_bp.route('/<invoice_id>', methods=['PUT'])
@require_auth
def update_invoice_status(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({"error": "Fatura não encontrada"}), 404
        
    data = request.get_json()
    if data and 'status' in data:
        invoice.status = data['status']
        
    try:
        db.session.commit()
        return jsonify({"message": "Estado atualizado com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500