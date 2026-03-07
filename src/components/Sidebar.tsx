"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Users, Package, FileText, 
    Settings, PieChart, LogOut, UserCircle
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Produtos/Serviços", href: "/products", icon: Package },
    { name: "Documentos", href: "/documents", icon: FileText },
    { name: "Relatórios", href: "/reports", icon: PieChart },
    { name: "Configurações", href: "/settings", icon: Settings },
    { name: "Conta", href: "/account", icon: UserCircle },
    { name: "Sair", href: "/", icon: LogOut, color: "text-red-400 font-bold" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-slate-900 text-white shadow-xl">
            {/* LOGOTIPO CORRIGIDO: pl-10 move para a direita sem cortar o texto */}
            <div className="flex h-16 items-center pl-10 shrink-0 border-b border-slate-800/50">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-[#0f172a] font-bold shrink-0 shadow-lg">
                        +
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
                        +Facturas
                    </span>
                </Link>
            </div>

            {/* NAVEGAÇÃO */}
            <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                                item.color && !isActive ? item.color : ""
                            )}
                        >
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* PERFIL DO ADMIN: Paulo Freitas */}
            <div className="border-t border-slate-800 p-4 bg-slate-900/50 shrink-0">
                <Link href="/account" className="flex items-center group p-2 rounded-xl hover:bg-slate-800 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
                        PF
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">Paulo Freitas</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Administrador
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}