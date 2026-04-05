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

        // 2. Definir os últimos 7 meses (podes ajustar para ser dinâmico)
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];

        // 3. Processar os dados: Somar o total de faturas para cada mês
        const processedData = months.map(month => {
            const totalMonth = savedInvoices
                .filter((inv: any) => {
                    // Assume que inv.date é uma string como "22 Mar 2026"
                    return inv.date && inv.date.includes(month);
                })
                .reduce((sum: number, inv: any) => sum + (Number(inv.total) || 0), 0);

            return {
                name: month,
                total: totalMonth
            };
        });

        // 4. Se não houver faturas, mantemos valores base para o gráfico não ficar vazio (opcional)
        const hasData = processedData.some(d => d.total > 0);
        if (!hasData) {
            setChartData([
                { name: "Jan", total: 0 },
                { name: "Fev", total: 0 },
                { name: "Mar", total: 0 },
                { name: "Abr", total: 0 },
                { name: "Mai", total: 0 },
                { name: "Jun", total: 0 },
                { name: "Jul", total: 0 },
            ]);
        } else {
            setChartData(processedData);
        }
    }, []);

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Faturação Mensal</h3>
                <p className="text-sm text-muted-foreground">Visão geral baseada em documentos emitidos</p>
            </div>
            <div className="p-6 pt-0 pl-0">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                                    return value;
                                }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                formatter={(value: any) =>
                                    new Intl.NumberFormat("pt-AO", {
                                        style: "currency",
                                        currency: "AOA",
                                    }).format(Number(value))
                                }
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#0f172a" // slate-900 para combinar com a sidebar
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#0f172a", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}