"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/MetricCard";
import { BillingChart } from "@/components/BillingChart";
import { RecentInvoices } from "@/components/RecentInvoices";
import { 
  DollarSign, FileText, Users, TrendingUp, Plus, 
  Download, FileCheck, ArrowLeftRight, FileCode, X,
  AlertCircle, LayoutTemplate, MousePointer2, Activity
} from "lucide-react";
import { getChurnRisk } from "@/services/api";

interface InvoiceData {
  id: string;
  date: string;
  type: string;
  clientNif: string;
  total: number;
  status: string;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasInvoices, setHasInvoices] = useState(false); // NOVO: Controle de estado vazio
  
  // ESTADO PARA DADOS DOS CARDS
  const [realStats, setRealStats] = useState({
    faturacaoTotal: 0,
    pendentes: 0,
    qtdPendentes: 0,
    novosClientes: 0,
    taxaConversao: 0,
    churnScore: 0,
    churnRecommendation: ""
  });

  // ESTADO PARA O GRÁFICO (Array de 12 meses)
  const [monthlyData, setMonthlyData] = useState<number[]>(new Array(12).fill(0));

  // LÓGICA DE CÁLCULO E SINCRONIZAÇÃO
  useEffect(() => {
    const faturas: InvoiceData[] = JSON.parse(localStorage.getItem("system_invoices") || "[]");
    const clientes = JSON.parse(localStorage.getItem("facturas_clients") || "[]");

    // Lógica para detetar se há faturas
    setHasInvoices(faturas.length > 0);

    const totalsByMonth = new Array(12).fill(0);

    // 1. Calcular Totais e Dados do Gráfico
    const total = faturas.reduce((acc: number, cur: InvoiceData) => {
      const valor = Number(cur.total) || 0;
      
      // Lógica do Gráfico: Agrupar por mês da data (YYYY-MM-DD)
      const dataDoc = new Date(cur.date);
      if (!isNaN(dataDoc.getTime())) {
        const mes = dataDoc.getMonth(); 
        if (cur.type === "NC") {
            totalsByMonth[mes] -= valor;
        } else {
            totalsByMonth[mes] += valor;
        }
      }

      // Total Geral (Subtrai Notas de Crédito)
      return cur.type === "NC" ? acc - valor : acc + valor;
    }, 0);

    // 2. Calcular Faturas Pendentes (FT emitidas mas não pagas)
    const pendentesList = faturas.filter((f: InvoiceData) => f.type === "FT" && f.status === "Emitida");
    const totalPendentes = pendentesList.reduce((acc: number, cur: InvoiceData) => acc + (Number(cur.total) || 0), 0);

    setRealStats({
      faturacaoTotal: total,
      pendentes: totalPendentes,
      qtdPendentes: pendentesList.length,
      novosClientes: clientes.length,
      taxaConversao: faturas.length > 0 ? 100 : 0,
      churnScore: 0,
      churnRecommendation: ""
    });

    setMonthlyData(totalsByMonth);

    // Call API to get churn risk
    const fetchChurn = async () => {
      // Usar um company_id estático para já (ex: 1)
      const data = await getChurnRisk(1);
      if (data && data.risk_score !== undefined) {
        setRealStats(prev => ({
          ...prev,
          churnScore: data.risk_score,
          churnRecommendation: data.recommendation || ""
        }));
      }
    };
    fetchChurn();
  }, []);

  // FUNÇÃO PARA EXPORTAR SAFT-AO (NORMA AGT)
  const handleExportSAFT = () => {
    const invoices: InvoiceData[] = JSON.parse(localStorage.getItem("system_invoices") || "[]");
    const company = JSON.parse(localStorage.getItem("empresa_config") || "{}");

    if (!company.nif) {
      alert("Por favor, configure os dados da empresa antes de exportar o SAFT.");
      return;
    }

    const xmlContent = `<?xml version="1.0" encoding="Windows-1252"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO:1.01_01">
  <Header>
    <CompanyID>${company.nif}</CompanyID>
    <TaxRegistrationNumber>${company.nif}</TaxRegistrationNumber>
    <CompanyName>${company.nomeEmpresa}</CompanyName>
    <BusinessName>${company.nomeEmpresa}</BusinessName>
  </Header>
  <SourceDocuments>
    <SalesInvoices>
      <NumberOfEntries>${invoices.length}</NumberOfEntries>
      <TotalDebit>0.00</TotalDebit>
      <TotalCredit>${realStats.faturacaoTotal.toFixed(2)}</TotalCredit>
      ${invoices.map((inv: InvoiceData) => `
      <Invoice>
        <InvoiceNo>${inv.id}</InvoiceNo>
        <InvoiceDate>${inv.date}</InvoiceDate>
        <InvoiceType>${inv.type}</InvoiceType>
        <CustomerID>${inv.clientNif || '999999999'}</CustomerID>
        <Line><UnitPrice>${inv.total}</UnitPrice></Line>
      </Invoice>`).join('')}
    </SalesInvoices>
  </SourceDocuments>
</AuditFile>`;

    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SAFT_AO_${company.nif}_2026.xml`;
    link.click();
  };

  const documentTypes = [
    { id: "FT", name: "Fatura (FT)", icon: FileText, desc: "Venda a crédito padrão", color: "bg-blue-50 text-blue-600" },
    { id: "FR", name: "Fatura Recibo (FR)", icon: FileCheck, desc: "Venda pronto a pagamento", color: "bg-green-50 text-green-600" },
    { id: "PP", name: "Pro-forma (PP)", icon: FileText, desc: "Orçamento sem valor fiscal", color: "bg-purple-50 text-purple-600" },
    { id: "NC", name: "Nota de Crédito (NC)", icon: ArrowLeftRight, desc: "Retificação/Anulação", color: "bg-red-50 text-red-600" },
    { id: "ND", name: "Nota de Débito (ND)", icon: TrendingUp, desc: "Ajuste de valor a favor", color: "bg-orange-50 text-orange-600" },
    { id: "RS", name: "Rascunhos", icon: FileCode, desc: "Edição pendente", color: "bg-slate-100 text-slate-600" },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic leading-none">Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Visão Global do Negócio</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportSAFT}
            className="inline-flex items-center justify-center rounded-xl text-[10px] font-black bg-white border border-slate-200 text-slate-700 h-10 px-4 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest"
          >
            <Download className="mr-2 h-3 w-3" /> Exportar SAFT-AO
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-xl text-[10px] font-black bg-[#0f172a] text-white h-10 px-4 shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest"
          >
            <Plus className="mr-2 h-3 w-3" /> Novo Documento
          </button>
        </div>
      </div>

      {/* MODAL SELEÇÃO DOCUMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white"><FileText size={20}/></div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic">Tipo de Documento</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.map((doc) => (
                <Link 
                  key={doc.id} 
                  href={`/documents/create?type=${doc.id}`}
                  className="flex items-start gap-4 p-5 rounded-[2rem] border border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all group"
                  onClick={() => setIsModalOpen(false)}
                >
                  <div className={`p-3 rounded-2xl transition-all ${doc.color} group-hover:scale-110`}>
                    <doc.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm uppercase italic">{doc.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-tight mt-1 uppercase tracking-tighter">{doc.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CARDS COM DADOS REAIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Faturação Total" 
          value={`${realStats.faturacaoTotal.toLocaleString()} Kz`} 
          trend="+ Líquido" 
          trendUp={true} 
          icon={DollarSign} 
        />
        <MetricCard 
          title="Pendente (FT)" 
          value={`${realStats.pendentes.toLocaleString()} Kz`} 
          description={`${realStats.qtdPendentes} documentos`} 
          icon={FileText} 
        />
        <MetricCard 
          title="Clientes Ativos" 
          value={realStats.novosClientes.toString()} 
          trend="Base de Dados" 
          trendUp={true} 
          icon={Users} 
        />
        <MetricCard 
          title="Risco de Churn" 
          value={realStats.churnScore > 0 ? `${(realStats.churnScore * 100).toFixed(0)}%` : '---'} 
          trend={realStats.churnRecommendation ? realStats.churnRecommendation.substring(0, 20) + '...' : 'Análise IA em curso'} 
          trendUp={realStats.churnScore < 0.5} 
          icon={Activity} 
        />
      </div>

      {/* ÁREA DE GRÁFICOS / ESTADO VAZIO */}
      {hasInvoices ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 bg-white p-6 rounded-[2.5rem] border shadow-sm">
              <BillingChart />
          </div>
          <div className="col-span-3 bg-white p-6 rounded-[2.5rem] border shadow-sm">
              <RecentInvoices />
          </div>
        </div>
      ) : (
        <div className="w-full bg-white border border-slate-100 rounded-[3rem] p-12 md:p-20 shadow-sm flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 relative">
            <LayoutTemplate className="text-slate-300" size={48} />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg animate-bounce">
              <Plus size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#0f172a] uppercase italic tracking-tight">O seu arquivo está pronto</h3>
          <p className="text-slate-500 max-w-md mt-4 font-medium leading-relaxed">
            Ainda não emitiu faturas ou documentos este mês. <br /> 
            Clique no botão abaixo para criar o seu primeiro documento fiscal certificado pela AGT.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-10 flex items-center gap-3 bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95"
          >
            <MousePointer2 size={16} /> Começar Faturação
          </button>
        </div>
      )}
    </div>
  );
}