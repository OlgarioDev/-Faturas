"use client";

import { useState, useEffect, Suspense } from "react";
import { Plus, Trash2, Save, Send, History, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ClientSearchSelector from "@/components/ClientSearchSelector";
import ProductSearchSelector from "@/components/ProductSearchSelector";

// Função utilitária cn (Caso não esteja no seu projeto)
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

const TAX_RATES = [
    { label: "Isento (0%)", value: 0 },
    { label: "Reduzida (5%)", value: 0.05 },
    { label: "Intermédia (7%)", value: 0.07 },
    { label: "Geral (14%)", value: 0.14 },
];

function InvoiceFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const docType = searchParams.get("type")?.toUpperCase() || "FT";
    const refFT = searchParams.get("ref");

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: "1", description: "", quantity: 1, unitPrice: 0, taxRate: 0.14 },
    ]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [originalDocId, setOriginalDocId] = useState<string | null>(null);

    useEffect(() => {
        if (refFT) {
            const saved = localStorage.getItem("facturas_recentes");
            if (saved) {
                try {
                    const allDocs = JSON.parse(saved);
                    const original = allDocs.find((d: any) => d.id === refFT);
                    
                    if (original) {
                        setOriginalDocId(original.id);
                        setSelectedClient({ nome: original.clientName, nif: original.clientNif || "999999999" });
                        
                        if (original.items && original.items.length > 0) {
                            setItems(original.items);
                        } else {
                            setItems([{ 
                                id: Date.now().toString(), 
                                description: `Estorno total ref. ${original.id}`, 
                                quantity: 1, 
                                unitPrice: Number(original.total) / 1.14 || 0, 
                                taxRate: 0.14 
                            }]);
                        }
                    }
                } catch (e) {
                    console.error("Erro ao carregar documento original", e);
                }
            }
        }
    }, [refFT]);

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxAmount = items.reduce((acc, item) => acc + item.quantity * item.unitPrice * item.taxRate, 0);
    const total = subtotal + taxAmount;

    const handleSaveInvoice = (status: "Emitida" | "Rascunho") => {
        if (!selectedClient && status === "Emitida") {
            return alert("Por favor, selecione um cliente.");
        }

        const invoiceData = {
            id: `${docType} ${Date.now()}`,
            type: docType,
            clientName: selectedClient?.nome || "Consumidor Final",
            clientNif: selectedClient?.nif || "999999999",
            date: new Date().toLocaleDateString(),
            items: items,
            total: total,
            status: status,
            reference: originalDocId 
        };

        const existing = JSON.parse(localStorage.getItem("facturas_recentes") || "[]");
        localStorage.setItem("facturas_recentes", JSON.stringify([invoiceData, ...existing]));

        alert(`${docType} processada com sucesso!`);
        router.push("/documents");
    };

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, unitPrice: 0, taxRate: 0.14 }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) setItems(items.filter((item) => item.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map((item) => item.id === id ? { ...item, [field]: value } : item));
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(value);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10 p-6">
            
            {originalDocId && (
                <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-xl text-white">
                            <History size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-blue-700 tracking-widest">Documento de Origem Vinculado</p>
                            <h3 className="text-lg font-black text-slate-900">{originalDocId}</h3>
                        </div>
                    </div>
                    <CheckCircle2 className="text-blue-600" size={24} />
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className={cn(
                        "text-3xl font-black tracking-tight",
                        docType === "NC" ? "text-red-600" : "text-slate-900"
                    )}>
                        Nova {docType === "NC" ? "Nota de Crédito" : docType === "ND" ? "Nota de Débito" : "Fatura"}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {originalDocId ? `Retificando o documento ${originalDocId}` : "Preencha os dados do novo documento."}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => handleSaveInvoice("Rascunho")} className="inline-flex items-center justify-center rounded-xl text-xs font-black border border-slate-200 bg-white hover:bg-slate-50 h-11 px-6 transition-all shadow-sm">
                        <Save className="mr-2 h-4 w-4" /> Salvar Rascunho
                    </button>
                    <button onClick={() => handleSaveInvoice("Emitida")} className={cn(
                        "inline-flex items-center justify-center rounded-xl text-xs font-black text-white h-11 px-6 shadow-lg transition-all",
                        docType === "NC" ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
                    )}>
                        <Send className="mr-2 h-4 w-4" /> Emitir {docType}
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className={cn("space-y-2", originalDocId !== null && "pointer-events-none opacity-60")}>
                    <ClientSearchSelector 
                        onClientSelect={(client) => setSelectedClient(client)} 
                        defaultValue={selectedClient?.nome}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Data de Emissão</label>
                    <input type="date" className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
            </div>

            <div className="rounded-[2rem] border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50/50 border-b">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-6 py-4 text-left">Descrição</th>
                            <th className="px-4 py-4 text-center">Qtd</th>
                            <th className="px-4 py-4 text-left">Preço Unit.</th>
                            <th className="px-4 py-4 text-left">IVA</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-4 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="p-4">
                                    <ProductSearchSelector 
                                        value={item.description} 
                                        onProductSelect={(prod) => {
                                            if (prod) {
                                                updateItem(item.id, "description", prod.descricao);
                                                if (prod.preco) updateItem(item.id, "unitPrice", prod.preco);
                                            }
                                        }} 
                                    />
                                </td>
                                <td className="p-4"><input type="number" className="w-full text-center font-bold bg-transparent outline-none" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)} /></td>
                                <td className="p-4"><input type="number" className="w-full font-bold bg-transparent outline-none" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)} /></td>
                                <td className="p-4">
                                    <select className="bg-transparent font-bold outline-none cursor-pointer" value={item.taxRate} onChange={(e) => updateItem(item.id, "taxRate", parseFloat(e.target.value))}>
                                        {TAX_RATES.map((rate) => <option key={rate.label} value={rate.value}>{rate.label}</option>)}
                                    </select>
                                </td>
                                <td className={cn("p-4 text-right font-black", docType === "NC" ? "text-red-600" : "text-slate-900")}>
                                    {docType === "NC" ? "-" : ""}{formatCurrency(item.quantity * item.unitPrice * (1 + item.taxRate))}
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors" disabled={items.length === 1}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <div className={cn("w-full md:w-80 p-8 rounded-[2.5rem] space-y-3 shadow-xl", docType === "NC" ? "bg-red-600 text-white" : "bg-slate-900 text-white")}>
                    <div className="flex justify-between text-[10px] font-black uppercase opacity-60"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between text-[10px] font-black uppercase opacity-60"><span>IVA:</span><span>{formatCurrency(taxAmount)}</span></div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-tighter">Total {docType}:</span>
                        <span className="text-2xl font-black">{docType === "NC" ? "-" : ""}{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-black animate-pulse text-slate-400">A preparar formulário fiscal...</div>}>
            <InvoiceFormContent />
        </Suspense>
    );
}