"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Shield, Users, Trash2, CreditCard, 
  RefreshCw, UserCircle, X, Check, Mail, MessageSquare, Edit3, ArrowUpCircle,
  CalendarDays, Timer, History
} from 'lucide-react';

// 1. Configuração Única de Planos e Limites (Referência para todo o código)
const PLAN_CONFIG: Record<string, { limit: number; price: number }> = {
  Standard: { limit: 2, price: 15000 },
  Medium: { limit: 6, price: 20000 },
  Premium: { limit: 10, price: 26000 }
};

export default function AccountPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Mensal");
  const [selectedUpgrade, setSelectedUpgrade] = useState("Standard");
  
  // 2. Dados de Subscrição com as novas métricas solicitadas
  const [subData, setSubData] = useState({
    plano: "Standard",
    periodo: "Mensal",           
    dataCarregamento: "2026-02-10", 
    dataExpira: "2026-06-10",
    diasFaltam: 0               
  });

  const [users, setUsers] = useState([
    { id: 1, name: "Paulo Freitas", email: "paulo@exemplo.ao", role: "Administrador", isOwner: true }
  ]);

  useEffect(() => {
    setIsMounted(true);
    
    // Cálculo dinâmico de dias restantes
    const calcularDias = () => {
      const hoje = new Date();
      const expira = new Date(subData.dataExpira);
      const diffTime = expira.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    };

    setSubData(prev => ({ ...prev, diasFaltam: calcularDias() }));

    const savedUsers = localStorage.getItem("system_users");
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, [subData.dataExpira]);

  // GESTÃO DE UTILIZADORES
  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (users.length >= PLAN_CONFIG[subData.plano].limit) {
      return alert("Limite de utilizadores atingido para o seu plano atual.");
    }
    const formData = new FormData(e.currentTarget);
    const newUser = {
      id: Date.now(),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      isOwner: false
    };
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem("system_users", JSON.stringify(updated));
    setShowUserModal(false);
  };

  const deleteUser = (id: number) => {
    if (confirm("Deseja remover este acesso permanentemente?")) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem("system_users", JSON.stringify(updated));
    }
  };

  const handleEditProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated = users.map(u => u.isOwner ? { ...u, name: formData.get("name") as string, email: formData.get("email") as string } : u);
    setUsers(updated);
    localStorage.setItem("system_users", JSON.stringify(updated));
    setShowProfileModal(false);
    alert("Perfil atualizado!");
  };

  if (!isMounted) return null;
  const admin = users.find(u => u.isOwner);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-8 tracking-tight uppercase italic font-black text-left">Gestão da Conta</h1>

        {/* 1. SECCÃO DE SUBSCRICÃO (DETALHES REAIS) */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800 uppercase italic">
              <CreditCard size={20} className="text-blue-600" /> Detalhes do Plano
            </h2>
            <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
              Ciclo {subData.periodo}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Plano Atual" value={subData.plano} color="text-blue-600" icon={<Shield size={14}/>} />
            <StatCard label="Carregado em" value={new Date(subData.dataCarregamento).toLocaleDateString()} icon={<History size={14}/>} />
            <StatCard label="Expira em" value={subData.dataExpira} color="text-red-600" isAlert={subData.diasFaltam <= 5} icon={<CalendarDays size={14}/>} />
            <StatCard label="Dias Restantes" value={`${subData.diasFaltam} Dias`} color={subData.diasFaltam <= 5 ? "text-red-600" : "text-green-600"} icon={<Timer size={14}/>} />
            <StatCard label="Utilizadores" value={`${users.length} / ${PLAN_CONFIG[subData.plano].limit}`} icon={<Users size={14}/>}/>
          </div>
          
          <div className="mt-8 flex gap-3">
            <button onClick={() => { setSelectedUpgrade(subData.plano); setShowPlanModal(true); }} className="px-6 py-3 bg-[#0f172a] text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition shadow-lg uppercase tracking-wider">
              <RefreshCw size={16} /> Renovar Subscrição
            </button>
            <button onClick={() => { setSelectedUpgrade("Medium"); setShowPlanModal(true); }} className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 uppercase tracking-wider">
              <ArrowUpCircle size={16} className="text-blue-600" /> Alterar Plano
            </button>
          </div>
        </section>

        {/* 2. EQUIPA */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800 uppercase italic"><Users size={20} /> Equipa</h2>
            <button onClick={() => setShowUserModal(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black flex items-center gap-2 transition hover:bg-indigo-100 uppercase tracking-tighter">
              <UserPlus size={16} /> Novo Utilizador
            </button>
          </div>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-transparent hover:border-slate-200 transition">
                <div>
                  <p className="text-sm font-bold text-slate-900">{u.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{u.role} • {u.email}</p>
                </div>
                {!u.isOwner && <button onClick={() => deleteUser(u.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>}
              </div>
            ))}
          </div>
        </section>

        {/* 3. PERFIL */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 uppercase italic"><UserCircle size={20} /> Meu Perfil</h2>
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{admin?.name.substring(0, 2)}</div>
              <p className="text-sm font-bold">{admin?.name}</p>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-white transition flex items-center gap-2 uppercase tracking-widest font-black">
              <Edit3 size={14}/> Editar Dados
            </button>
          </div>
        </section>

        {/* MODAL CONFIGURAÇÃO PAGAMENTO (Valores das imagens) */}
        {showPlanModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setShowPlanModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black text-slate-900 mb-6 uppercase italic">Configurar Pagamento</h3>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {Object.keys(PLAN_CONFIG).map((p) => (
                  <button key={p} onClick={() => { setSelectedUpgrade(p); if(p !== "Standard" && selectedPeriod === "Mensal") setSelectedPeriod("Trimestral"); }} className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedUpgrade === p ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{p}</p>
                    <p className="text-sm font-black text-slate-900">{PLAN_CONFIG[p].price.toLocaleString()} Kz</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Base Período</p>
                  </button>
                ))}
              </div>

              <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block ml-1">Período de Faturação</label>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                {["Mensal", "Trimestral", "Semestral", "Anual"].map((period) => (
                  <button key={period} disabled={period === "Mensal" && selectedUpgrade !== "Standard"} onClick={() => setSelectedPeriod(period)} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${selectedPeriod === period ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 disabled:opacity-30'}`}>
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-[2rem] mb-8 shadow-xl">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total a Pagar ({selectedPeriod})</p>
                    <p className="text-3xl font-black">
                      {(() => {
                        const prices: any = {
                          Standard: { Mensal: 15000, Trimestral: 18000, Semestral: 35000, Anual: 65000 },
                          Medium: { Trimestral: 20000, Semestral: 39000, Anual: 74000 },
                          Premium: { Trimestral: 26000, Semestral: 45000, Anual: 85000 }
                        };
                        return prices[selectedUpgrade][selectedPeriod]?.toLocaleString() || "---";
                      })()} 
                      <span className="text-sm ml-1 font-normal opacity-60">Kz</span>
                    </p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 italic uppercase">Ref. Multicaixa</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => alert("E-mail enviado!")} className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-50 transition-all"><Mail size={18}/> Enviar E-mail</button>
                <button onClick={() => alert("SMS enviado!")} className="flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-blue-700 transition-all shadow-lg"><MessageSquare size={18}/> Enviar SMS</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDITAR PERFIL */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <form onSubmit={handleEditProfile} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
              <h3 className="text-xl font-black mb-6 uppercase italic">Editar Perfil</h3>
              <div className="space-y-4">
                <input name="name" defaultValue={admin?.name} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="Nome" required />
                <input name="email" defaultValue={admin?.email} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="E-mail" required />
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Salvar Alterações</button>
                <button type="button" onClick={() => setShowProfileModal(false)} className="w-full text-[10px] font-black text-slate-400 uppercase mt-4">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL NOVO UTILIZADOR */}
        {showUserModal && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <form onSubmit={handleAddUser} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
              <h3 className="text-xl font-black mb-6 uppercase italic text-indigo-600">Convidar Membro</h3>
              <div className="space-y-4">
                <input name="name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="Nome" required />
                <input name="email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" placeholder="E-mail" required />
                <select name="role" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm bg-white">
                  <option value="Vendedor">Vendedor</option>
                  <option value="Gestor">Gestor</option>
                  <option value="Contabilista">Contabilista</option>
                </select>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Ativar Acesso</button>
                <button type="button" onClick={() => setShowUserModal(false)} className="w-full text-[10px] font-black text-slate-400 uppercase mt-4">Fechar</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-slate-700", isAlert = false, icon }: any) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${isAlert ? 'bg-red-50 border-red-100 animate-pulse' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-slate-400">{icon}</span>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-base font-black ${color}`}>{value}</p>
    </div>
  );
}