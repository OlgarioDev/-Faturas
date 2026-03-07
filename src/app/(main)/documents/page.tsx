"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Printer, CheckCircle2, AlertCircle, 
  XCircle, Download, Eye, FileCheck, 
  FileText, RotateCcw
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
    const saved = localStorage.getItem("facturas_recentes");
    if (saved) {
      try { setDocuments(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-AO", { style: "currency", currency: "AOA" });

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = (doc.clientName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                         (doc.id?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "Todos" || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // FUNÇÃO PARA GERAR NC A PARTIR DE UMA FT
  const handleGenerateNC = (doc: Document) => {
    if (confirm(`Deseja gerar uma Nota de Crédito para anular o documento ${doc.id}?`)) {
      // Redireciona para criação de NC passando a referência da fatura original
      router.push(`/invoices/create?type=NC&ref=${doc.id}`);
    }
  };

  if (!isMounted) return <div className="p-10 text-slate-400 font-bold">A carregar arquivo...</div>;

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABEÇALHO DINÂMICO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Arquivo Geral</h1>
            <p className="text-slate-500 font-medium italic">Histórico de Documentos Fiscais.</p>
          </div>
          
          {selectedDoc && (
            <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2">
              {/* Botão de Anulação/NC só aparece para faturas oficiais */}
              {(selectedDoc.type === "FT" || selectedDoc.type === "FR") && selectedDoc.status !== "Anulada" && (
                <button 
                  onClick={() => handleGenerateNC(selectedDoc)}
                  className="bg-red-50 border-2 border-red-100 text-red-600 px-5 py-2.5 rounded-xl font-black text-[10px] hover:bg-red-100 flex items-center gap-2 transition-all uppercase"
                >
                  <RotateCcw size={14} /> Gerar Nota de Crédito
                </button>
              )}
              
              <button 
                onClick={() => window.print()}
                className="bg-white border-2 border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-black text-[10px] shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-all uppercase"
              >
                <Printer size={14} /> Imprimir
              </button>
              
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] shadow-lg hover:bg-slate-800 flex items-center gap-2 transition-all uppercase">
                <Download size={14} /> Download PDF
              </button>
            </div>
          )}
        </div>

        {/* PESQUISA E FILTROS */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por cliente ou número..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
            {["Todos", "Paga", "Emitida", "Rascunho", "Anulada"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${
                  filterStatus === status ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* TABELA DE REGISTOS */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="px-8 py-5">Doc / Nº</th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5 text-center">Estado</th>
                  <th className="px-6 py-5 text-right">Total</th>
                  <th className="px-8 py-5 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.map((doc) => (
                  <tr 
                    key={doc.id} 
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`cursor-pointer transition-all group ${selectedDocId === doc.id ? 'bg-blue-50/40 border-l-4 border-blue-600' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${
                          doc.type === 'NC' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {doc.type}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-sm tracking-tight">{doc.id}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{doc.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-800 text-xs uppercase">{doc.clientName}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        doc.status === "Paga" ? 'bg-green-100 text-green-700' :
                        doc.status === "Anulada" ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-900 text-sm">{formatCurrency(doc.total)}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-300 hover:text-blue-600 transition-all"><Eye size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}