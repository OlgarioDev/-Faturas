"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer, FileText } from "lucide-react";

function InvoiceViewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    // 1. Carregar a Factura
    const savedInvoices = JSON.parse(localStorage.getItem("system_invoices") || "[]");
    const foundInvoice = savedInvoices.find((inv: any) => inv.id === decodeURIComponent(params.id as string));
    setInvoice(foundInvoice);

    // 2. Carregar Dados da Empresa (Configurações)
    const savedSettings = JSON.parse(localStorage.getItem("company_settings") || "{}");
    setCompany(savedSettings);

    // Auto-imprimir se solicitado
    if (foundInvoice && searchParams.get("print") === "true") {
      setTimeout(() => window.print(), 800);
    }
  }, [params.id]);

  if (!invoice || !company) return <div className="p-20 text-center font-black animate-pulse">CARREGANDO DADOS...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white">
      {/* TOOLBAR */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all">
          <ArrowLeft size={16} /> Voltar ao Arquivo
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-700 transition-all">
          <Printer size={16} className="inline mr-2" /> Imprimir Documento
        </button>
      </div>

      {/* FOLHA A4 */}
      <div className="max-w-[850px] mx-auto bg-white shadow-2xl p-10 md:p-14 print:shadow-none print:p-8 min-h-[1100px] flex flex-col text-slate-800 font-sans">
        
        {/* CABEÇALHO - EMPRESA À ESQUERDA / CLIENTE À DIREITA */}
        <div className="grid grid-cols-2 gap-10 mb-12">
          {/* Dados da Empresa Emissora */}
          <div>
            <h2 className="text-2xl font-black uppercase italic leading-none mb-2 text-slate-900">
              {company.name || "NOME DA EMPRESA"}
            </h2>
            <div className="text-[11px] space-y-0.5 text-slate-600">
              <p>{company.address || "Endereço não configurado"}</p>
              <p>Luanda - Angola</p>
              <p>Tel: {company.phone || "(244) 000 000 000"}</p>
              <p>E-mail: {company.email || "geral@empresa.ao"}</p>
              <p className="font-bold text-slate-900">Contribuinte: {company.nif || "0000000000"}</p>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Exmo.(s) Sr(s)</p>
            <h3 className="text-sm font-black uppercase text-slate-900 mb-2">{invoice.clientName}</h3>
            <div className="text-[11px] space-y-0.5 text-slate-600">
               <p>{invoice.clientAddress || "Angola"}</p>
               <p className="font-bold text-slate-900 italic">Contribuinte: {invoice.clientNif || "Consumidor Final"}</p>
            </div>
          </div>
        </div>

        {/* IDENTIFICAÇÃO DO DOCUMENTO */}
        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-8">
           <div>
              <span className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase rounded">Original</span>
              <h1 className="text-xl font-black uppercase mt-2 italic">{invoice.type === 'FT' ? 'Factura' : 'Factura Recibo'} n.º {invoice.id}</h1>
           </div>
           <div className="text-right text-[11px] font-bold">
              <p>Data de emissão: <span className="font-black italic">{invoice.date}</span></p>
              <p>Vencimento: <span className="font-black italic">{invoice.vencimento || 'Pronto Pagamento'}</span></p>
           </div>
        </div>

        {/* TABELA DE ITENS (CONFORME O PDF) */}
        <div className="flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-slate-900 text-[10px] font-black uppercase tracking-wider bg-slate-50">
                <th className="py-2 pl-2">Código</th>
                <th className="py-2">Descrição</th>
                <th className="py-2 text-right">Preço Uni.</th>
                <th className="py-2 text-center">Qtd.</th>
                <th className="py-2 text-center">Taxa/IVA %</th>
                <th className="py-2 text-center">Dsc. %</th>
                <th className="py-2 text-right pr-2">Total</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-700">
              {invoice.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 pl-2 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 uppercase">{item.name}</td>
                  <td className="py-3 text-right">{Number(item.price).toLocaleString()} Kz</td>
                  <td className="py-3 text-center">{item.qty}</td>
                  <td className="py-3 text-center">{invoice.taxAmount > 0 ? "14.00%" : "0.00%"}</td>
                  <td className="py-3 text-center">{item.discount || 0}.00%</td>
                  <td className="py-3 text-right pr-2 font-black">
                    {((item.qty * item.price) * (1 - (item.discount || 0)/100)).toLocaleString()} Kz
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QUADROS FINAIS (IMPOSTO E SUMÁRIO) */}
        <div className="grid grid-cols-2 gap-10 mt-10">
          {/* Quadro de Impostos */}
          <div>
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-slate-900 font-black uppercase tracking-widest">
                  <th className="py-1 text-left">Imposto/IVA</th>
                  <th className="py-1 text-right">Incidência</th>
                  <th className="py-1 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                <tr>
                  <td className="py-2">{invoice.taxAmount > 0 ? "IVA (14%)" : "Isento (0%)"}</td>
                  <td className="py-2 text-right">{(invoice.total - (invoice.taxAmount || 0)).toLocaleString()} Kz</td>
                  <td className="py-2 text-right">{(invoice.taxAmount || 0).toLocaleString()} Kz</td>
                </tr>
              </tbody>
            </table>
            
            {/* Observações e Bancos */}
            <div className="mt-8 text-[10px] space-y-4">
              <div>
                <p className="font-black uppercase border-b w-fit mb-1">Dados Bancários</p>
                {company.banks?.map((bank: any, i: number) => (
                  <p key={i} className="font-bold uppercase">{bank.name}: <span className="text-slate-500 font-medium">{bank.iban}</span></p>
                )) || <p className="italic opacity-50">Nenhuma conta bancária configurada</p>}
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <p className="font-black uppercase mb-1">Observações</p>
                 <p className="text-slate-500 italic leading-relaxed uppercase">{invoice.observations || "Os bens/serviços foram colocados à disposição do adquirente na data e local do documento."}</p>
              </div>
            </div>
          </div>

          {/* Sumário Final */}
          <div className="flex flex-col items-end">
            <h4 className="text-[10px] font-black uppercase border-b-2 border-slate-900 w-full text-right pb-1 mb-2">Sumário</h4>
            <div className="w-full space-y-1.5 text-[11px] font-bold">
               <div className="flex justify-between"><span>Total ilíquido:</span><span>{(invoice.total - (invoice.taxAmount || 0)).toLocaleString()} Kz</span></div>
               <div className="flex justify-between"><span>Desconto:</span><span>{(invoice.discountAmount || 0).toLocaleString()} Kz</span></div>
               <div className="flex justify-between"><span>Sem Imposto/IVA:</span><span>{(invoice.total - (invoice.taxAmount || 0)).toLocaleString()} Kz</span></div>
               <div className="flex justify-between text-blue-600"><span>Imposto/IVA:</span><span>{(invoice.taxAmount || 0).toLocaleString()} Kz</span></div>
               <div className="flex justify-between text-lg font-black border-t-2 border-slate-900 pt-2 mt-2">
                 <span>Total:</span>
                 <span className="italic underline decoration-double">{Number(invoice.total).toLocaleString()} Kz</span>
               </div>
            </div>
            
            {/* Regime e Validação AGT */}
            <div className="mt-12 text-right">
               <p className="text-[10px] font-black uppercase mb-1">Regime de IVA</p>
               <p className="text-[11px] font-bold text-slate-500 uppercase italic mb-6">
                 {invoice.taxAmount === 0 ? "Regime de Exclusão (Art. 16.º)" : "Regime Geral"}
               </p>
               <div className="text-center pt-6 border-t border-dashed border-slate-300">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Processado por Software Validado n.º 000/AGT/2026 • +Facturas v1.0
                  </p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InvoiceViewContent />
    </Suspense>
  );
}