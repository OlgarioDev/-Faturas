"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Users, Package, FileText, 
    Settings, PieChart, LogOut, UserCircle
} from "lucide-react";
import { WelcomeToast } from "@/components/ui/WelcomeToast";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Produtos/Serviços", href: "/products", icon: Package },
    { name: "Documentos", href: "/documents", icon: FileText },
    { name: "Relatórios", href: "/reports", icon: PieChart },
    { name: "Configurações", href: "/settings", icon: Settings },
    { name: "Conta", href: "/account", icon: UserCircle },
];

// --- COMPONENTE DA SIDEBAR ---
export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [userData, setUserData] = useState({
        name: "Utilizador",
        role: "Administrador"
    });

    useEffect(() => {
        const session = localStorage.getItem("user_session");
        const savedUsers = localStorage.getItem("system_users");

        if (session) {
            try {
                const parsed = JSON.parse(session);
                const displayName = parsed.name || parsed.companyName || parsed.email?.split('@')[0] || "Utilizador";
                setUserData({
                    name: displayName,
                    role: parsed.role || "Administrador"
                });
            } catch (e) {
                console.error("Erro ao ler sessão");
            }
        } else if (savedUsers) {
            try {
                const usersList = JSON.parse(savedUsers);
                if (usersList.length > 0) {
                    setUserData({
                        name: usersList[0].name,
                        role: usersList[0].role
                    });
                }
            } catch (e) {}
        }
    }, []);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        document.cookie = "user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        localStorage.removeItem("user_session");
        router.push("/login");
    };

    return (
        <div className="flex h-full w-64 flex-col border-r bg-slate-900 text-white shadow-xl">
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
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                        </Link>
                    );
                })}

                <button
                    onClick={handleLogout}
                    className="w-full group flex items-center rounded-lg px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-4 outline-none"
                >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                    Sair
                </button>
            </nav>

            <div className="border-t border-slate-800 p-4 bg-slate-900/50 shrink-0">
                <Link href="/account" className="flex items-center group p-2 rounded-xl hover:bg-slate-800 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black ring-2 ring-slate-800 uppercase text-white shadow-lg">
                        {userData.name.substring(0, 2)}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate capitalize">
                            {userData.name}
                        </p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {userData.role}
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

// --- LAYOUT PRINCIPAL DO DASHBOARD ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar fixa à esquerda */}
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto relative">
                {/* Notificação de boas-vindas */}
                <WelcomeToast />
                
                {/* Conteúdo das páginas com padding para respirar */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}