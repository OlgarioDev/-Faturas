# backend/app/routes/invoices.py

from flask import Blueprint, request, jsonify
from app.models.invoice import Invoice, InvoiceLine
from app.extensions import db
from app.middleware import require_auth
from datetime import datetime
import traceback
from app.utils.sequence import generate_document_number

# Usando um nome de blueprint seguro para evitar conflitos de registo
invoices_bp = Blueprint('invoices_api_v1', __name__)

@invoices_bp.route('/', methods=['POST'])
@require_auth
def create_invoice(current_user): 
    data = request.get_json()
    
    # 1. Validação Básica
    if not data or not data.get('client_id') or not data.get('items'):
        return jsonify({"error": "Dados incompletos (Cliente e Itens são obrigatórios)"}), 400

    try:
        # 2. Preparar Variáveis e Datas
        due_date_str = data.get('due_date')
        parsed_due_date = None
        if due_date_str:
            parsed_due_date = datetime.fromisoformat(due_date_str.replace('Z', ''))

        # EXTRAÇÃO DAS VARIÁVEIS ANTES DO USO
        document_type = data.get('document_type', 'Factura')
        related_id = data.get('related_document_id')

        # 3. Gerar Número Sequencial (Tarefa 6)
        doc_number = generate_document_number(current_user.company_id, document_type)

        # 4. Criar a instância da Fatura (Cabeçalho)
        new_invoice = Invoice(
            company_id=current_user.company_id,
            client_id=data.get('client_id'),
            document_type=document_type,
            document_number=doc_number,
            related_document_id=related_id,
            status='Emitida', # Documentos com número sequencial são considerados emitidos
            due_date=parsed_due_date,
            observations=data.get('observations', '') 
        )

        # LÓGICA DE NOTA DE CRÉDITO (Tarefa 5)
        if document_type == 'NC' and related_id:
            original_inv = Invoice.query.filter_by(
                id=related_id, 
                company_id=current_user.company_id
            ).first()
            
            if original_inv:
                original_inv.status = 'Anulada'

        total_net = 0
        total_tax = 0

        # 5. Processar as Linhas (Itens)
        for item in data.get('items'):
            qty = float(item.get('quantity', 1))
            price = float(item.get('unit_price', 0))
            tax_percentage = float(item.get('tax_percentage', 14))
            discount = float(item.get('discount', 0)) 
            
            # Cálculo considerando desconto por linha (Tarefa 2)
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

        # 6. Atualizar Totais Finais
        new_invoice.total_net = total_net
        new_invoice.total_tax = total_tax
        new_invoice.total_gross = total_net + total_tax

        db.session.add(new_invoice)
        db.session.commit()

        return jsonify({
            "message": f"{document_type} criada com sucesso", 
            "id": new_invoice.id,
            "number": doc_number,
            "status_original": "Anulada" if document_type == 'NC' else None
        }), 201

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": f"Erro ao criar documento: {str(e)}"}), 500

@invoices_bp.route('/', methods=['GET'])
@require_auth
def get_invoices(current_user):
    try:
        invoices = Invoice.query.filter_by(company_id=current_user.company_id)\
                                .order_by(Invoice.created_at.desc()).all()
        
        results = []
        for i in invoices:
            client_name = "Consumidor Final"
            if i.client:
                client_name = getattr(i.client, 'name', getattr(i.client, 'nome', "Consumidor Final"))

            results.append({
                "id": i.id,
                "number": i.document_number or f"Rascunho ({i.id[:4]})",
                "client": client_name,
                "type": i.document_type,
                "date": i.issue_date.isoformat() if i.issue_date else datetime.utcnow().isoformat(),
                "total": float(i.total_gross or 0),
                "status": i.status or "Rascunho"
            })
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@invoices_bp.route('/<invoice_id>', methods=['GET'])
@require_auth
def get_invoice_detail(current_user, invoice_id):
    try:
        invoice = Invoice.query.filter_by(id=invoice_id, company_id=current_user.company_id).first()
        
        if not invoice:
            return jsonify({"error": "Documento não encontrado"}), 404
        
        client_obj = invoice.client
        client_name = getattr(client_obj, 'name', "Consumidor Final") if client_obj else "Consumidor Final"

        return jsonify({
            "id": invoice.id,
            "number": invoice.document_number or "Rascunho",
            "document_type": invoice.document_type,
            "related_document_id": invoice.related_document_id,
            "client": client_name,
            "date": invoice.issue_date.isoformat(),
            "total_net": float(invoice.total_net),
            "total_tax": float(invoice.total_tax),
            "total_gross": float(invoice.total_gross),
            "status": invoice.status,
            "observations": invoice.observations,
            "lines": [{
                "description": line.description,
                "quantity": line.quantity,
                "unit_price": line.unit_price,
                "discount": line.discount,
                "tax": line.tax_percentage,
                "total": line.line_total_net + line.line_total_tax
            } for line in invoice.lines]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500