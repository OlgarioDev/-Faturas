"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Package, Edit2, Trash2, Tag, X, Save } from "lucide-react";
import { apiFetch } from "@/lib/api"; // O nosso mensageiro oficial!

// Interface UI
interface ProductData {
  id: string;
  codigo: string;
  descricao: string;
  preco: number;
  tipo: "Produto" | "Serviço";
  iva: number;
}

// Interface Backend
interface APIProduct {
  id: string;
  code: string;
  name: string;
  unit_price: number;
  product_type: "Produto" | "Serviço";
  tax_type: string;
  tax_percentage: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para o Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    preco: "",
    tipo: "Serviço" as "Produto" | "Serviço"
  });

  // 1. LER PRODUTOS DA API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch("/api/products/");
      
      const formattedProducts = data.map((p: APIProduct) => ({
        id: p.id,
        codigo: p.code,
        descricao: p.name,
        preco: p.unit_price,
        tipo: p.product_type || (p.code.startsWith('S') ? "Serviço" : "Produto"), // Usa o tipo da BD ou fallback
        iva: p.tax_percentage
      }));
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert("Não foi possível carregar o catálogo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: ProductData) => {
    if (product) {
      setEditingId(product.id);
      setFormData({ 
        codigo: product.codigo,
        descricao: product.descricao, 
        preco: product.preco.toString(), 
        tipo: product.tipo 
      });
    } else {
      setEditingId(null);
      setFormData({ codigo: "", descricao: "", preco: "", tipo: "Serviço" });
    }
    setIsModalOpen(true);
  };

  // 2. CRIAR OU ATUALIZAR NA API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Payload mapeado para o formato do SQLAlchemy (Python)
    const payload = {
      code: formData.codigo,
      name: formData.descricao,
      unit_price: Number(formData.preco),
      product_type: formData.tipo, // <-- Adicionado para gravar na nova coluna!
      tax_type: "IVA",
      tax_percentage: 14.0 // Valor padrão para Angola. Depois podes adicionar isenções.
    };

    try {
      if (editingId) {
        await apiFetch(`/api/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/products/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      
      await fetchProducts(); // Recarrega a tabela da BD
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao guardar item:", error);
      alert("Ocorreu um erro ao guardar o produto.");
    }
  };

  // 3. ELIMINAR NA API
  const deleteProduct = async (id: string) => {
    if (!confirm("Deseja eliminar este item permanentemente?")) return;

    try {
      await apiFetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      await fetchProducts();
    } catch (error) {
      console.error("Erro ao eliminar:", error);
      alert("Erro ao eliminar o produto.");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Produtos/Serviços</h1>
            <p className="text-slate-500 font-medium italic">Configure o seu catálogo de vendas e preços oficiais.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} /> Novo Item
          </button>
        </div>

        {/* BARRA DE PESQUISA */}
        <div className="relative group max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={20} />
          <input 
            type="text" 
            placeholder="Procurar por nome ou código..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-6 py-5">Código</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-6 py-5">Tipo</th>
                <th className="px-6 py-5 text-right">Preço Unitário</th>
                <th className="px-8 py-5 text-center">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">A carregar catálogo...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">O catálogo está vazio.</td></tr>
              ) : (
                products.filter(p => 
                  p.descricao.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  p.codigo.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 group">
                    <td className="px-6 py-5 font-mono text-xs text-slate-500">{product.codigo}</td>
                    <td className="px-8 py-5 font-bold text-slate-800">{product.descricao}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        product.tipo === "Produto" ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {product.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">
                      {product.preco.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-300 hover:text-blue-500 transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">{editingId ? 'Editar Item' : 'Novo Item'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Código (AGT)</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none uppercase"
                      value={formData.codigo}
                      onChange={e => setFormData({...formData, codigo: e.target.value})}
                      placeholder="Ex: S001"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tipo</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none cursor-pointer"
                      value={formData.tipo}
                      onChange={e => setFormData({...formData, tipo: e.target.value as "Produto" | "Serviço"})}
                    >
                      <option value="Serviço">Serviço</option>
                      <option value="Produto">Produto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Descrição do Serviço/Produto</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Ex: Consultoria Técnica..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Preço Sem IVA (Kz)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                    value={formData.preco}
                    onChange={e => setFormData({...formData, preco: e.target.value})}
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 mt-4">
                  <Save size={18} /> {editingId ? 'Guardar Alterações' : 'Adicionar ao Catálogo'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}