"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Package, Edit2, Trash2, Tag, X, Save } from "lucide-react";

interface Product {
  id: string;
  descricao: string;
  preco: number;
  tipo: "Produto" | "Serviço";
  iva: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estados para o Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    descricao: "",
    preco: "",
    tipo: "Serviço" as "Produto" | "Serviço"
  });

  useEffect(() => {
    const saved = localStorage.getItem("facturas_products");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  const saveToLocalStorage = (data: Product[]) => {
    setProducts(data);
    localStorage.setItem("facturas_products", JSON.stringify(data));
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ descricao: product.descricao, preco: product.preco.toString(), tipo: product.tipo });
    } else {
      setEditingProduct(null);
      setFormData({ descricao: "", preco: "", tipo: "Serviço" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      descricao: formData.descricao,
      preco: Number(formData.preco),
      tipo: formData.tipo,
      iva: 0.14
    };

    let updatedList;
    if (editingProduct) {
      updatedList = products.map(p => p.id === editingProduct.id ? newProduct : p);
    } else {
      updatedList = [newProduct, ...products];
    }

    saveToLocalStorage(updatedList);
    setIsModalOpen(false);
  };

  const deleteProduct = (id: string) => {
    if (confirm("Deseja eliminar este item?")) {
      saveToLocalStorage(products.filter(p => p.id !== id));
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
            placeholder="Procurar por nome..." 
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
                <th className="px-8 py-5">Descrição</th>
                <th className="px-6 py-5">Tipo</th>
                <th className="px-6 py-5 text-right">Preço Unitário</th>
                <th className="px-8 py-5 text-center">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {products.filter(p => p.descricao.toLowerCase().includes(searchQuery.toLowerCase())).map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 group">
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
              ))}
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
                <h3 className="text-xl font-black text-slate-900">{editingProduct ? 'Editar Item' : 'Novo Item'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Descrição do Serviço/Produto</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Ex: Manutenção Mensal..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Preço (Kz)</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                      value={formData.preco}
                      onChange={e => setFormData({...formData, preco: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tipo</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none cursor-pointer"
                      value={formData.tipo}
                      onChange={e => setFormData({...formData, tipo: e.target.value as any})}
                    >
                      <option value="Serviço">Serviço</option>
                      <option value="Produto">Produto</option>
                    </select>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 mt-4">
                  <Save size={18} /> {editingProduct ? 'Guardar Alterações' : 'Adicionar ao Catálogo'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}