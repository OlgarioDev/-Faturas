"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Plus, Trash2, Save, ArrowLeft, 
  UserPlus, PackagePlus, Calculator 
} from "lucide-react";

export default function CreateDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docType = searchParams.get("type") || "FT";

  // Dados carregados do sistema
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState<any>({});

  // Estado do formulário
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [items, setItems] = useState([{ productId: "", name: "", qty: 1, price: 0, tax: 14 }]);

  useEffect(() => {
    // Carregar tudo do localStorage
    const savedClients = JSON.parse(localStorage.getItem("system_clients") || "[]");
    const savedProducts = JSON.parse(localStorage.getItem("system_products") || "[]");
    const savedConfig = JSON.parse(localStorage.getItem("empresa_config") || "{}");
    
    setClients(savedClients);
    setProducts(savedProducts);
    setConfig(savedConfig);
  }, []);

  // Cálculos
  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const taxTotal = items.reduce((acc, item) => acc + (item.qty * item.price * (item.tax / 100)), 0);
  const total = subtotal + taxTotal;

  const addItem = () => setItems([...items, { productId: "", name: "", qty: 1, price: 0, tax: 14 }]);
  
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "productId") {
      const prod = products.find((p: any) => p.id === value) as any;
      if (prod) {
        newItems[index] = { ...newItems[index], productId: value, name: prod.name, price: Number(prod.price) };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleFinalize = () => {
    if (!selectedClient) return alert("Selecione um cliente!");

    const newInvoice = {
      id: `${docType} 2026/${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: selectedClient.name,
      date: new Date().toLocaleDateString('pt-AO'),
      total: total,
      subtotal: subtotal,
      taxAmount: taxTotal,
      type: docType,
      status: docType === "FR" ? "Paga" : "Emitida",
      items: items
    };

    // Salvar no localStorage (system_invoices)
    const currentInvoices = JSON.parse(localStorage.getItem("system_invoices") || "[]");
    localStorage.setItem("system_invoices", JSON.stringify([...currentInvoices, newInvoice]));

    alert("Documento emitido com sucesso!");
    router.push("/documents");
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800">
            <ArrowLeft size={20}/> Voltar
          </button>
          <h1 className="text-2xl font-black uppercase italic text-slate-900">Novo Documento: {docType}</h1>
          <button onClick={handleFinalize} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <Save size={18}/> Finalizar e Emitir
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SELECÇÃO DE CLIENTE */}
          <section className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
            <h2 className="font-black text-slate-800 uppercase italic flex items-center gap-2">
              <UserPlus size={20} className="text-blue-600"/> Dados do Cliente
            </h2>
            <select 
              onChange={(e) => setSelectedClient(clients.find((c: any) => c.id === e.target.value))}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none"
            >
              <option value="">Escolher Cliente...</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} - NIF: {c.nif}</option>
              ))}
            </select>
          </section>

          {/* RESUMO DE VALORES */}
          <section className="bg-[#0f172a] text-white p-8 rounded-[2.5rem] shadow-xl space-y-4">
            <h2 className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Totais do Documento</h2>
            <div className="space-y-2 border-b border-slate-800 pb-4">
               <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span> <span>{subtotal.toLocaleString()} Kz</span></div>
               <div className="flex justify-between text-sm"><span className="text-slate-500">IVA (14%)</span> <span>{taxTotal.toLocaleString()} Kz</span></div>
            </div>
            <div className="flex justify-between items-end">
               <span className="font-black uppercase text-xs">Total Geral</span>
               <span className="text-3xl font-black text-blue-400">{total.toLocaleString()} Kz</span>
            </div>
          </section>

          {/* TABELA DE ITENS */}
          <section className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h2 className="font-black text-slate-800 uppercase italic flex items-center gap-2">
                 <PackagePlus size={20} className="text-blue-600"/> Itens e Serviços
               </h2>
               <button onClick={addItem} className="text-[10px] font-black bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 uppercase">
                 + Adicionar Linha
               </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="md:col-span-5">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Produto/Serviço</label>
                    <select 
                      value={item.productId}
                      onChange={(e) => updateItem(index, "productId", e.target.value)}
                      className="w-full p-2.5 bg-white border rounded-xl font-bold text-sm outline-none"
                    >
                      <option value="">Selecionar Item...</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} - {Number(p.price).toLocaleString()} Kz</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Qtd</label>
                    <input type="number" value={item.qty} onChange={(e) => updateItem(index, "qty", Number(e.target.value))} className="w-full p-2.5 border rounded-xl font-bold text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Preço Unit.</label>
                    <input type="number" value={item.price} onChange={(e) => updateItem(index, "price", Number(e.target.value))} className="w-full p-2.5 border rounded-xl font-bold text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Total Item</p>
                    <p className="font-black text-slate-900 text-sm">{(item.qty * item.price).toLocaleString()} Kz</p>
                  </div>
                  <div className="md:col-span-1 text-right">
                    <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}