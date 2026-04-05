"use client";

import React, { useState, useEffect } from "react";
import { BadgeCheck, Clock, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecentInvoices() {
    const [realInvoices, setRealInvoices] = useState<any[]>([]);

    useEffect(() => {
        // 1. Procurar as faturas reais guardadas no sistema
        const savedInvoices = JSON.parse(localStorage.getItem("system_invoices") || "[]");
        
        // 2. Inverter para mostrar as mais recentes primeiro e limitar às últimas 5
        const lastFive = [...savedInvoices].reverse().slice(0, 5);
        
        setRealInvoices(lastFive);
    }, []);

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow h-full">
            <div className="p-6 flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Faturas Recentes</h3>
                <p className="text-sm text-muted-foreground">Últimas transações emitidas</p>
            </div>
            <div className="p-0">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fatura</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Valor</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {realInvoices.length > 0 ? (
                                realInvoices.map((invoice) => (
                                    <tr key={invoice.id || invoice.number} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">
                                            <div className="flex items-center">
                                                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {invoice.number || `FT 2024/${invoice.id}`}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{invoice.clientName || invoice.client}</td>
                                        <td className="p-4 align-middle font-bold">
                                            {new Intl.NumberFormat("pt-AO", {
                                                style: "currency",
                                                currency: "AOA",
                                            }).format(invoice.total || invoice.amount)}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div
                                                className={cn(
                                                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter transition-colors",
                                                    (invoice.status === "Pago" || invoice.status === "pago") &&
                                                    "border-transparent bg-green-100 text-green-700",
                                                    (invoice.status === "Pendente" || invoice.status === "pendente") &&
                                                    "border-transparent bg-yellow-100 text-yellow-700",
                                                    (invoice.status === "Anulado" || invoice.status === "anulado") &&
                                                    "border-transparent bg-red-100 text-red-700"
                                                )}
                                            >
                                                {invoice.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                                        Nenhuma fatura emitida até ao momento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}