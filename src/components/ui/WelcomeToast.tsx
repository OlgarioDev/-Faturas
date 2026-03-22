"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export function WelcomeToast() {
    const [show, setShow] = useState(false);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        // Verifica se já mostramos a saudação nesta sessão do navegador
        const hasWelcomed = sessionStorage.getItem("welcome_shown");
        const session = localStorage.getItem("user_session");

        if (!hasWelcomed && session) {
            const parsed = JSON.parse(session);
            setUserName(parsed.name || parsed.companyName || "Utilizador");
            
            // Pequeno delay para a página carregar primeiro
            const timer = setTimeout(() => {
                setShow(true);
                sessionStorage.setItem("welcome_shown", "true");
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, []);

    if (!show) return null;

    return (
        <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-right-full duration-500">
            <div className="bg-[#0f172a] text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 min-w-[300px]">
                <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 shrink-0">
                    <CheckCircle2 size={24} />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Autenticação Concluída</p>
                    <p className="text-sm font-bold">Bem-vindo, {userName}!</p>
                </div>
                <button 
                    onClick={() => setShow(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-500"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}