"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Mail, Phone, Trash2, Edit2, X, Save, AlertTriangle, MapPin } from "lucide-react";
// IMPORTANTE: Se o erro do proxy.ts persistir, confirma se tens o "export" antes do "const apiFetch" no teu ficheiro src/proxy.ts
import { apiFetch } from "@/lib/api";

// Interface para os dados como o Frontend/UI os usa
interface ClientData {
  id: string;
  nome: string;
  nif: string;
  telefone: string;
  email: string;
  endereco: string;
  status: string;
}

// Interface para os dados como o Backend/Python os devolve
interface APIClient {
  id: string;
  name: string;
  nif: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // IDs agora são strings (UUID do PostgreSQL)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [clients, setClients] = useState<ClientData[]>([]);
  const [formData, setFormData] = useState({ nome: "", nif: "", telefone: "", email: "", endereco: "" });
  const [isLoading, setIsLoading] = useState(true);

  const userRole = "Administrador"; // Idealmente virá do teu contexto de Auth

  // 1. LER CLIENTES DA API
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch("/api/clients/");
      
      // Mapear os dados do backend para o formato que a tua UI espera
      const formattedClients = data.map((c: APIClient) => ({
        id: c.id,
        nome: c.name,
        nif: c.nif || "Consumidor Final",
        telefone: c.phone || "",
        email: c.email || "",
        endereco: c.address || "",
        status: "Ativo" // Default para a UI
      }));
      
      setClients(formattedClients);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      alert("Não foi possível carregar a lista de clientes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.nif.includes(searchTerm)
  );

  // 2. CRIAR OU ATUALIZAR CLIENTE NA API
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar payload com os nomes de colunas do backend
    const payload = {
      name: formData.nome,
      nif: formData.nif,
      phone: formData.telefone,
      email: formData.email,
      address: formData.endereco,
      city: "Luanda" // Podes adicionar um campo cidade no formulário depois
    };

    try {
      if (editingId) {
        // Atualizar existente
        await apiFetch(`/api/clients/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        // Criar novo
        await apiFetch("/api/clients/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      
      await fetchClients(); // Recarregar a lista da BD
      closeModal();
    } catch (error) {
      console.error("Erro ao guardar cliente:", error);
      alert("Ocorreu um erro ao guardar o cliente.");
    }
  };

  const openEditModal = (client: ClientData) => {
    setEditingId(client.id);
    setFormData({ 
      nome: client.nome, 
      nif: client.nif === "Consumidor Final" ? "" : client.nif, 
      telefone: client.telefone, 
      email: client.email,
      endereco: client.endereco || "" 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nome: "", nif: "", telefone: "", email: "", endereco: "" });
  };

  const confirmDelete = (id: string) => {
    if (userRole !== "Administrador") {
      alert("Apenas o Administrador tem permissão para eliminar clientes.");
      return;
    }
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // 3. ELIMINAR CLIENTE NA API
  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      await apiFetch(`/api/clients/${clientToDelete}`, {
        method: "DELETE",
      });
      
      await fetchClients(); // Recarregar a lista
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error("Erro ao eliminar cliente:", error);
      alert("Ocorreu um erro ao eliminar o cliente.");
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Gestão de Clientes</h1>
            <p className="text-slate-500 text-sm">Gira os dados e endereços fiscais dos seus parceiros.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95">
            <Plus size={20} /> Novo Cliente
          </button>
        </div>

        {/* CAMPO DE PROCURA */}
        <div className="relative group max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Procurar por nome ou NIF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px]">Cliente / NIF</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px]">Endereço Fiscais (AGT)</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">A carregar clientes...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">Nenhum cliente encontrado.</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{client.nome}</div>
                      <div className="text-xs text-slate-400 tracking-tight font-medium">NIF: {client.nif}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-start gap-2 max-w-[300px]">
                        <MapPin size={14} className="mt-1 flex-shrink-0 text-slate-400"/> 
                        <span className="line-clamp-2 italic text-xs">{client.endereco}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(client)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit2 size={16}/>
                        </button>
                        <button onClick={() => confirmDelete(client.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL REGISTO/EDIÇÃO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in duration-200">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
                <h2 className="text-xl font-bold text-slate-900">{editingId ? "Editar Cliente" : "Registar Novo Cliente"}</h2>
                <button type="button" onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nome Completo / Empresa</label>
                    <input required value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">NIF</label>
                    <input required value={formData.nif} onChange={(e) => setFormData({...formData, nif: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Telefone</label>
                    <input value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">E-mail</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Endereço Completo</label>
                    <textarea required rows={3} value={formData.endereco} onChange={(e) => setFormData({...formData, endereco: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl focus:border-blue-500 outline-none transition-all resize-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={closeModal} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancelar</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"><Save size={18}/> Guardar Dados</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAÇÃO */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center animate-in slide-in-from-bottom-4 duration-200">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Eliminar Cliente?</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Esta ação removerá o endereço e dados fiscais permanentemente.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all">Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}