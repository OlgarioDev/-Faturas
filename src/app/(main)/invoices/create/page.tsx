"use client";

import { useState, useEffect, Suspense } from "react";
import { Plus, Trash2, Save, Send, History, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ClientSearchSelector from "@/components/ClientSearchSelector";
import ProductSearchSelector from "@/components/ProductSearchSelector";
import { supabase } from "@/lib/supabase"; // GARANTE QUE ESTE CAMINHO ESTÁ CORRETO

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

interface InvoiceItem {
    id: string;
    product_id?: string; // Adicionado para o backend
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

interface Client {
    id: string;
    nome: string;
    nif: string;
    endereco?: string;
}

interface Product {
    id: string;
    descricao: string;
    preco: number;
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const docType = searchParams.get("type")?.toUpperCase() || "FT";
    const refFT = searchParams.get("ref");

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: "1", description: "", quantity: 1, unitPrice: 0, taxRate: 0.14 },
    ]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [originalDocId, setOriginalDocId] = useState<string | null>(null);

    // ... (Teu useEffect de carregamento original mantido para referências)

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxAmount = items.reduce((acc, item) => acc + item.quantity * item.unitPrice * item.taxRate, 0);
    const total = subtotal + taxAmount;

    // --- FUNÇÃO DE SALVAMENTO REAL (SPRINT 2) ---
    const handleSaveInvoice = async (status: "Emitida" | "Rascunho") => {
        if (!selectedClient) return alert("Por favor, selecione um cliente.");
        if (items.some(item => !item.description)) return alert("Todos os itens devem ter uma descrição.");

        setIsSubmitting(true);

        try {
            // 1. Obter Token do Supabase
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                alert("Sessão expirada. Faça login novamente.");
                router.push("/login");
                return;
            }

            // 2. Preparar Payload para o Flask
            const payload = {
                client_id: selectedClient.id, // Certifica-te que o ClientSearchSelector devolve o ID da DB
                document_type: docType,
                related_document_id: originalDocId,
                items: items.map(item => ({
                    product_id: item.product_id || null,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    tax_percentage: item.taxRate * 100, // Converte 0.14 para 14
                    discount: 0 // Podes adicionar campo de desconto no futuro
                })),
                observations: originalDocId ? `Referente a ${originalDocId}` : ""
            };

            // 3. Chamada à API
            const response = await fetch("http://localhost:5000/api/invoices/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Sucesso! Documento ${result.number} gerado.`);
                router.push("/documents"); // Redireciona para a listagem
            } else {
                alert(`Erro do Servidor: ${result.error}`);
            }

        } catch (error) {
            console.error("Erro ao conectar à API:", error);
            alert("Não foi possível conectar ao servidor backend.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... (addItem, removeItem, updateItem e formatCurrency mantidos iguais)
    const addItem = () => setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, unitPrice: 0, taxRate: 0.14 }]);
    const removeItem = (id: string) => items.length > 1 && setItems(items.filter((item) => item.id !== id));
    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map((item) => 
        item.id === id ? { ...item, [field]: value } : item
    ));
};
    const formatCurrency = (value: number) => new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(value);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10 p-6">
            {/* ... (Banner de Origem) */}
            
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={cn("text-3xl font-black tracking-tight", docType === "NC" ? "text-red-600" : "text-slate-900")}>
                        Nova {docType === "NC" ? "Nota de Crédito" : docType === "ND" ? "Nota de Débito" : "Fatura"}
                    </h2>
                </div>
                <div className="flex space-x-3">
                    <button 
                        disabled={isSubmitting}
                        onClick={() => handleSaveInvoice("Emitida")} 
                        className={cn(
                            "inline-flex items-center justify-center rounded-xl text-xs font-black text-white h-11 px-6 shadow-lg transition-all",
                            docType === "NC" ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800",
                            isSubmitting && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2 h-4 w-4" />}
                        Emitir {docType}
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
                    <input type="text" disabled className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none" value={new Date().toLocaleDateString()} />
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
                                                updateItem(item.id, "unitPrice", prod.preco || 0);
                                                updateItem(item.id, "product_id", prod.id);
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
                <button onClick={addItem} className="w-full py-4 bg-slate-50/50 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Adicionar Linha
                </button>
            </div>

            {/* ... (Totais Finais Footer) */}
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

// ... NewInvoicePage Export mantido igual
export default function NewInvoicePage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-black animate-pulse text-slate-400">A preparar formulário fiscal...</div>}>
            <InvoiceFormContent />
        </Suspense>
    );
}