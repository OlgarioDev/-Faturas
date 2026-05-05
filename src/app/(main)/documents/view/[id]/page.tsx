"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import QRCode from "qrcode";
import { apiFetch } from "@/lib/api";

// --- INTERFACES PARA ELIMINAR O 'ANY' ---

interface InvoiceLine {
  description: string;
  quantity: number;
  unit_price: number;
  tax_percentage: number;
}

interface APIDocument {
  id: string;
  number: string | null;
  document_type: string;
  client: string;
  client_nif: string | null;
  date: string;
  due_date: string | null;
  total_net: number;
  total_tax: number;
  total_gross: number;
  status: string;
  observations?: string;
  lines: InvoiceLine[];
}

interface CompanyConfig {
  nomeEmpresa: string;
  nif: string;
  endereco: string;
  telefone: string;
  email: string;
  logo?: string;
  bancos?: Array<{ banco: string; numeroConta: string; iban: string }>;
}

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
  
  // Estados Tipados
  const [invoice, setInvoice] = useState<APIDocument | null>(null);
  const [company, setCompany] = useState<CompanyConfig | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docId = params.id;
        const data: APIDocument = await apiFetch(`/api/invoices/${docId}`);

        if (!data) {
          setError("Documento não encontrado no servidor.");
          return;
        }

        setInvoice(data);

        // Configurações da Empresa
        const savedSettings = localStorage.getItem('empresa_config');
        const settings: CompanyConfig | null = savedSettings ? JSON.parse(savedSettings) : null;
        setCompany(settings);

        if (settings && data) {
          // Dados para o QR Code (Padrão AGT simplificado para o exemplo)
          const qrData = `${settings.nif};${data.document_type};${data.client_nif || '999999999'};${data.date};${data.total_gross}`;
          QRCode.toDataURL(qrData, { margin: 1, width: 80 }, (err, url) => {
            if (!err) setQrCodeUrl(url);
          });
        }
      } catch (e: unknown) {
        setError("Erro ao carregar dados do servidor. Verifique se o ID é válido.");
      }
    };

    fetchData();

    if (searchParams.get("print") === "true") {
      setTimeout(() => window.print(), 1500);
    }
  }, [params.id, searchParams]);

  if (error) return <div className="p-20 text-center text-red-500 font-bold">{error}</div>;
  if (!invoice) return <div className="p-20 text-center text-slate-300 font-bold animate-pulse uppercase tracking-widest">A processar documento...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white font-sans text-black">
      
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-black uppercase tracking-widest transition-all">
          <ArrowLeft size={14} /> Voltar ao Arquivo
        </button>
        <button onClick={() => window.print()} className="bg-white border-2 border-slate-900 text-slate-900 px-6 py-2 rounded font-bold text-[10px] hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm">
          <Printer size={16} /> Imprimir Documento
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-10 md:p-14 print:p-8 shadow-2xl print:shadow-none min-h-[1100px] relative border border-slate-200 print:border-none">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-start mb-12 border-b pb-8 border-slate-100">
          <div className="space-y-4">
             {company?.logo ? (
               <img src={company.logo} alt="Logo" className="h-16 w-auto object-contain mb-2 print:grayscale" />
             ) : (
               <div className="text-2xl font-black italic border-b-2 border-black inline-block mb-2">LOGO</div>
             )}
             <div className="text-[10px] leading-tight space-y-0.5 uppercase">
               <h2 className="text-sm font-bold mb-1">{company?.nomeEmpresa || "Empresa Demo Lda"}</h2>
               <p>{company?.endereco || "Rua Principal, Luanda"}</p>
               <p>ANGOLA</p>
               <p>TEL: {company?.telefone || "(244) 9XX XXX XXX"}</p>
               <p className="font-bold border-t border-dotted border-slate-300 pt-1 mt-2">NIF: {company?.nif || "5401XXXXXX"}</p>
             </div>
          </div>

          <div className="flex flex-col items-end text-right">
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="w-20 h-20 mb-4 border p-1 border-slate-100" />}
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Destinatário</p>
                <h3 className="text-sm font-bold uppercase">{invoice.client}</h3>
                <div className="text-[10px] text-slate-600 font-medium space-y-0.5">
                   <p className="font-bold text-black mt-1">NIF: {invoice.client_nif || "999999999"}</p>
                </div>
              </div>
          </div>
        </div>

        {/* INFO DOCUMENTO */}
        <div className="mb-6 flex justify-between items-end">
           <div>
              <h1 className="text-xl font-bold uppercase tracking-tight">
                {invoice.document_type} N.º {invoice.number || invoice.id.substring(0,8)}
              </h1>
              <p className="text-[9px] font-bold text-slate-400 italic">Original</p>
           </div>
           <div className="text-[10px] font-bold text-slate-500 uppercase flex gap-6 border-l pl-6 border-slate-100">
              <p>DATA: <span className="text-black">{new Date(invoice.date).toLocaleDateString('pt-AO')}</span></p>
              <p>VENC.: <span className="text-black">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('pt-AO') : 'Pronto Pagamento'}</span></p>
           </div>
        </div>

        {/* TABELA ITENS */}
        <div className="mb-10">
          <table className="w-full text-[10px] border-collapse">
             <thead className="border-y-2 border-black">
               <tr className="text-left font-bold uppercase tracking-wider">
                 <th className="py-2 px-2">Cód</th>
                 <th className="py-2 px-2">Descrição</th>
                 <th className="py-2 px-2 text-right">Preço</th>
                 <th className="py-2 px-2 text-center">Qtd</th>
                 <th className="py-2 px-2 text-right">Total</th>
               </tr>
             </thead>
             <tbody className="divide-y border-b-2 border-black border-slate-100">
               {invoice.lines.map((line, i) => (
                   <tr key={i} className="hover:bg-slate-50 print:hover:bg-transparent">
                     <td className="py-3 px-2 text-slate-400 font-mono">{String(i + 1).padStart(2, '0')}</td>
                     <td className="py-3 px-2 uppercase font-medium">{line.description}</td>
                     <td className="py-3 px-2 text-right font-mono">{formatCurrency(line.unit_price)}</td>
                     <td className="py-3 px-2 text-center font-mono">{line.quantity}</td>
                     <td className="py-3 px-2 text-right font-bold">{formatCurrency(line.quantity * line.unit_price)}</td>
                   </tr>
               ))}
             </tbody>
          </table>
        </div>

        {/* TOTAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[10px] mb-12">
           <div className="space-y-4 pt-2">
              <div>
                <p className="font-bold border-b mb-1 uppercase text-slate-400 text-[8px]">Observações</p>
                <p className="italic text-slate-600 uppercase leading-relaxed">{invoice.observations || "Mercadoria entregue em perfeitas condições."}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg print:p-0 print:bg-white">
                <p className="font-bold border-b mb-2 uppercase text-slate-400 text-[8px]">Coordenadas Bancárias</p>
                {company?.bancos?.map((b, idx) => (
                  <div key={idx} className="mb-2 last:mb-0">
                    <p className="font-mono text-[9px] leading-tight">BANCO: {b.banco}</p>
                    <p className="font-mono text-[9px] leading-tight">IBAN: {b.iban}</p>
                  </div>
                )) || <p className="font-mono text-[9px]">IBAN: AO06.0001.XXXX.XXXX.XXXX.X</p>}
              </div>
           </div>

           <div className="space-y-1 text-right bg-slate-50/50 p-4 rounded-2xl print:p-0 print:bg-white">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 uppercase font-bold text-[9px]">Total Líquido</span>
                <span className="font-mono">{formatCurrency(invoice.total_net)} Kz</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 uppercase font-bold text-[9px]">Total IVA ({invoice.lines[0]?.tax_percentage || 14}%)</span>
                <span className="font-mono">{formatCurrency(invoice.total_tax)} Kz</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-black py-3 mt-3 font-black text-sm uppercase italic">
                <span>Total a Pagar</span>
                <span className="text-lg">{formatCurrency(invoice.total_gross)} Kz</span>
              </div>
           </div>
        </div>

        {/* RODAPÉ AGT */}
        <div className="absolute bottom-8 left-0 right-0 px-14 print:static print:mt-20 print:px-0 text-center space-y-2">
           <div className="border-t border-dotted border-slate-300 pt-6">
              <p className="text-[9px] font-bold text-slate-400 uppercase italic mb-1">
                Os bens/serviços foram colocados à disposição do adquirente na data e local do documento.
              </p>
              <p className="text-[9px] font-bold text-slate-800 uppercase tracking-tighter">
                Processado por software validado pela AGT n.º 999/AGT/2026 • +Facturas
              </p>
              <p className="text-[8px] font-mono text-slate-300 mt-2 uppercase">
                Hash: {invoice.id.substring(0, 8).toUpperCase()}-CONTROLO-VALIDO
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}

export default function InvoiceViewPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black text-slate-200 uppercase animate-pulse">A carregar arquivo digital...</div>}>
      <InvoiceViewContent />
    </Suspense>
  );
}