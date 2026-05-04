"use client";

import React, { useEffect, useState } from "react";
import { adminApi } from "@/services/api";
import { Users, AlertTriangle, CheckCircle, Ban, Building2, FileText, DollarSign, MapPin, Phone } from "lucide-react";

interface User {
  id: number;
  email: string;
  role: string;
  status: string;
  created_at: string;
  company_name?: string;
  company_nif?: string;
  company_address?: string;
  company_phone?: string;
}

interface Stats {
  total_users: number;
  suspended_users: number;
  total_companies: number;
  total_invoices: number;
  total_billing: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ total_users: 0, suspended_users: 0, total_companies: 0, total_invoices: 0, total_billing: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.status === "active") {
        await adminApi.suspendUser(user.id);
      } else {
        await adminApi.activateUser(user.id);
      }
      fetchData();
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-300">A carregar painel de controlo...</div>;
  if (error) return <div className="p-20 text-center text-red-500 font-bold uppercase tracking-widest">Acesso Negado: {error}</div>;

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return user.email.toLowerCase().includes(term) || 
           user.company_name?.toLowerCase().includes(term) || 
           user.company_nif?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* CABEÇALHO */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Central de <span className="text-purple-600 underline decoration-slate-200">Administração</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Visão Global do Ecossistema +Facturas</p>
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-blue-500 opacity-30"><Users size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Total</span></div>
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.total_users}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Utilizadores</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-emerald-500 opacity-30"><Building2 size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Negócios</span></div>
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.total_companies}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Empresas Activas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-purple-500 opacity-30"><FileText size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Volume</span></div>
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.total_invoices}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Facturas Emitidas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-amber-500 opacity-30"><AlertTriangle size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Alertas</span></div>
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.suspended_users}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Contas Suspensas</p>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl shadow-blue-900/20 flex flex-col justify-between h-32 text-white">
          <div className="flex justify-between items-center text-blue-400"><DollarSign size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Faturamento</span></div>
          <div>
            <p className="text-2xl font-black tracking-tighter">{(stats.total_billing || 0).toLocaleString()} <span className="text-xs font-normal opacity-50">Kz</span></p>
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">Total Transaccionado</p>
          </div>
        </div>

      </div>

      {/* LISTAGEM DE EMPRESAS/UTILIZADORES */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Gestão de Parceiros</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dados detalhados das empresas e administradores</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="PESQUISAR EMPRESA OU NIF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-12 py-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-purple-500 w-full md:w-80 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">ID</th>
                <th className="px-10 py-6">Empresa / Detalhes</th>
                <th className="px-10 py-6">Administrador</th>
                <th className="px-10 py-6 text-center">Estado</th>
                <th className="px-10 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-10 py-8 text-xs font-black text-slate-300 group-hover:text-slate-900">#{user.id}</td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-base font-black text-slate-900 uppercase italic leading-tight">{user.company_name || "Sem Empresa"}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIF: {user.company_nif || "---"}</span>
                        <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-slate-500">
                           <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-300" /> {user.company_address || "Luanda, Angola"}</span>
                           <span className="flex items-center gap-1"><Phone size={12} className="text-slate-300" /> {user.company_phone || "--- --- ---"}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-slate-900">{user.email}</span>
                        <span className={`text-[9px] w-fit px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                            user.role === 'super_admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {user.role}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Membro desde {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      user.status.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {user.status.toLowerCase() === 'active' ? <CheckCircle size={12} /> : <Ban size={12} />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    {user.role !== 'super_admin' && (
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${
                          user.status.toLowerCase() === 'active' 
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {user.status.toLowerCase() === 'active' ? 'Suspender' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
