"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, Users, FileSpreadsheet, FileText, 
  AlertCircle, CheckCircle2, Landmark, DollarSign,
  Briefcase, Filter, CalendarDays, CalendarRange
} from "lucide-react";

// Bibliotecas de Exportação
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExtendedInvoice {
  id: string;
  clientName: string;
  employeeName: string; 
  date: string;
  subtotal: number;
  taxAmount: number; 
  total: number;
  status: "Emitida" | "Rascunho" | "Paga" | "Anulada";
}

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"financeiro" | "vendas" | "fiscal">("financeiro");
  
  const [viewType, setViewType] = useState<"mensal" | "anual">("mensal");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("facturas_recentes");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setInvoices(data.map((inv: any) => ({
          ...inv,
          subtotal: Number(inv.subtotal) || 0,
          taxAmount: Number(inv.taxAmount) || 0,
          total: Number(inv.total) || 0
        })));
      } catch (e) { console.error("Erro ao processar dados", e); }
    }
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const [day, month, year] = inv.date.includes('/') ? inv.date.split('/') : inv.date.split('-').reverse();
    const invMonth = month?.padStart(2, '0');
    const invYear = year?.length === 2 ? `20${year}` : year;

    if (viewType === "anual") return invYear === selectedYear;
    return invYear === selectedYear && invMonth === selectedMonth;
  });

  const formatCurrency = (val: any) => {
    const amount = Number(val) || 0;
    return amount.toLocaleString("pt-AO", { style: "currency", currency: "AOA" });
  };

  // LÓGICA DE EXPORTAÇÃO EXCEL
  const exportToExcel = () => {
    const label = activeTab.toUpperCase();
    const period = viewType === 'anual' ? selectedYear : `${selectedMonth}-${selectedYear}`;
    const worksheet = XLSX.utils.json_to_sheet(filteredInvoices.map(inv => ({
      ID: inv.id,
      Cliente: inv.clientName,
      Responsavel: inv.employeeName,
      Data: inv.date,
      Estado: inv.status,
      IVA: inv.taxAmount,
      Total: inv.total
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio");
    XLSX.writeFile(workbook, `Relatorio_${label}_${period}.xlsx`);
  };

  // LÓGICA DE EXPORTAÇÃO PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const period = viewType === 'anual' ? selectedYear : `${selectedMonth}/${selectedYear}`;
    
    doc.setFontSize(18);
    doc.text(`Relatório de ${activeTab.toUpperCase()}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Período: ${period} | Software: +Facturas`, 14, 30);

    autoTable(doc, {
      startY: 35,
      head: [['Entidade', 'Data', 'Estado', 'IVA (14%)', 'Total']],
      body: filteredInvoices.map(inv => [
        inv.clientName,
        inv.date,
        inv.status,
        formatCurrency(inv.taxAmount),
        formatCurrency(inv.total)
      ]),
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`Relatorio_${activeTab}_${period.replace('/', '-')}.pdf`);
  };

  const stats = {
    tax: filteredInvoices.reduce((acc, inv) => acc + (inv.status !== "Anulada" ? inv.taxAmount : 0), 0),
    pending: filteredInvoices.filter(i => i.status === "Emitida").reduce((acc, inv) => acc + inv.total, 0),
    paid: filteredInvoices.filter(i => i.status === "Paga").reduce((acc, inv) => acc + inv.total, 0)
  };

  if (!isMounted) return <div className="p-10 text-slate-400 animate-pulse font-bold">A carregar análise...</div>;

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight tracking-tighter">Centro de Inteligência</h1>
          
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-center">
            <button onClick={() => setViewType("mensal")} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewType === "mensal" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <CalendarDays size={14}/> MENSAL
            </button>
            <button onClick={() => setViewType("anual")} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewType === "anual" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <CalendarRange size={14}/> ANUAL
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS E EXPORTAÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none">
            <option value="2026">2026</option><option value="2025">2025</option>
          </select>

          <select value={selectedMonth} disabled={viewType === 'anual'} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none disabled:opacity-30">
            {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => (
              <option key={m} value={m}>{new Date(2000, Number(m)-1).toLocaleString('pt-PT', {month:'long'}).toUpperCase()}</option>
            ))}
          </select>

          <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-green-50 text-green-700 rounded-xl font-bold text-[10px] uppercase border border-green-200 hover:bg-green-100 transition-all py-3">
            <FileSpreadsheet size={16}/> Exportar Excel
          </button>
          <button onClick={exportToPDF} className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg hover:bg-slate-800 transition-all py-3">
            <FileText size={16}/> Baixar PDF
          </button>
        </div>

        {/* NAVEGAÇÃO DE CATEGORIAS */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[{ id: "financeiro", label: "Tesouraria", icon: DollarSign }, { id: "vendas", label: "Performance", icon: Briefcase }, { id: "fiscal", label: "Fiscal / AGT", icon: Landmark }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}><tab.icon size={14}/> {tab.label.toUpperCase()}</button>
          ))}
        </div>

        {/* CARDS KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total IVA (14%)</p>
            <p className="text-3xl font-black text-blue-600">{formatCurrency(stats.tax)}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pendente</p>
            <p className="text-3xl font-black text-orange-500">{formatCurrency(stats.pending)}</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Caixa Real</p>
            <p className="text-3xl font-black text-white">{formatCurrency(stats.paid)}</p>
            <TrendingUp className="absolute -right-4 -bottom-4 text-white opacity-5" size={130} />
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
          <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              {activeTab === 'vendas' ? "Performance por Funcionário" : "Listagem de Documentos"}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <th className="px-10 py-6">Entidade / Responsável</th>
                  <th className="px-6 py-6 text-center">Data</th>
                  <th className="px-6 py-6">Estado</th>
                  <th className="px-6 py-6 text-right">IVA</th>
                  <th className="px-10 py-6 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="font-bold text-slate-900">{inv.clientName}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Func: {inv.employeeName || "Administrador"}</div>
                    </td>
                    <td className="px-6 py-6 text-center text-xs font-medium text-slate-500">{inv.date}</td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${inv.status === "Paga" ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{inv.status}</span>
                    </td>
                    <td className="px-6 py-6 text-right font-bold text-blue-600 text-xs">{formatCurrency(inv.taxAmount)}</td>
                    <td className="px-10 py-6 text-right font-black text-slate-900 text-sm">{formatCurrency(inv.total)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-24 text-center text-slate-400 italic font-medium">Não existem registos para o período selecionado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}