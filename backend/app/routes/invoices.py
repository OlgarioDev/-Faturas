# backend/app/routes/invoices.py

from flask import Blueprint, request, jsonify
from app.models.invoice import Invoice, InvoiceLine
from app.extensions import db
from app.middleware import require_auth
from datetime import datetime
import traceback

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
        due_date_str = data.get('due_date')
        parsed_due_date = None
        if due_date_str:
            # Limpa o 'Z' do formato ISO se necessário
            parsed_due_date = datetime.fromisoformat(due_date_str.replace('Z', ''))

        new_invoice = Invoice(
            company_id=1, 
            client_id=data.get('client_id'),
            document_type=data.get('document_type', 'Factura'),
            status='Rascunho',
            due_date=parsed_due_date,
            # Adicionado suporte a observações se o modelo permitir
            observations=data.get('observations', '') 
        )

        total_net = 0
        total_tax = 0

        # 3. Processar as Linhas (Itens)
        for item in data.get('items'):
            qty = float(item.get('quantity', 1))
            price = float(item.get('unit_price', 0))
            tax_percentage = float(item.get('tax_percentage', 14))
            tax_rate = tax_percentage / 100
            
            line_net = qty * price
            line_tax = line_net * tax_rate
            
            total_net += line_net
            total_tax += line_tax

            line = InvoiceLine(
                product_id=item.get('product_id'),
                description=item.get('description', 'Sem descrição'),
                quantity=qty,
                unit_price=price,
                tax_percentage=tax_percentage,
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
        print(f"ERRO POST /invoices: {str(e)}")
        return jsonify({"error": f"Erro ao criar fatura: {str(e)}"}), 500

@invoices_bp.route('/', methods=['GET'])
@require_auth
def get_invoices():
    try:
        invoices = Invoice.query.order_by(Invoice.created_at.desc()).all()
        
        results = []
        for i in invoices:
            # Uso de getattr para evitar erro caso o campo mude entre 'name' e 'nome'
            client_name = "Consumidor Final"
            if i.client:
                client_name = getattr(i.client, 'name', getattr(i.client, 'nome', "Consumidor Final"))

            results.append({
                "id": i.id,
                "number": i.document_number or "Rascunho",
                "client": client_name,
                "date": i.issue_date.isoformat() if i.issue_date else datetime.utcnow().isoformat(),
                "total": float(i.total_gross or 0),
                "status": i.status or "Rascunho"
            })
            
        return jsonify(results), 200
    except Exception as e:
        print(f"ERRO GET /invoices: {str(e)}")
        return jsonify({"error": f"Erro ao listar faturas: {str(e)}"}), 500

@invoices_bp.route('/<invoice_id>', methods=['GET'])
@require_auth
def get_invoice_detail(invoice_id):
    try:
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return jsonify({"error": "Documento não encontrado"}), 404
        
        # Extração segura de dados do cliente
        client_obj = invoice.client
        client_name = "Consumidor Final"
        client_nif = "999999999"
        client_addr = "Morada não registada"

        if client_obj:
            client_name = getattr(client_obj, 'name', getattr(client_obj, 'nome', client_name))
            client_nif = getattr(client_obj, 'nif', client_nif)
            client_addr = getattr(client_obj, 'endereco', getattr(client_obj, 'address', client_addr))

        return jsonify({
            "id": invoice.id,
            "number": invoice.document_number or f"FT {invoice.id[:8]}",
            "document_type": invoice.document_type or "Factura",
            "client": client_name,
            "client_nif": client_nif,
            "client_address": client_addr,
            "date": invoice.issue_date.isoformat() if invoice.issue_date else None,
            "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
            "total_net": float(invoice.total_net or 0),
            "total_tax": float(invoice.total_tax or 0),
            "total_gross": float(invoice.total_gross or 0),
            "status": invoice.status or "Rascunho",
            "observations": getattr(invoice, 'observations', ""),
            "lines": [{
                "description": line.description or "Item",
                "quantity": float(line.quantity or 0),
                "unit_price": float(line.unit_price or 0),
                "tax_percentage": float(getattr(line, 'tax_percentage', 14))
            } for line in invoice.lines]
        }), 200
    except Exception as e:
        print(f"--- ERRO CRÍTICO NO DETALHE DA FATURA ---")
        traceback.print_exc() # Isso imprime o erro exato no teu terminal Python
        return jsonify({"error": str(e)}), 500

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