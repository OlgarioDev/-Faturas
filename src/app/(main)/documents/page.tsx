"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Printer, Download, Eye, 
  FileText, RotateCcw, Filter, CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Document {
  id: string;
  clientName: string;
  date: string;
  total: number;
  type: "FT" | "FR" | "PP" | "NC" | "ND"; 
  status: "Emitida" | "Rascunho" | "Paga" | "Anulada";
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  useEffect(() => {
    setIsMounted(true);
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const saved = localStorage.getItem("system_invoices");
    if (saved) {
      try { 
        const parsedDocs = JSON.parse(saved);
        // Garantir que mostramos os novos primeiro sem mutar o original permanentemente
        setDocuments([...parsedDocs].reverse()); 
      } catch (e) { 
        console.error("Erro ao ler arquivo", e); 
      }
    }
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-AO", { style: "currency", currency: "AOA" });

  // --- NOVA FUNÇÃO: REGISTAR PAGAMENTO ---
  const handleMarkAsPaid = (docId: string) => {
    if (confirm(`Confirmar o recebimento do pagamento para o documento ${docId}?`)) {
      const saved = localStorage.getItem("system_invoices");
      if (saved) {
        const parsedDocs = JSON.parse(saved);
        const updatedDocs = parsedDocs.map((d: Document) => 
          d.id === docId ? { ...d, status: "Paga" } : d
        );
        
        localStorage.setItem("system_invoices", JSON.stringify(updatedDocs));
        loadDocuments(); // Recarrega a lista visualmente
        setSelectedDocId(docId);
      }
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = (doc.clientName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                         (doc.id?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "Todos" || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleGenerateNC = (doc: Document) => {
    if (confirm(`Deseja gerar uma Nota de Crédito para anular o documento ${doc.id}?`)) {
      router.push(`/documents/create?type=NC&ref=${doc.id}`);
    }
  };

  if (!isMounted) return (
    <div className="p-10 flex items-center justify-center min-h-screen">
       <div className="animate-pulse font-black text-slate-300 uppercase italic tracking-widest">A carregar arquivo...</div>
    </div>
  );

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tighter uppercase italic">Arquivo Geral</h1>
            <p className="text-slate-500 font-medium italic">Gestão de pagamentos e histórico fiscal.</p>
          </div>
          
          {selectedDoc && (
            <div className="flex flex-wrap gap-2 animate-in slide-in-from-right-4">
              {/* BOTAO PAGAR: Só aparece se for FT (Crédito) e estiver apenas Emitida */}
              {selectedDoc.type === "FT" && selectedDoc.status === "Emitida" && (
                <button 
                  onClick={() => handleMarkAsPaid(selectedDoc.id)}
                  className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] hover:bg-emerald-700 flex items-center gap-2 transition-all uppercase shadow-lg shadow-emerald-200"
                >
                  <CheckCircle2 size={14} /> Liquidar Pagamento
                </button>
              )}

              {(selectedDoc.type === "FT" || selectedDoc.type === "FR") && selectedDoc.status !== "Anulada" && (
                <button 
                  onClick={() => handleGenerateNC(selectedDoc)}
                  className="bg-red-50 border border-red-100 text-red-600 px-5 py-2.5 rounded-xl font-black text-[10px] hover:bg-red-100 flex items-center gap-2 transition-all uppercase"
                >
                  <RotateCcw size={14} /> Anular (NC)
                </button>
              )}
              
              <button 
                onClick={() => router.push(`/documents/view/${encodeURIComponent(selectedDoc.id)}`)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-black text-[10px] shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-all uppercase"
              >
                <Printer size={14} /> Imprimir
              </button>
            </div>
          )}
        </div>

        {/* FILTROS */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por cliente ou referência..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-bold text-slate-700 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {["Todos", "Emitida", "Paga", "Anulada"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${
                  filterStatus === status ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="px-8 py-5">Referência / Data</th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5 text-center">Estado</th>
                  <th className="px-6 py-5 text-right">Valor Total</th>
                  <th className="px-8 py-5 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr 
                      key={doc.id} 
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`cursor-pointer transition-all group ${selectedDocId === doc.id ? 'bg-blue-50/40 border-l-4 border-blue-600' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${
                            doc.status === 'Paga' ? 'bg-emerald-50 text-emerald-600' : 
                            doc.status === 'Anulada' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {doc.type}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm">{doc.id}</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase">{doc.date}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="font-bold text-slate-700 text-xs uppercase">{doc.clientName}</div>
                         {doc.status === 'Emitida' && doc.type === 'FT' && (
                           <div className="text-[8px] text-amber-600 font-black flex items-center gap-1 mt-1 uppercase">
                             <AlertCircle size={10}/> Pendente de Recebimento
                           </div>
                         )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          doc.status === "Paga" ? 'bg-emerald-100 text-emerald-700' :
                          doc.status === "Anulada" ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-900 text-sm">{formatCurrency(doc.total)}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => router.push(`/documents/view/${encodeURIComponent(doc.id)}`)}
                            className="p-2 text-slate-300 hover:text-blue-600 transition-all bg-slate-50 rounded-lg"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                       <div className="flex flex-col items-center gap-2 opacity-20">
                          <FileText size={48} />
                          <p className="font-black uppercase text-xs">Nenhum registo encontrado</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.3em] opacity-50 pb-10">
          Arquivo Digital Certificado • +Facturas v1.0
        </p>
      </div>
    </div>
  );
}