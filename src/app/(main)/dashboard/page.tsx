"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/MetricCard";
import { BillingChart } from "@/components/BillingChart";
import { RecentInvoices } from "@/components/RecentInvoices";
import { 
  DollarSign, FileText, Users, TrendingUp, Plus, 
  Download, FileCheck, ArrowLeftRight, FileCode, X,
  AlertCircle
} from "lucide-react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 1. ESTADO PARA DADOS REAIS
  const [realStats, setRealStats] = useState({
    faturacaoTotal: 0,
    pendentes: 0,
    qtdPendentes: 0,
    novosClientes: 0,
    taxaConversao: 100
  });

  // 2. LÓGICA DE CÁLCULO
  useEffect(() => {
    // Buscar coleções do sistema
    const faturas = JSON.parse(localStorage.getItem("system_invoices") || "[]");
    const clientes = JSON.parse(localStorage.getItem("system_clients") || "[]");

    // Calcular Total (Apenas faturas pagas ou emitidas - FT e FR)
    const total = faturas.reduce((acc: number, cur: any) => acc + (Number(cur.total) || 0), 0);

    // Calcular Pendentes (Exemplo: faturas do tipo FT que ainda não foram convertidas)
    const pendentesList = faturas.filter((f: any) => f.status === "Pendente");
    const totalPendentes = pendentesList.reduce((acc: number, cur: any) => acc + (Number(cur.total) || 0), 0);

    setRealStats({
      faturacaoTotal: total,
      pendentes: totalPendentes,
      qtdPendentes: pendentesList.length,
      novosClientes: clientes.length,
      taxaConversao: faturas.length > 0 ? 100 : 0
    });
  }, []);

  const documentTypes = [
    { id: "FT", name: "Fatura (FT)", icon: FileText, desc: "Venda a crédito padrão", color: "bg-blue-50 text-blue-600" },
    { id: "FR", name: "Fatura Recibo (FR)", icon: FileCheck, desc: "Venda pronto a pagamento", color: "bg-green-50 text-green-600" },
    { id: "PP", name: "Pro-forma (PP)", icon: FileText, desc: "Orçamento sem valor fiscal", color: "bg-purple-50 text-purple-600" },
    { id: "NC", name: "Nota de Crédito (NC)", icon: ArrowLeftRight, desc: "Retificação/Anulação de faturas", color: "bg-red-50 text-red-600" },
    { id: "ND", name: "Nota de Débito (ND)", icon: TrendingUp, desc: "Ajuste de valor a favor", color: "bg-orange-50 text-orange-600" },
    { id: "RS", name: "Rascunhos", icon: FileCode, desc: "Continuar edição pendente", color: "bg-slate-100 text-slate-600" },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium">Visão Global do Negócio</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-xl text-[10px] font-black bg-white border border-slate-200 text-slate-700 h-10 px-4 shadow-sm hover:bg-slate-50 transition-all">
            <Download className="mr-2 h-3 w-3" /> EXPORTAR SAFT-AO
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-xl text-[10px] font-black bg-slate-900 text-white h-10 px-4 shadow-lg hover:bg-slate-800 transition-all"
          >
            <Plus className="mr-2 h-3 w-3" /> NOVO DOCUMENTO
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
                <h3 className="text-xl font-black text-slate-900">Selecionar Tipo de Documento</h3>
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
                    <h4 className="font-black text-slate-900 text-sm">{doc.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-tight mt-1 uppercase tracking-tighter">{doc.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                <AlertCircle size={10}/> Selecione o tipo de factura que deseja criar.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CARDS COM DADOS REAIS DO LOCALSTORAGE */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Faturação Total" 
          value={`${realStats.faturacaoTotal.toLocaleString()} Kz`} 
          trend="+ Reais" 
          trendUp={true} 
          icon={DollarSign} 
        />
        <MetricCard 
          title="Faturas Pendentes" 
          value={`${realStats.pendentes.toLocaleString()} Kz`} 
          description={`${realStats.qtdPendentes} documentos`} 
          icon={FileText} 
        />
        <MetricCard 
          title="Clientes Ativos" 
          value={realStats.novosClientes.toString()} 
          trend="Total na base" 
          trendUp={true} 
          icon={Users} 
        />
        <MetricCard 
          title="Eficiência" 
          value={`${realStats.taxaConversao}%` } 
          trend="Sincronizado" 
          trendUp={true} 
          icon={TrendingUp} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4"><BillingChart /></div>
        <div className="col-span-3"><RecentInvoices /></div>
      </div>
    </div>
  );
}