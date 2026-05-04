"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, TrendingUp, Users, FileSpreadsheet, FileText, 
  AlertCircle, CheckCircle2, Landmark, DollarSign,
  Briefcase, Filter, CalendarDays, CalendarRange, ListFilter
} from "lucide-react";

// Bibliotecas de Exportação
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { apiFetch } from "@/services/api";

interface ExtendedInvoice {
  id: string;
  clientName: string;
  employeeName: string; 
  date: string;
  subtotal: number;
  taxAmount: number; 
  total: number;
  status: string;
}

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"financeiro" | "vendas" | "fiscal">("financeiro");
  
  // Estados de Filtro
  const [viewType, setViewType] = useState<"mensal" | "semestral" | "anual">("mensal");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedSemester, setSelectedSemester] = useState("1"); // "1" ou "2"

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await apiFetch('/invoices/');
      setInvoices(data.map((inv: any) => ({
        id: inv.invoice_no,
        clientName: inv.client_name,
        employeeName: "Administrador",
        date: inv.invoice_date,
        subtotal: Number(inv.total_amount) - Number(inv.tax_amount || 0),
        taxAmount: Number(inv.tax_amount || 0),
        total: Number(inv.total_amount),
        status: inv.status
      })));
    } catch (e) {
      console.error("Erro ao carregar faturas da API", e);
    }
  };

  // LÓGICA DE FILTRAGEM EVOLUÍDA
  const filteredInvoices = invoices.filter(inv => {
    if (!inv.date) return false;
    
    const parts = inv.date.includes('/') ? inv.date.split('/') : inv.date.split('-');
    if (parts.length < 3) return false;

    const year = parts.find(p => p.length === 4);
    const monthNum = inv.date.includes('/') ? parseInt(parts[1]) : parseInt(parts[1]);
    const monthStr = monthNum.toString().padStart(2, '0');

    // Filtro Anual
    if (viewType === "anual") return year === selectedYear;

    // Filtro Semestral
    if (viewType === "semestral") {
      const isFirstSemester = monthNum >= 1 && monthNum <= 6;
      const targetSemester = selectedSemester === "1";
      return year === selectedYear && isFirstSemester === targetSemester;
    }

    // Filtro Mensal
    return year === selectedYear && monthStr === selectedMonth;
  });

  const formatCurrency = (val: any) => {
    const amount = Number(val) || 0;
    return amount.toLocaleString("pt-AO", { style: "currency", currency: "AOA" });
  };

  const exportToExcel = () => {
    const periodLabel = viewType === 'anual' ? selectedYear : 
                       viewType === 'semestral' ? `${selectedSemester}º Semestre ${selectedYear}` : 
                       `${selectedMonth}-${selectedYear}`;
    
    const worksheet = XLSX.utils.json_to_sheet(filteredInvoices.map(inv => ({
      ID: inv.id,
      Cliente: inv.clientName,
      Data: inv.date,
      Estado: inv.status,
      IVA: inv.taxAmount.toFixed(2),
      Total: inv.total.toFixed(2)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    XLSX.writeFile(workbook, `Relatorio_+Facturas_${periodLabel}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const periodLabel = viewType === 'anual' ? selectedYear : 
                       viewType === 'semestral' ? `${selectedSemester}º Semestre ${selectedYear}` : 
                       `${selectedMonth}/${selectedYear}`;

    doc.setFontSize(18);
    doc.text(`Relatório ${activeTab.toUpperCase()}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Período: ${periodLabel} | Gerado por: +Facturas`, 14, 30);

    autoTable(doc, {
      startY: 35,
      head: [['Doc', 'Cliente', 'Data', 'Estado', 'IVA', 'Total']],
      body: filteredInvoices.map(inv => [
        inv.id, inv.clientName, inv.date, inv.status, formatCurrency(inv.taxAmount), formatCurrency(inv.total)
      ]),
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 }
    });
    doc.save(`Relatorio_${periodLabel.replace('/','-')}.pdf`);
  };

  const stats = {
    tax: filteredInvoices.reduce((acc, inv) => acc + (inv.status !== "Anulada" ? inv.taxAmount : 0), 0),
    pending: filteredInvoices.filter(i => i.status === "Emitida" || i.status === "Pendente").reduce((acc, inv) => acc + inv.total, 0),
    paid: filteredInvoices.filter(i => i.status === "Paga").reduce((acc, inv) => acc + inv.total, 0)
  };

  if (!isMounted) return <div className="p-10 text-slate-400 animate-pulse font-black uppercase italic">A carregar análise...</div>;

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tighter uppercase italic">Centro de Inteligência</h1>
            <p className="text-slate-500 font-medium italic">Monitorização financeira e fiscal em tempo real.</p>
          </div>
          
          {/* SELETOR DE TIPO DE VISTA (Mensal, Semestral, Anual) */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button onClick={() => setViewType("mensal")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${viewType === "mensal" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <CalendarDays size={14}/> MENSAL
            </button>
            <button onClick={() => setViewType("semestral")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${viewType === "semestral" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <ListFilter size={14}/> SEMESTRAL
            </button>
            <button onClick={() => setViewType("anual")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${viewType === "anual" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <CalendarRange size={14}/> ANUAL
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS DINÂMICOS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm">
          {/* Ano sempre visível */}
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none cursor-pointer">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Seletor Mensal */}
          {viewType === "mensal" && (
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none cursor-pointer">
              {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => (
                <option key={m} value={m}>{new Date(2000, Number(m)-1).toLocaleString('pt-PT', {month:'long'}).toUpperCase()}</option>
              ))}
            </select>
          )}

          {/* Seletor Semestral */}
          {viewType === "semestral" && (
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none cursor-pointer">
              <option value="1">1º SEMESTRE (JAN - JUN)</option>
              <option value="2">2º SEMESTRE (JUL - DEZ)</option>
            </select>
          )}

          {/* Espaçador para manter botões à direita se necessário */}
          <div className={`${viewType === 'anual' ? 'md:col-span-2' : ''}`}></div>

          <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] uppercase border border-green-200 hover:bg-green-100 transition-all py-3 shadow-sm">
            <FileSpreadsheet size={16}/> EXCEL
          </button>
          <button onClick={exportToPDF} className="flex items-center justify-center gap-2 bg-[#0f172a] text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-slate-800 transition-all py-3">
            <FileText size={16}/> PDF
          </button>
        </div>

        {/* NAVEGAÇÃO DE TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "financeiro", label: "Tesouraria", icon: DollarSign },
            { id: "vendas", label: "Performance", icon: Briefcase },
            { id: "fiscal", label: "Fiscal / AGT", icon: Landmark },
            { id: "global", label: "Relatório Global (Admin)", icon: Users, adminOnly: true }
          ].filter(t => !t.adminOnly || localStorage.getItem('user_role') === 'super_admin').map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#0f172a] text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 shadow-sm hover:text-slate-600'}`}><tab.icon size={14}/> {tab.label.toUpperCase()}</button>
          ))}
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Imposto Retido (14%)</p>
            <p className="text-3xl font-black text-blue-600 tracking-tighter">{formatCurrency(stats.tax)}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Carteira Pendente</p>
            <p className="text-3xl font-black text-orange-500 tracking-tighter">{formatCurrency(stats.pending)}</p>
          </div>
          <div className="bg-[#0f172a] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Capital em Caixa</p>
            <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(stats.paid)}</p>
            <TrendingUp className="absolute -right-4 -bottom-4 text-white opacity-5" size={130} />
          </div>
        </div>

        {/* LISTAGEM DETALHADA */}
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden mb-10">
          <div className="px-10 py-6 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest flex items-center gap-2">
              <BarChart size={14}/> {activeTab === 'global' ? 'Performance Global de Empresas' : 'Documentação Analítica do Período'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            {activeTab === 'global' ? (
                <div className="p-20 text-center space-y-4">
                    <p className="font-black text-slate-300 uppercase tracking-widest">Relatório Consolidado em Preparação...</p>
                    <p className="text-xs text-slate-400">Esta vista permite analisar a rentabilidade de todos os parceiros do ecossistema.</p>
                </div>
            ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                  <th className="px-10 py-6">Entidade / Ref</th>
                  <th className="px-6 py-6 text-center">Data</th>
                  <th className="px-6 py-6 text-center">Estado</th>
                  <th className="px-6 py-6 text-right">IVA</th>
                  <th className="px-10 py-6 text-right">Total Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="font-black text-slate-900 text-sm">{inv.clientName}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Nº: {inv.id} • {inv.employeeName}</div>
                    </td>
                    <td className="px-6 py-6 text-center text-xs font-bold text-slate-500">{inv.date}</td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${inv.status === "Paga" ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right font-bold text-blue-600 text-xs">{formatCurrency(inv.taxAmount)}</td>
                    <td className="px-10 py-6 text-right font-black text-[#0f172a] text-sm">{formatCurrency(inv.total)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <AlertCircle size={40}/>
                      <p className="font-black uppercase text-xs tracking-widest">Sem movimentos para este filtro</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}