"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: "Jan", total: 1500000 },
    { name: "Fev", total: 2300000 },
    { name: "Mar", total: 3200000 },
    { name: "Abr", total: 2800000 },
    { name: "Mai", total: 4500000 },
    { name: "Jun", total: 3800000 },
    { name: "Jul", total: 5200000 },
];

export function BillingChart() {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Faturação Mensal</h3>
                <p className="text-sm text-muted-foreground">Visão geral dos últimos 7 meses</p>
            </div>
            <div className="p-6 pt-0 pl-0">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip
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
                                stroke="#1e293b" // slate-900
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
