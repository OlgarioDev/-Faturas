"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Plus, Trash2, Save, ArrowLeft, 
  User, Package, Calculator, ShieldCheck, Calendar, Info, CheckCircle
} from "lucide-react";

function CreateInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docType = searchParams.get("type") || "FT";

  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [taxRegime, setTaxRegime] = useState("geral"); 
  const [exemptionReason, setExemptionReason] = useState("");
  const [observations, setObservations] = useState("");
  const [docData, setDocData] = useState({
    date: new Date().toISOString().split('T')[0],
    vencimento: "45 dias",
  });

  const [items, setItems] = useState<any[]>([
    { id: Date.now(), productId: "", name: "", qty: 1, price: 0, discount: 0 }
  ]);

  // 1. CARREGAMENTO DE DADOS (Scanner Reforçado para Listar Tudo)
  useEffect(() => {
    const allKeys = Object.keys(localStorage);
    let cFound: any[] = [];
    let pFound: any[] = [];

    allKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(data) && data.length > 0) {
          // Detecta Clientes
          if (data[0].nif || key.toLowerCase().includes("client")) cFound = data;
          // Detecta Produtos/Serviços
          if (data[0].price || data[0].preco || data[0].priceUnitario || data[0].description || data[0].name) {
            pFound = data;
          }
        }
      } catch (e) {}
    });
    setClients(cFound);
    setProducts(pFound);
  }, []);

  // 2. CÁLCULOS TOTAIS
  const calculateTotals = () => {
    let subtotal = 0;
    let descontosVal = 0;
    const taxaIva = taxRegime === "geral" ? 0.14 : 0;
    items.forEach(item => {
      const bruto = item.qty * item.price;
      const desc = bruto * (item.discount / 100);
      subtotal += bruto;
      descontosVal += desc;
    });
    const base = subtotal - descontosVal;
    const iva = base * taxaIva;
    return { subtotal, descontosVal, iva, total: base + iva };
  };

  const totals = calculateTotals();

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "productId") {
      const prod = products.find(p => (p.name || p.nome || p.description || p.descricao) === value);
      if (prod) {
        newItems[index] = { 
          ...newItems[index], 
          productId: prod.id || value, 
          name: prod.name || prod.nome || prod.description || prod.descricao, 
          price: Number(prod.price || prod.preco || 0) 
        };
      } else {
        newItems[index].name = value;
      }
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handleFinalize = () => {
    if (!selectedClient) return alert("Selecione um cliente.");
    
    const newInvoice = {
      id: `${docType} 2026/${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: selectedClient.name || selectedClient.nome,
      date: docData.date,
      vencimento: docData.vencimento,
      total: totals.total,
      taxAmount: totals.iva,
      discountAmount: totals.descontosVal,
      type: docType,
      status: docType === "FR" ? "Paga" : "Emitida",
      items: items, // Importante para a visualização
      observations
    };

    const existing = JSON.parse(localStorage.getItem("system_invoices") || "[]");
    localStorage.setItem("system_invoices", JSON.stringify([newInvoice, ...existing]));
    
    alert("✓ Documento Emitido!");
    router.push("/documents");
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans text-slate-700 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
          <button onClick={() => router.back()} className="font-black text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-blue-600 transition-all">
            <ArrowLeft size={16}/> Voltar
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-black uppercase italic text-[#0f172a]">Nova {docType}</h1>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1">Software Validado AGT</p>
          </div>
          <div className="w-20" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* CLIENTE */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2 tracking-widest">
                <User size={14} className="text-blue-600"/> Dados do Cliente
              </h2>
              <input 
                list="list-c"
                placeholder="Procurar contacto (Nome ou NIF)..."
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border border-slate-100"
                onChange={(e) => {
                  const c = clients.find(cl => (cl.name || cl.nome) === e.target.value);
                  if (c) setSelectedClient(c);
                }}
              />
              <datalist id="list-c">
                {clients.map((c, i) => <option key={i} value={c.name || c.nome}>{c.nif}</option>)}
              </datalist>
            </section>

            {/* IVA */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2 tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500"/> Configuração de Imposto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border" onChange={(e) => setTaxRegime(e.target.value)} value={taxRegime}>
                  <option value="geral">Regime Geral (IVA 14%)</option>
                  <option value="isento">Regime de Exclusão (IVA 0%)</option>
                </select>
                {taxRegime === "isento" && (
                  <select className="p-4 bg-red-50 text-red-700 rounded-2xl font-bold text-xs outline-none border border-red-100" onChange={(e) => setExemptionReason(e.target.value)}>
                    <option value="">Motivo de Isenção obrigatório...</option>
                    <option value="M02">Isenção Artigo 12.º</option>
                    <option value="M04">Exclusão Artigo 16.º</option>
                  </select>
                )}
              </div>
            </section>

            {/* ITENS */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Package size={14} className="text-blue-600"/> Itens e Serviços</h2>
                <button onClick={() => setItems([...items, { id: Date.now(), productId: "", name: "", qty: 1, price: 0, discount: 0 }])} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform"><Plus size={18}/></button>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 relative group">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-12 md:col-span-5">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block italic tracking-widest">Descrição</label>
                        <input list={`p-list-${index}`} placeholder="Pesquisar catálogo..." className="w-full p-3 bg-white rounded-xl font-bold text-xs outline-none border" onChange={(e) => updateItem(index, "productId", e.target.value)} />
                        <datalist id={`p-list-${index}`}>
                          {products.map((p, i) => <option key={i} value={p.name || p.nome || p.description} />)}
                        </datalist>
                      </div>
                      <div className="col-span-4 md:col-span-3">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block">Preço Unit.</label>
                        <input type="number" value={item.price} onChange={(e) => updateItem(index, "price", Number(e.target.value))} className="w-full p-3 rounded-xl text-xs font-bold text-right outline-none bg-white border" />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block">Qtd.</label>
                        <input type="number" value={item.qty} onChange={(e) => updateItem(index, "qty", Number(e.target.value))} className="w-full p-3 rounded-xl text-xs font-bold text-center outline-none bg-white border" />
                      </div>
                      <div className="col-span-3 md:col-span-2">
                        <label className="text-[8px] font-black uppercase text-blue-500 ml-1 mb-1 block italic">Desc %</label>
                        <input type="number" value={item.discount} onChange={(e) => updateItem(index, "discount", Number(e.target.value))} className="w-full p-3 rounded-xl text-xs font-bold text-center outline-none bg-blue-50 text-blue-600 border border-blue-100" />
                      </div>
                      <button onClick={() => setItems(items.filter(it => it.id !== item.id))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* DATA E VENCIMENTO */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest italic">Data de Emissão</label>
                  <input type="date" value={docData.date} onChange={(e) => setDocData({...docData, date: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs border outline-none" />
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest italic">Vencimento</label>
                   <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs border" value={docData.vencimento} onChange={(e) => setDocData({...docData, vencimento: e.target.value})}>
                     <option value="Pronto Pagamento">Pronto Pagamento</option>
                     <option value="15 dias">15 dias</option>
                     <option value="30 dias">30 dias</option>
                     <option value="45 dias">45 dias</option>
                     <option value="90 dias">90 dias</option>
                   </select>
                </div>
                <div className="md:col-span-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest italic">Observações</label>
                   <textarea className="w-full p-3 bg-slate-50 rounded-xl text-xs outline-none border h-20" placeholder="IBAN..." value={observations} onChange={(e) => setObservations(e.target.value)} />
                </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-10 space-y-6">
              <section className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border-b-8 border-blue-600">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2"><Calculator size={14}/> Resumo</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between text-sm font-bold opacity-50"><span>Subtotal</span><span>{totals.subtotal.toLocaleString()} Kz</span></div>
                  <div className="flex justify-between text-sm font-bold text-red-400"><span>Descontos</span><span>-{totals.descontosVal.toLocaleString()} Kz</span></div>
                  <div className="flex justify-between text-sm font-bold text-blue-400"><span>IVA ({taxRegime === 'geral' ? '14%' : '0%'})</span><span>+{totals.iva.toLocaleString()} Kz</span></div>
                  <div className="pt-6 border-t border-slate-800 mt-6 font-black italic">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Total a Pagar</p>
                    <p className="text-4xl tracking-tighter italic">{totals.total.toLocaleString()} Kz</p>
                  </div>
                </div>
              </section>
              <button onClick={handleFinalize} className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-black py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 border-2 border-slate-700 uppercase text-xs tracking-widest"><CheckCircle size={20}/> Emitir Factura</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreateInvoiceForm />
    </Suspense>
  );
}