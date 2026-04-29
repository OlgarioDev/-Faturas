"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Importação da conexão real
import { Loader2 } from "lucide-react";
import { validateNIF, validateEmail, validatePassword } from "@/lib/auth-validation";

export default function RegisterForm() {
    const router = useRouter();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const email = (formData.get("email") as string).trim();
        const nif = (formData.get("nif") as string).trim();
        const companyName = (formData.get("companyName") as string).trim();
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // --- VALIDAÇÕES ---
        let newErrors: Record<string, string> = {};

        if (!validateEmail(email)) newErrors.email = "E-mail inválido.";
        if (!validateNIF(nif)) newErrors.nif = "NIF inválido (9-10 dígitos).";
        if (!validatePassword(password)) newErrors.password = "Mínimo 8 caracteres (letras e números).";
        if (password !== confirmPassword) newErrors.confirm = "As senhas não coincidem.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            // 1. REGISTO NO SUPABASE AUTH
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // Guarda o nome da empresa e NIF nos metadados do utilizador
                    data: {
                        company_name: companyName,
                        nif: nif,
                    }
                }
            });

            if (authError) throw authError;

            // 2. SUCESSO OU UTILIZADOR JÁ EXISTE
            if (data.user) {
                alert(`✓ Conta ${data.user.email} criada com sucesso! (Projeto: ${process.env.NEXT_PUBLIC_SUPABASE_URL}). Já podes entrar.`);
                router.push("/login");
            } else {
                // Supabase retorna sucesso sem utilizador se o email já estiver registado
                alert("⚠️ Este e-mail já está registado! Por favor, faz login em vez de criar uma conta nova.");
                router.push("/login");
            }

        } catch (error: any) {
            alert("Erro ao criar conta: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome da Empresa */}
            <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight">Nome da Empresa</label>
                <input 
                    name="companyName" 
                    required 
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none disabled:opacity-50" 
                    placeholder="Ex: TecnoAngola Lda" 
                />
            </div>

            {/* NIF */}
            <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight">NIF</label>
                <input 
                    name="nif" 
                    required 
                    disabled={isLoading}
                    className={`flex h-10 w-full rounded-md border ${errors.nif ? 'border-red-500' : 'border-slate-200'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none disabled:opacity-50`} 
                    placeholder="0000000000" 
                />
                {errors.nif && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.nif}</p>}
            </div>

            {/* E-mail */}
            <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight">E-mail Profissional</label>
                <input 
                    name="email" 
                    type="email" 
                    required 
                    disabled={isLoading}
                    className={`flex h-10 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-slate-200'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none disabled:opacity-50`} 
                    placeholder="geral@suaempresa.com" 
                />
                {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.email}</p>}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium tracking-tight">Password</label>
                    <input 
                        name="password" 
                        type="password" 
                        required 
                        disabled={isLoading}
                        className={`flex h-10 w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-slate-200'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none disabled:opacity-50`} 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium tracking-tight">Confirmar</label>
                    <input 
                        name="confirmPassword" 
                        type="password" 
                        required 
                        disabled={isLoading}
                        className={`flex h-10 w-full rounded-md border ${errors.confirm ? 'border-red-500' : 'border-slate-200'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none disabled:opacity-50`} 
                    />
                </div>
            </div>
            {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.password}</p>}
            {errors.confirm && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.confirm}</p>}

            {/* Botão Submeter */}
            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 bg-[#0f172a] text-white rounded-md font-bold hover:bg-[#0f172a]/90 transition-all shadow-lg text-base active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            A criar conta...
                        </>
                    ) : (
                        "Criar Conta e Começar Grátis"
                    )}
                </button>
            </div>
        </form>
    );
}