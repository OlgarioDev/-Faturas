"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Shield, Users, Trash2, CreditCard, 
  RefreshCw, UserCircle, X, Check, Mail, MessageSquare, Edit3, ArrowUpCircle
} from 'lucide-react';

// Configuração de Planos e Limites
const PLAN_CONFIG = {
  Standard: { limit: 3, monthly: true, price: 15000 },
  Medium: { limit: 5, monthly: false, price: 65000 }, // Apenas ciclos maiores
  Premium: { limit: 10, monthly: false, price: 120000 }
};

export default function AccountPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Mensal");
  const [selectedUpgrade, setSelectedUpgrade] = useState("Medium");
  
  const [subData, setSubData] = useState({
    plano: "Standard",
    dataExpira: "2026-03-10",
  });

  const [users, setUsers] = useState([
    { id: 1, name: "Paulo Freitas", email: "paulo@exemplo.ao", role: "Administrador", isOwner: true }
  ]);

  useEffect(() => {
    setIsMounted(true);
    const savedUsers = localStorage.getItem("system_users");
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  // GESTÃO DE UTILIZADORES (ADICIONAR/APAGAR)
  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (users.length >= PLAN_CONFIG[subData.plano as keyof typeof PLAN_CONFIG].limit) {
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

  // EDIÇÃO DE PERFIL
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
        <h1 className="text-2xl font-bold text-[#0f172a] mb-8 tracking-tight uppercase italic font-black">Gestão da Conta</h1>

        {/* 1. SUBSCRICÃO */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
            <CreditCard size={20} className="text-blue-600" /> Detalhes do Plano
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Plano Atual" value={subData.plano} color="text-blue-600" />
            <StatCard label="Expira em" value={subData.dataExpira} color="text-red-600" />
            <StatCard label="Utilizadores" value={`${users.length} / ${PLAN_CONFIG[subData.plano as keyof typeof PLAN_CONFIG].limit}`} />
          </div>
          
          <div className="mt-6 flex gap-3">
            <button onClick={() => { setSelectedUpgrade(subData.plano); setShowPlanModal(true); }} className="px-6 py-2 bg-[#0f172a] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm uppercase">
              <RefreshCw size={16} /> Renovar Subscrição
            </button>
            <button onClick={() => { setSelectedUpgrade("Medium"); setShowPlanModal(true); }} className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 uppercase">
              <ArrowUpCircle size={16} className="text-blue-600" /> Alterar Plano
            </button>
          </div>
        </section>

        {/* 2. EQUIPA */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800"><Users size={20} /> Equipa</h2>
            <button onClick={() => setShowUserModal(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-2 transition hover:bg-indigo-100">
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
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><UserCircle size={20} /> Meu Perfil</h2>
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{admin?.name.substring(0, 2)}</div>
              <p className="text-sm font-bold">{admin?.name}</p>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-white transition flex items-center gap-2">
              <Edit3 size={14}/> Editar Dados
            </button>
          </div>
        </section>

        {/* MODAL ALTERAR/RENOVAR PLANO */}
        {showPlanModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setShowPlanModal(false)} className="absolute top-6 right-6 text-slate-400"><X size={24}/></button>
              <h3 className="text-xl font-black text-slate-900 mb-6 uppercase italic">Configurar Pagamento</h3>

              {/* SELEÇÃO DE PLANO */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {Object.keys(PLAN_CONFIG).filter(p => p !== "Gratuito").map((p) => (
                  <button key={p} onClick={() => { setSelectedUpgrade(p); if(p !== "Standard") setSelectedPeriod("Trimestral"); }} className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedUpgrade === p ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{p}</p>
                    <p className="text-sm font-black text-slate-900">{PLAN_CONFIG[p as keyof typeof PLAN_CONFIG].price.toLocaleString()} Kz</p>
                  </button>
                ))}
              </div>

              {/* SELEÇÃO DE CICLO */}
              <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">Período de Faturação</label>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                {["Mensal", "Trimestral", "Semestral", "Anual"].map((period) => (
                  <button 
                    key={period} 
                    disabled={period === "Mensal" && selectedUpgrade !== "Standard"}
                    onClick={() => setSelectedPeriod(period)} 
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${selectedPeriod === period ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 disabled:opacity-20'}`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => alert("Referência enviada para o seu e-mail de administrador.")} className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase"><Mail size={16}/> Enviar E-mail</button>
                <button onClick={() => alert("Referência enviada por SMS para o contacto da empresa.")} className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase"><MessageSquare size={16}/> Enviar SMS</button>
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
                <button type="button" onClick={() => setShowProfileModal(false)} className="w-full text-xs font-bold text-slate-400 uppercase">Cancelar</button>
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
                <button type="button" onClick={() => setShowUserModal(false)} className="w-full text-xs font-bold text-slate-400 uppercase">Fechar</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-slate-700", isAlert = false }: any) {
  return (
    <div className={`p-4 rounded-xl border ${isAlert ? 'bg-red-50 border-red-100 animate-pulse' : 'bg-slate-50 border-slate-100'}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-base font-black ${color}`}>{value}</p>
    </div>
  );
}