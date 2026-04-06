"use client";

import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export function BillingChart() {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // 1. Buscar faturas reais do localStorage
        const savedInvoices = JSON.parse(localStorage.getItem("system_invoices") || "[]");

        // 2. Definir os nomes dos meses
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        // 3. Processar os dados: Somar o total de faturas para cada mês
        // Criamos um array de 12 posições (0 a 11) preenchido com zeros
        const monthlyTotals = new Array(12).fill(0).map((_, idx) => ({
            name: monthNames[idx],
            total: 0
        }));

        savedInvoices.forEach((inv: any) => {
            if (!inv.date) return;

            let monthIndex = -1;

            // Tenta converter a data (funciona para "2026-04-05" ou "2026/04/05")
            const dateObj = new Date(inv.date);
            
            if (!isNaN(dateObj.getTime())) {
                monthIndex = dateObj.getMonth();
            } else {
                // Caso a data esteja em formato de texto "Abr", tenta por texto
                monthIndex = monthNames.findIndex(m => inv.date.includes(m));
            }

            if (monthIndex !== -1) {
                const valor = Number(inv.total) || 0;
                // Se for Nota de Crédito, subtraímos do gráfico para manter a precisão
                if (inv.type === "NC") {
                    monthlyTotals[monthIndex].total -= valor;
                } else {
                    monthlyTotals[monthIndex].total += valor;
                }
            }
        });

        // 4. Filtramos para mostrar apenas até ao mês atual para o gráfico não ficar vazio à direita
        const currentMonth = new Date().getMonth();
        const displayData = monthlyTotals.slice(0, currentMonth + 1);

        setChartData(displayData);
    }, []);

    return (
        <div className="rounded-[2.5rem] border bg-white text-card-foreground shadow-sm overflow-hidden">
            <div className="p-8 flex flex-col space-y-1.5">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Faturação Mensal</h3>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Dados Sincronizados em Tempo Real</p>
            </div>
            <div className="p-6 pt-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={10}
                                fontWeight="bold"
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={10}
                                fontWeight="bold"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                                    return value;
                                }}
                            />
                            <Tooltip
                                contentStyle={{ 
                                    borderRadius: '20px', 
                                    border: 'none', 
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                                formatter={(value: any) => [
                                    `${Number(value).toLocaleString()} Kz`,
                                    "Total Faturado"
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#2563eb" // Azul Vibrante
                                strokeWidth={4}
                                dot={{ r: 6, fill: "#2563eb", strokeWidth: 3, stroke: "#fff" }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}