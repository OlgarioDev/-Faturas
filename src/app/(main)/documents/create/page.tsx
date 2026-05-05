"use client";

import { apiFetch } from "@/lib/api"; 
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { 
  Plus, Trash2, ArrowLeft, 
  User, ShieldCheck, Calculator, CheckCircle,
  MapPin
} from "lucide-react";

// --- INTERFACES ---
interface Client {
  id: string;
  name: string;
  nome?: string;
  nif: string;
  email: string;
  endereco?: string; // Morada do cliente
}

interface Product {
  id: string;
  name: string;
  descricao?: string;
  unit_price: number;
  price?: number;
}

interface InvoiceItem {
  id: number;
  productId: string;
  name: string;
  qty: number;
  price: number;
  discount: number;
}

function CreateInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docType = searchParams.get("type") || "FT";

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [taxRegime, setTaxRegime] = useState<string>("geral"); 
  const [exemptionReason, setExemptionReason] = useState<string>("");
  const [observations, setObservations] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [docData, setDocData] = useState({
    date: new Date().toISOString().split('T')[0],
    vencimento: "Pronto Pagamento",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: Date.now(), productId: "", name: "", qty: 1, price: 0, discount: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, productsData] = await Promise.all([
          apiFetch('/api/clients/'),
          apiFetch('/api/products/')
        ]);
        setClients(clientsData);
        setProducts(productsData);
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      }
    };
    fetchData();
  }, []);

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

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    if (field === "productId") {
      const prod = products.find(p => p.name === value || p.descricao === value);
      if (prod) {
        newItems[index] = { 
          ...newItems[index], 
          productId: prod.id, 
          name: prod.name || prod.descricao || "", 
          price: Number(prod.unit_price || prod.price || 0) 
        };
      } else {
        newItems[index].name = String(value);
      }
    } else {
      // @ts-expect-error - TS dynamic fields
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handlePreFinalize = () => {
    if (!selectedClient) return alert("Selecione um cliente válido.");
    if (items.some(it => !it.name || it.price <= 0)) return alert("Verifique os itens.");
    if (taxRegime === "isento" && !exemptionReason) return alert("Motivo de isenção obrigatório.");
    setIsConfirmOpen(true);
  };

  const handleFinalize = async () => {
    if (!selectedClient) return;
    setIsLoading(true);
    
    const emissaoObj = new Date(docData.date);
    let diasSomar = 0;
    if (docData.vencimento.includes("dias")) diasSomar = parseInt(docData.vencimento);
    
    const vencimentoObj = new Date(emissaoObj);
    vencimentoObj.setDate(emissaoObj.getDate() + diasSomar);

    try {
      const payload = {
        client_id: selectedClient.id,
        document_type: docType === "FR" ? "Factura Recibo" : "Factura",
        due_date: vencimentoObj.toISOString(),
        observations: observations,
        items: items.map(item => ({
          product_id: item.productId || null,
          description: item.name,
          quantity: item.qty,
          unit_price: item.price,
          tax_percentage: taxRegime === "geral" ? 14 : 0
        }))
      };

      await apiFetch('/api/invoices/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setIsConfirmOpen(false);
      alert("✓ Documento emitido com sucesso!");
      router.push("/documents");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Erro na emissão: " + msg);
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1">Software Validado</p>
          </div>
          <div className="w-20" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUNA FORMULÁRIO */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* CLIENTE */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2 tracking-widest">
                <User size={14} className="text-blue-600"/> Selecionar Cliente
              </h2>
              <input 
                list="list-clients"
                placeholder="Pesquisar cliente..."
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border border-slate-100"
                onChange={(e) => {
                  const val = e.target.value;
                  const c = clients.find(cl => cl.name === val || cl.nome === val);
                  if (c) setSelectedClient(c);
                }}
              />
              <datalist id="list-clients">
                {clients.map((c) => (
                  <option key={c.id} value={c.name || c.nome}>{c.nif} - {c.email}</option>
                ))}
              </datalist>

              {/* EXIBIÇÃO DA MORADA DO CLIENTE SELECIONADO */}
              {selectedClient && (
                <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                  <MapPin size={16} className="text-blue-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Morada de Faturação (AGT)</p>
                    <p className="text-xs font-bold text-blue-700 italic">{selectedClient.endereco || "Sem morada registada"}</p>
                  </div>
                </div>
              )}
            </section>

            {/* IVA */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2 tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500"/> Imposto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border" onChange={(e) => setTaxRegime(e.target.value)} value={taxRegime}>
                  <option value="geral">Regime Geral (14%)</option>
                  <option value="isento">Isento (0%)</option>
                </select>
                {taxRegime === "isento" && (
                  <select className="p-4 bg-red-50 text-red-700 rounded-2xl font-bold text-xs outline-none border border-red-100" onChange={(e) => setExemptionReason(e.target.value)}>
                    <option value="">Selecione o Motivo...</option>
                    <option value="M02">Isenção Artigo 12.º</option>
                    <option value="M04">Exclusão Artigo 16.º</option>
                  </select>
                )}
              </div>
            </section>

            {/* ITENS */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8 font-black uppercase text-slate-400 text-[10px] tracking-widest">
                <span>Itens</span>
                <button onClick={() => setItems([...items, { id: Date.now(), productId: "", name: "", qty: 1, price: 0, discount: 0 }])} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors"><Plus size={18}/></button>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 grid grid-cols-12 gap-4 items-end relative group">
                    <div className="col-span-12 md:col-span-5">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Produto/Serviço</label>
                      <input 
                        list={`prod-list-${index}`} 
                        placeholder="Pesquisar..." 
                        className="w-full p-3 bg-white rounded-xl font-bold text-xs outline-none border" 
                        onChange={(e) => updateItem(index, "productId", e.target.value)} 
                      />
                      <datalist id={`prod-list-${index}`}>
                        {products.map((p) => (
                          <option key={p.id} value={p.name || p.descricao} />
                        ))}
                      </datalist>
                    </div>
                    <div className="col-span-4 md:col-span-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Preço Unit.</label>
                      <input type="number" value={item.price} onChange={(e) => updateItem(index, "price", Number(e.target.value))} className="w-full p-3 rounded-xl text-xs font-bold text-right outline-none bg-white border" />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Qtd.</label>
                      <input type="number" value={item.qty} onChange={(e) => updateItem(index, "qty", Number(e.target.value))} className="w-full p-3 rounded-xl text-xs font-bold text-center outline-none bg-white border" />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                        <label className="text-[9px] font-black uppercase text-blue-500 ml-1 mb-1 block">Desc %</label>
                        <input type="number" value={item.discount} onChange={(e) => updateItem(index, "discount", Number(e.target.value))} className="w-full p-3 rounded-xl text-xs font-bold text-center outline-none bg-blue-50 text-blue-600 border border-blue-100" />
                    </div>
                    <button onClick={() => setItems(items.filter(it => it.id !== item.id))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </section>

            {/* DATAS */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Data de Emissão</label>
                  <input 
                    type="date" 
                    value={docData.date} 
                    onChange={(e) => setDocData({...docData, date: e.target.value})} 
                    className="w-full p-3 bg-slate-50 rounded-xl text-xs border outline-none font-bold" 
                  />
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Condições de Pagamento</label>
                   <select 
                     className="w-full p-3 bg-slate-50 rounded-xl text-xs border font-bold" 
                     value={docData.vencimento} 
                     onChange={(e) => setDocData({...docData, vencimento: e.target.value})}
                   >
                     <option value="Pronto Pagamento">Pronto Pagamento (Mesmo dia)</option>
                     <option value="15 dias">15 dias</option>
                     <option value="30 dias">30 dias</option>
                     <option value="45 dias">45 dias</option>
                     <option value="60 dias">60 dias</option>
                     <option value="90 dias">90 dias</option>
                   </select>
                </div>
                <div className="md:col-span-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Observações</label>
                   <textarea 
                     className="w-full p-3 bg-slate-50 rounded-xl text-xs outline-none border h-20 font-medium" 
                     value={observations} 
                     onChange={(e) => setObservations(e.target.value)} 
                   />
                </div>
            </section>
          </div>

          {/* COLUNA RESUMO (LADO DIREITO) */}
          <div className="lg:col-span-4">
            <div className="sticky top-10 space-y-6">
              <section className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-blue-600">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2"><Calculator size={14}/> Totais</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold opacity-50"><span>Subtotal</span><span>{totals.subtotal.toLocaleString()} Kz</span></div>
                  <div className="flex justify-between text-sm font-bold text-red-400"><span>Descontos</span><span>-{totals.descontosVal.toLocaleString()} Kz</span></div>
                  <div className="flex justify-between text-sm font-bold text-blue-400"><span>IVA</span><span>+{totals.iva.toLocaleString()} Kz</span></div>
                  <div className="pt-6 border-t border-slate-800 mt-6 font-black">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Total</p>
                    <p className="text-4xl tracking-tighter">{totals.total.toLocaleString()} <span className="text-xs font-normal opacity-50 uppercase">Kz</span></p>
                  </div>
                </div>
              </section>
              <button onClick={handlePreFinalize} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 uppercase text-xs tracking-widest transition-all">
                <CheckCircle size={20}/> Emitir Documento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CONFIRMAÇÃO */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic">Confirmar?</h3>
              <p className="text-slate-500 mt-4 font-medium text-sm">
                Documento para <span className="font-bold text-slate-900">{selectedClient?.name || selectedClient?.nome}</span> será emitido.
              </p>
            </div>
            <div className="p-8 bg-slate-50 flex gap-3">
              <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">Voltar</button>
              <button onClick={handleFinalize} disabled={isLoading} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700">
                {isLoading ? "Emitindo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-20 text-center uppercase font-black text-slate-300">Carregando...</div>}>
      <CreateInvoiceForm />
    </Suspense>
  );
}