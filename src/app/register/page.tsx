"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { validateNIF, validateEmail, validatePassword } from "@/lib/auth-validation";

export default function RegisterPage() {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        // Validações Lógicas
        let newErrors: Record<string, string> = {};

        if (!data.companyName) newErrors.companyName = "Nome da empresa é obrigatório.";
        if (!validateNIF(data.nif as string)) newErrors.nif = "NIF inválido (use 9 ou 10 dígitos).";
        if (!validateEmail(data.email as string)) newErrors.email = "E-mail profissional inválido.";
        if (!validatePassword(data.password as string)) newErrors.password = "Mínimo 8 caracteres, com letras e números.";
        if (data.password !== data.confirmPassword) newErrors.confirm = "As passwords não coincidem.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        // Simulação de registo e persistência inicial
        setTimeout(() => {
            const newUser = {
                name: data.companyName,
                email: data.email,
                nif: data.nif,
                role: "Administrador",
                plan: "Standard"
            };
            localStorage.setItem("user_session", JSON.stringify(newUser));
            window.location.href = "/dashboard";
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            {/* Botão Voltar */}
            <Link href="/" className="absolute top-8 left-8 text-slate-500 hover:text-[#0f172a] flex items-center text-sm font-bold transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Link>

            <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
                
                {/* SIDEBAR INFO (ESQUERDA) */}
                <div className="hidden md:flex md:w-5/12 bg-[#0f172a] p-10 flex-col text-white justify-between relative">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl mb-6 flex items-center justify-center font-black text-2xl italic">
                            +F
                        </div>
                        <h3 className="text-2xl font-black mb-6 uppercase italic tracking-tighter">Prepare-se para crescer</h3>
                        <ul className="space-y-5">
                            <li className="flex items-start text-sm font-medium text-slate-300">
                                <CheckCircle2 className="mr-3 h-5 w-5 text-green-400 flex-shrink-0" />
                                1º Mês Totalmente Grátis (Experimental)
                            </li>
                            <li className="flex items-start text-sm font-medium text-slate-300">
                                <CheckCircle2 className="mr-3 h-5 w-5 text-green-400 flex-shrink-0" />
                                Emita faturas em menos de 1 minuto
                            </li>
                            <li className="flex items-start text-sm font-medium text-slate-300">
                                <CheckCircle2 className="mr-3 h-5 w-5 text-green-400 flex-shrink-0" />
                                Software Certificado pela AGT n.º 280
                            </li>
                        </ul>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-[11px] leading-relaxed text-slate-400 italic relative z-10">
                        "O +Facturas ajuda centenas de empresas angolanas a manterem a conformidade fiscal com simplicidade e rapidez."
                    </div>

                    {/* Decoração de fundo */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full -mr-16 -mb-16"></div>
                </div>

                {/* FORMULÁRIO (DIREITA) */}
                <div className="w-full md:w-7/12 p-10 md:p-14">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-[#0f172a] uppercase italic tracking-tight">Crie a sua Conta</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Preencha os dados da sua empresa abaixo.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
                            <input 
                                name="companyName"
                                className={`flex h-12 w-full rounded-xl border ${errors.companyName ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50'} bg-white px-4 py-2 text-sm font-bold transition-all outline-none`} 
                                placeholder="Ex: TecnoAngola Lda" 
                            />
                            {errors.companyName && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.companyName}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIF</label>
                                <input 
                                    name="nif"
                                    className={`flex h-12 w-full rounded-xl border ${errors.nif ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50'} bg-white px-4 py-2 text-sm font-bold transition-all outline-none`} 
                                    placeholder="0000000000" 
                                />
                                {errors.nif && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.nif}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telemóvel</label>
                                <div className="flex">
                                    <span className="flex items-center justify-center h-12 px-3 border border-r-0 rounded-l-xl bg-slate-50 text-slate-500 text-xs font-bold border-slate-200">
                                        +244
                                    </span>
                                    <input 
                                        name="phone"
                                        className="flex h-12 w-full rounded-r-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none" 
                                        placeholder="923 000 000" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</label>
                            <input 
                                name="email"
                                type="email"
                                className={`flex h-12 w-full rounded-xl border ${errors.email ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50'} bg-white px-4 py-2 text-sm font-bold transition-all outline-none`} 
                                placeholder="geral@empresa.ao" 
                            />
                            {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <input 
                                    name="password"
                                    type="password" 
                                    className={`flex h-12 w-full rounded-xl border ${errors.password ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50'} bg-white px-4 py-2 text-sm font-bold transition-all outline-none`} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar</label>
                                <input 
                                    name="confirmPassword"
                                    type="password" 
                                    className={`flex h-12 w-full rounded-xl border ${errors.confirm ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50'} bg-white px-4 py-2 text-sm font-bold transition-all outline-none`} 
                                />
                            </div>
                        </div>
                        {(errors.password || errors.confirm) && (
                            <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.password || errors.confirm}</p>
                        )}

                        <div className="pt-6">
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-[#0f172a] text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        A processar...
                                    </>
                                ) : (
                                    "Criar Conta e Começar Grátis"
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tighter">
                        Ao clicar em "Criar Conta", concorda com os nossos <br />
                        <span className="text-blue-600 cursor-pointer underline">Termos de Serviço</span> e <span className="text-blue-600 cursor-pointer underline">Política de Privacidade</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}