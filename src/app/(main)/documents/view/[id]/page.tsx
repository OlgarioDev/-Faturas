"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import QRCode from "qrcode";
import { apiFetch } from "@/services/api";

// Função para formatar números no padrão Kwanza (Ex: 1.250.000,00)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

function InvoiceViewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docId = decodeURIComponent(params.id as string);
        const invoices = await apiFetch('/invoices/');
        const invoiceData = invoices.find((inv: any) => inv.invoice_no === docId);

        if (!invoiceData) {
          setError("Documento não encontrado no servidor.");
          return;
        }

        const mappedInvoice = {
            ...invoiceData,
            id: invoiceData.invoice_no,
            total: invoiceData.total_amount,
            type: invoiceData.invoice_type,
            vencimento: invoiceData.due_date,
            date: invoiceData.invoice_date,
            entry_date: invoiceData.system_entry_date ? new Date(invoiceData.system_entry_date).toLocaleString('pt-AO') : '---',
            items: (invoiceData.lines || []).map((line: any, idx: number) => ({
                code: String(idx + 1).padStart(2, '0'),
                name: line.description,
                qty: line.quantity,
                price: Number(line.unit_price),
                discount: Number(line.discount || 0)
            }))
        };
        setInvoice(mappedInvoice);

        const savedSettings = localStorage.getItem('empresa_config');
        const settings = savedSettings ? JSON.parse(savedSettings) : null;
        setCompany(settings);

        if (settings) {
          const qrData = `${settings.nif};${invoiceData.invoice_type};${invoiceData.client_nif || '999999999'};${invoiceData.invoice_date};${invoiceData.total_amount}`;
          QRCode.toDataURL(qrData, { margin: 1, width: 80 }, (err, url) => {
            if (!err) setQrCodeUrl(url);
          });
        }
      } catch (e: any) {
        setError("Erro ao carregar dados do servidor.");
      }
    };

    fetchData();

    if (searchParams.get("print") === "true") {
      setTimeout(() => window.print(), 1500);
    }
  }, [params.id, searchParams]);

  if (error) return <div className="p-20 text-center text-red-500 font-bold">{error}</div>;
  if (!invoice) return <div className="p-20 text-center text-slate-300 font-bold">A carregar...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white font-sans text-black">
      
      {/* BARRA DE ACÇÕES */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-black uppercase tracking-widest">
          <ArrowLeft size={14} /> Voltar ao Arquivo
        </button>
        <button onClick={() => window.print()} className="bg-white border-2 border-slate-900 text-slate-900 px-6 py-2 rounded font-bold text-[10px] hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest">
          <Printer size={16} /> Imprimir (Poupar Tinta)
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-10 md:p-14 print:p-8 shadow-2xl print:shadow-none min-h-[1100px] print:border-none">
        
        {/* CABEÇALHO "ECO-PRINT" */}
        <div className="flex justify-between items-start mb-12 border-b pb-8">
          <div className="space-y-4">
             {company?.logo ? (
               <img src={company.logo} alt="Logo" className="h-16 w-auto object-contain mb-2 print:grayscale" />
             ) : (
               <div className="text-2xl font-black italic border-b-2 border-black inline-block">FACTURA</div>
             )}
             <div className="text-[10px] leading-tight space-y-0.5">
               <h2 className="text-sm font-bold uppercase mb-1">{company?.nomeEmpresa || "A SUA EMPRESA"}</h2>
               <p>{company?.endereco || "Endereço não configurado"}</p>
               <p>LUANDA - ANGOLA</p>
               <p>TEL: (244) {company?.telefone || "--- --- ---"}</p>
               <p>E-MAIL: {company?.email || "---@---.ao"}</p>
               <p className="font-bold border-t border-dotted border-slate-300 pt-1 mt-2">CONTRIBUINTE: {company?.nif || "000000000"}</p>
             </div>
          </div>

          <div className="flex flex-col items-end text-right">
             {qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="w-20 h-20 mb-4 border p-1" />}
             <div className="space-y-1">
               <p className="text-[9px] font-bold text-slate-400 uppercase">Exmo.(s) Sr(s)</p>
               <h3 className="text-sm font-bold uppercase">{invoice.client_name}</h3>
               <div className="text-[10px] text-slate-600 font-medium space-y-0.5">
                  <p className="max-w-[220px]">{invoice.client_address || "ANGOLA"}</p>
                  <p className="font-bold text-black mt-1">NIF: {invoice.client_nif || "CONSUMIDOR FINAL"}</p>
               </div>
          </div>
        </div>
        </div>

        {/* INFO DOCUMENTO */}
        <div className="mb-6 flex justify-between items-center">
           <h1 className="text-xl font-bold uppercase tracking-tight">
             {invoice.type === 'FT' ? 'Factura' : invoice.type === 'FR' ? 'Factura Recibo' : 'Documento'} N.º {invoice.id}
           </h1>
           <div className="text-[10px] font-bold text-slate-500 uppercase flex gap-4">
              <p>DATA: <span className="text-black">{invoice.date}</span></p>
              <p>VENCIMENTO: <span className="text-black">{invoice.vencimento}</span></p>
           </div>
        </div>

        {/* TABELA "INK-SAVER" */}
        <div className="mb-10">
          <table className="w-full text-[10px] border-collapse">
             <thead className="border-y-2 border-black">
               <tr className="text-left font-bold uppercase tracking-wider">
                 <th className="py-2 px-2">Cód.</th>
                 <th className="py-2 px-2">Descrição</th>
                 <th className="py-2 px-2 text-right">Preço Uni.</th>
                 <th className="py-2 px-2 text-center">Qtd.</th>
                 <th className="py-2 px-2 text-center">Desc %</th>
                 <th className="py-2 px-2 text-right">Total</th>
               </tr>
             </thead>
             <tbody className="divide-y border-b-2 border-black">
               {invoice.items.map((item: any, i: number) => {
                 const subtotal = item.qty * item.price;
                 const desc = subtotal * (item.discount / 100);
                 const total = subtotal - desc;
                 return (
                   <tr key={i}>
                     <td className="py-3 px-2 text-slate-400 font-mono">{item.code}</td>
                     <td className="py-3 px-2 uppercase font-medium">{item.name}</td>
                     <td className="py-3 px-2 text-right font-mono">{formatCurrency(item.price)} Kz</td>
                     <td className="py-3 px-2 text-center font-mono">{Number(item.qty).toFixed(2)}</td>
                     <td className="py-3 px-2 text-center font-mono">{item.discount.toFixed(1)}%</td>
                     <td className="py-3 px-2 text-right font-bold">{formatCurrency(total)} Kz</td>
                   </tr>
                 );
               })}
             </tbody>
          </table>
        </div>

        {/* INFO ADICIONAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[10px] mb-12">
           <div className="space-y-4">
              <div>
                <p className="font-bold border-b mb-1 uppercase text-slate-400">Observações</p>
                <p className="italic text-slate-600 uppercase">{invoice.observations || "Sem observações adicionais."}</p>
              </div>
              <div>
                <p className="font-bold border-b mb-1 uppercase text-slate-400">Dados Bancários</p>
                {company?.bancos?.map((b: any, i: number) => (
                  <div key={i} className="mb-1 font-medium">
                    <p className="font-mono text-[9px]">Banco: {b.banco}</p>
                    <p className="font-mono text-[9px]">Nº Conta: {b.numeroConta}</p>
                    <p className="font-mono text-[9px]">IBAN: {b.iban}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-1 text-right">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 uppercase font-bold">Subtotal</span>
                <span className="font-mono">{formatCurrency(invoice.total - (invoice.tax_amount || 0))} Kz</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 uppercase font-bold">IVA (14%)</span>
                <span className="font-mono">{formatCurrency(invoice.tax_amount || 0)} Kz</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-black py-2 mt-2 font-black text-sm uppercase italic">
                <span>Total a Pagar</span>
                <span className="text-lg">{formatCurrency(invoice.total)} Kz</span>
              </div>
           </div>
        </div>

        {/* RODAPÉ AGT "CLEAN" */}
        <div className="mt-20 pt-8 border-t border-dotted text-center space-y-2">
           <p className="text-[9px] font-bold text-slate-400 uppercase italic">
             Factura processada por software validado pela AGT n.º XXX/AGT/2026
           </p>
           <p className="text-[8px] font-mono text-slate-300">
             {invoice.hash_control ? `${invoice.hash_control.substring(0, 4)}-${invoice.hash_control.substring(4, 8)}...` : ""}
           </p>
        </div>

      </div>
    </div>
  );
}

export default function InvoiceViewPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-300">A carregar...</div>}>
      <InvoiceViewContent />
    </Suspense>
  );
}