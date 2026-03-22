"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // Importação única e correta
import LoginForm from "../../components/auth/LoginForm"; // Caminho relativo direto para evitar erro de alias

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
            {/* Botão Voltar */}
            <Link 
                href="/" 
                className="absolute top-8 left-8 text-slate-500 hover:text-[#0f172a] flex items-center text-sm font-bold transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar 
            </Link>

            {/* Card de Login */}
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0f172a] text-white rounded-xl mb-4 font-black text-xl italic shadow-lg">
                            +F
                        </div>
                        <h1 className="text-2xl font-black text-[#0f172a] uppercase italic tracking-tight">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Aceda ao seu painel de facturação.
                        </p>
                    </div>

                    {/* Chamada do Componente */}
                    <LoginForm />

                    <div className="mt-10 text-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Ainda não tem conta?{" "}
                            <Link 
                                href="/register" 
                                className="text-blue-600 hover:text-blue-700 transition-colors underline decoration-2 underline-offset-4"
                            >
                                Criar Conta Grátis
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-40">
                Software Certificado AGT • +Facturas v1.0
            </p>
        </div>
    );
}