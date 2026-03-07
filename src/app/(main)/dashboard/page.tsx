"use client";

import React, { useState } from "react";
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

  // Definição dos tipos que alimentam o preenchimento específico
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
      {/* CABEÇALHO DO DASHBOARD (Sem alterações estruturais) */}
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

      {/* O MODAL É ONDE A EDIÇÃO DO TIPO ACONTECE */}
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
                  href={`/invoices/create?type=${doc.id}`}
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

      {/* CARDS E GRÁFICOS (Permanecem iguais) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Faturação Total" value="Kz 24.500.000" trend="+20.1% este mês" trendUp={true} icon={DollarSign} />
        <MetricCard title="Faturas Pendentes" value="Kz 2.350.000" description="5 faturas" icon={FileText} />
        <MetricCard title="Novos Clientes" value="+12" trend="+4 novos hoje" trendUp={true} icon={Users} />
        <MetricCard title="Taxa de Conversão" value="98%" trend="-1.2% este mês" trendUp={false} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4"><BillingChart /></div>
        <div className="col-span-3"><RecentInvoices /></div>
      </div>
    </div>
  );
}