"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/MetricCard";
import { BillingChart } from "@/components/BillingChart";
import { RecentInvoices } from "@/components/RecentInvoices";
import { 
  DollarSign, FileText, Users, TrendingUp, Plus, 
  Download, FileCheck, ArrowLeftRight, X,
  Activity, MousePointer2, LayoutTemplate, Loader2
} from "lucide-react";
import { getChurnRisk, apiFetch } from "@/services/api";

interface InvoiceData {
  id: string;
  created_at: string; 
  type: string;
  customer_name: string;
  total_amount: number; 
  status: string;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasInvoices, setHasInvoices] = useState(false);
  
  const [realStats, setRealStats] = useState({
    faturacaoTotal: 0,
    pendentes: 0,
    qtdPendentes: 0,
    novosClientes: 0,
    taxaConversao: 0,
    churnScore: 0,
    churnRecommendation: ""
  });

  const [monthlyData, setMonthlyData] = useState<number[]>(new Array(12).fill(0));

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // TAREFA 1: Sincronização com Supabase via API Python
        const faturas: InvoiceData[] = await apiFetch('/invoices/');
        const clientes = await apiFetch('/clients/');

        setHasInvoices(faturas && faturas.length > 0);

        const totalsByMonth = new Array(12).fill(0);
        let totalAcumulado = 0;
        let totalPendentes = 0;
        let contPendentes = 0;

        if (faturas && Array.isArray(faturas)) {
          faturas.forEach((inv) => {
            const valor = Number(inv.total_amount) || 0;
            const dataDoc = new Date(inv.created_at);

            if (!isNaN(dataDoc.getTime())) {
              const mes = dataDoc.getMonth();
              // Lógica de Notas de Crédito (Subtrai do gráfico e total)
              if (inv.type === "NC") {
                totalsByMonth[mes] -= valor;
                totalAcumulado -= valor;
              } else {
                totalsByMonth[mes] += valor;
                totalAcumulado += valor;
              }
            }

            // Faturas Pendentes (FT emitidas mas aguardando liquidação)
            if (inv.type === "FT" && inv.status !== "Paga" && inv.status !== "Anulada") {
              totalPendentes += valor;
              contPendentes++;
            }
          });
        }

        setRealStats(prev => ({
          ...prev,
          faturacaoTotal: totalAcumulado,
          pendentes: totalPendentes,
          qtdPendentes: contPendentes,
          novosClientes: clientes ? clientes.length : 0,
          taxaConversao: (faturas && faturas.length > 0) ? 100 : 0,
        }));

        setMonthlyData(totalsByMonth);

        // TAREFA 8: Insights de Churn via IA
        const churnData = await getChurnRisk(1); 
        if (churnData) {
          setRealStats(prev => ({
            ...prev,
            churnScore: churnData.risk_score || 0,
            churnRecommendation: churnData.recommendation || ""
          }));
        }

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // TAREFA 4: Exportação SAFT via Backend (Download Direto)
  const handleExportSAFT = () => {
    try {
      // Definimos a URL do backend (ajuste se a sua porta for diferente)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Abrimos a rota de exportação em uma nova aba para disparar o download do XML gerado pelo Python
      // Isso ignora qualquer validação local de "dados da empresa" e confia no banco de dados
      window.open(`${apiUrl}/api/saft/export/`, '_blank');
      
      console.log("Solicitação de download SAFT enviada ao servidor Python.");
    } catch (error) {
      console.error("Erro ao processar SAFT:", error);
      alert("Não foi possível gerar o SAFT. Verifique a conexão com o servidor.");
    }
  };

  const documentTypes = [
    { id: "FT", name: "Fatura (FT)", icon: FileText, desc: "Venda a crédito padrão", color: "bg-blue-50 text-blue-600" },
    { id: "FR", name: "Fatura Recibo (FR)", icon: FileCheck, desc: "Venda pronto a pagamento", color: "bg-green-50 text-green-600" },
    { id: "PP", name: "Pro-forma (PP)", icon: FileText, desc: "Orçamento sem valor fiscal", color: "bg-purple-50 text-purple-600" },
    { id: "NC", name: "Nota de Crédito (NC)", icon: ArrowLeftRight, desc: "Retificação/Anulação", color: "bg-red-50 text-red-600" },
    { id: "ND", name: "Nota de Débito (ND)", icon: TrendingUp, desc: "Ajuste de valor a favor", color: "bg-orange-50 text-orange-600" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic leading-none">Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Dados Sincronizados com Supabase</p>
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

      {/* Modal de Seleção de Documento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
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
                  <div className={`p-3 rounded-2xl ${doc.color} group-hover:scale-110 transition-transform`}>
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

      {/* Seção de Métricas Principais */}
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
          trend={realStats.churnRecommendation ? realStats.churnRecommendation.substring(0, 20) + '...' : 'Análise IA'} 
          trendUp={realStats.churnScore < 0.5} 
          icon={Activity} 
        />
      </div>

      {/* Gráfico e Faturas Recentes */}
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
        /* Estado Vazio (Zero Data) */
        <div className="w-full bg-white border border-slate-100 rounded-[3rem] p-12 md:p-20 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 relative">
            <LayoutTemplate className="text-slate-300" size={48} />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg">
              <Plus size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#0f172a] uppercase italic tracking-tight">O seu arquivo está pronto</h3>
          <p className="text-slate-500 max-w-md mt-4 font-medium leading-relaxed">
            Ainda não emitiu faturas ou documentos este mês. <br /> 
            Clique no botão abaixo para criar o seu primeiro documento fiscal certificado.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-10 flex items-center gap-3 bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all"
          >
            <MousePointer2 size={16} /> Começar Faturação
          </button>
        </div>
      )}
    </div>
  );
}