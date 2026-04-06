"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer, Download, FileCheck } from "lucide-react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase"; // Importação necessária para a nuvem

function InvoiceViewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const docId = decodeURIComponent(params.id as string);

      // 1. BUSCAR CABEÇALHO DA FATURA NO SUPABASE
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', docId)
        .single();

      if (invData) {
        // 2. BUSCAR ITENS DA FATURA NO SUPABASE
        const { data: itemsData } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', docId);
        
        const completeInvoice = { ...invData, items: itemsData || [] };
        setInvoice(completeInvoice);

        // 3. CARREGAR CONFIGURAÇÃO DA EMPRESA (LocalStorage por enquanto)
        const savedSettings = localStorage.getItem('empresa_config');
        const settings = savedSettings ? JSON.parse(savedSettings) : null;
        setCompany(settings);

        // 4. GERAR QR CODE CONFORME PADRÃO AGT
        if (settings) {
          const qrData = `${settings.nif};${invData.type};${invData.client_nif || '999999999'};${invData.date};${invData.total}`;
          
          QRCode.toDataURL(qrData, { margin: 1, width: 100 }, (err, url) => {
            if (!err) setQrCodeUrl(url);
          });
        }
      }
    };

    fetchData();

    if (searchParams.get("print") === "true") {
      setTimeout(() => window.print(), 1500);
    }
  }, [params.id, searchParams]);

  if (!invoice) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-300">A carregar documento da nuvem...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white font-sans">
      
      {/* BARRA DE ACÇÕES */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all">
          <ArrowLeft size={16} /> Voltar ao Arquivo
        </button>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2">
          <Printer size={16} /> Imprimir Factura
        </button>
      </div>

      <div className="max-w-[850px] mx-auto bg-white shadow-2xl p-10 md:p-14 print:shadow-none print:p-8 min-h-[1100px] flex flex-col text-slate-800 border border-slate-200 print:border-none uppercase">
        
        {/* CABEÇALHO */}
        <div className="grid grid-cols-2 gap-10 mb-8">
          <div className="space-y-3">
            {company?.logo && <img src={company.logo} className="h-16 w-auto object-contain mb-2" />}
            <h2 className="text-2xl font-black italic leading-none text-slate-900">
              {company?.nomeEmpresa || "NOME DA EMPRESA"}
            </h2>
            <div className="text-[11px] space-y-0.5 text-slate-600 font-medium">
              <p>{company?.endereco || "Endereço não configurado"}</p>
              <p>Luanda - Angola</p>
              <p>Tel: {company?.telefone || "(244) --- --- ---"}</p>
              <p>E-mail: {company?.email || "---@---.ao"}</p>
              <p className="font-black text-slate-900 mt-2">Contribuinte: {company?.nif || "000000000"}</p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end pt-4">
            {/* QR CODE - POSIÇÃO AGT (Topo Direito) */}
            {qrCodeUrl && (
              <div className="mb-4 bg-white p-1 border rounded-lg shadow-sm">
                <img src={qrCodeUrl} alt="AGT QR Code" />
                <p className="text-[6px] font-black text-center mt-0.5 opacity-50">QR CODE</p>
              </div>
            )}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Exmo.(s) Sr(s)</p>
            <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight">{invoice.client_name}</h3>
            <div className="text-[11px] space-y-0.5 text-slate-600 font-medium text-right">
               <p className="max-w-[300px]">{invoice.clientAddress || "Angola"}</p>
               <p className="font-black text-slate-900 italic mt-1">NIF: {invoice.client_nif || "Consumidor Final"}</p>
            </div>
          </div>
        </div>

        {/* IDENTIFICAÇÃO */}
        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-6">
           <div className="space-y-2">
              <span className="bg-slate-900 text-white px-3 py-1 text-[9px] font-black rounded">Original</span>
              <h1 className="text-xl font-black mt-2 italic tracking-tighter">
                {invoice.type === 'FT' ? 'Factura' : 'Factura Recibo'} n.º {invoice.id}
              </h1>
           </div>
           <div className="text-right text-[10px] font-bold">
              <p className="text-slate-400 font-black mb-1">Dados de Emissão</p>
              <p>Data: <span className="font-black text-slate-900 italic">{invoice.date}</span></p>
              <p>Vencimento: <span className="font-black text-slate-900 italic uppercase">{invoice.vencimento}</span></p>
           </div>
        </div>

        {/* OBSERVAÇÕES E NOTA LEGAL */}
        <div className="space-y-4">
            {/* Bloco de Observações Dinâmicas */}
            {invoice.observations && (
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 italic">
                        Observações do Documento
                    </p>
                    <p className="text-[11px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                        {invoice.observations}
                    </p>
                </div>
            )}

            {/* Nota Legal AGT */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <p className="text-[10px] text-slate-400 font-black text-center uppercase tracking-[0.2em]">
                    Factura processada por software validado pela AGT nº XXX/AGT/2026
                </p>
            </div>
        </div>

        {/* TABELA DE ITENS */}
        <div className="flex-grow mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-slate-900 text-[9px] font-black tracking-widest bg-slate-50">
                <th className="py-2 pl-2">Código</th>
                <th className="py-2">Descrição</th>
                <th className="py-2 text-right">Preço Uni.</th>
                <th className="py-2 text-center">Qtd.</th>
                <th className="py-2 text-center">IVA %</th>
                <th className="py-2 text-center">Dsc. %</th>
                <th className="py-2 text-right pr-2">Total Líquido</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold text-slate-700">
              {invoice.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 pl-2 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3">{item.name}</td>
                  <td className="py-3 text-right">{Number(item.price).toLocaleString()} Kz</td>
                  <td className="py-3 text-center">{item.qty}</td>
                  <td className="py-3 text-center">{invoice.tax_amount > 0 ? "14.00%" : "0.00%"}</td>
                  <td className="py-3 text-center">{item.discount || 0}.00%</td>
                  <td className="py-3 text-right pr-2 font-black">
                    {((item.qty * item.price) * (1 - (item.discount || 0)/100)).toLocaleString()} Kz
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QUADROS FINAIS */}
        <div className="grid grid-cols-2 gap-10 mt-10">
          <div>
            <table className="w-full text-[9px] border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 font-black text-slate-900">
                  <th className="py-1 text-left">Imposto/IVA</th>
                  <th className="py-1 text-right">Incidência</th>
                  <th className="py-1 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="font-black">
                <tr className="border-b border-slate-50">
                  <td className="py-2">{invoice.tax_amount > 0 ? "IVA (14%)" : "Isento (0%)"}</td>
                  <td className="py-2 text-right">{(invoice.total - (invoice.tax_amount || 0)).toLocaleString()} Kz</td>
                  <td className="py-2 text-right">{(invoice.tax_amount || 0).toLocaleString()} Kz</td>
                </tr>
              </tbody>
            </table>
            
            <div className="mt-8 text-[10px] space-y-4">
              <div>
                <p className="font-black border-b border-slate-900 w-fit mb-2 uppercase">Dados Bancários</p>
                <div className="space-y-1">
                    {company?.bancos?.map((b: any, i: number) => (
                      <div key={i} className="font-bold text-slate-700 leading-tight">
                        <p className="uppercase text-slate-900 text-[9px]">{b.banco}</p>
                        <p>CONTA: <span className="text-slate-900">{b.numeroConta}</span></p>
                        <p>IBAN: <span className="text-slate-900">{b.iban}</span></p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <h4 className="text-[10px] font-black border-b-2 border-slate-900 w-full text-right pb-1 mb-2 text-slate-400">Sumário</h4>
            <div className="w-full space-y-1.5 text-[11px] font-black">
               <div className="flex justify-between"><span>Total ilíquido:</span><span>{(invoice.total - (invoice.tax_amount || 0)).toLocaleString()} Kz</span></div>
               <div className="flex justify-between"><span>Desconto:</span><span>{(invoice.discountAmount || 0).toLocaleString()} Kz</span></div>
               <div className="flex justify-between text-blue-700"><span>Imposto/IVA:</span><span>{(invoice.tax_amount || 0).toLocaleString()} Kz</span></div>
               <div className="flex justify-between text-xl font-black border-t-2 border-slate-900 pt-2 mt-2 italic text-slate-900">
                 <span>Total:</span>
                 <span className="underline decoration-double underline-offset-4">{Number(invoice.total).toLocaleString()} Kz</span>
               </div>
            </div>
            
            <div className="mt-12 text-right">
               <p className="text-[9px] font-black mb-1 tracking-widest uppercase">Regime de IVA</p>
               <p className="text-[10px] font-black text-slate-500 italic">
                 {invoice.tax_amount === 0 ? "Regime de Exclusão (Art. 16.º)" : "Regime Geral"}
               </p>
               <div className="mt-8 pt-6 border-t border-dashed border-slate-300">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
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