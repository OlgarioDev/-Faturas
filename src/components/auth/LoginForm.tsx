"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { validateEmail } from "@/lib/auth-validation";
import { supabase } from "@/lib/supabase"; // 1. Importa a nossa ligação
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Lógica para carregar e-mail guardado
    useEffect(() => {
        const savedEmail = localStorage.getItem("remembered_email");
        if (savedEmail) {
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Validações básicas de UI
        let newErrors: Record<string, string> = {};
        if (!validateEmail(email)) newErrors.email = "Introduza um e-mail válido.";
        if (password.length < 6) newErrors.password = "A password deve ter pelo menos 6 caracteres.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        // 2. AUTENTICAÇÃO REAL COM SUPABASE
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Caso o Supabase retorne erro (Senha errada, user não existe, etc)
                setErrors({ auth: error.message });
                setIsLoading(false);
                return;
            }

            // Lógica do "Lembrar-me"
            if (rememberMe) {
                localStorage.setItem("remembered_email", email);
            } else {
                localStorage.removeItem("remembered_email");
            }

            // Sucesso: O Supabase já cria o Cookie de sessão sozinho.
            // Redirecionamos para o dashboard
            router.push("/dashboard");
            
        } catch (err) {
            setErrors({ auth: "Ocorreu um erro inesperado ao tentar entrar." });
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mensagem de Erro Geral da Autenticação */}
            {errors.auth && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-red-500 text-[10px] font-black uppercase text-center">{errors.auth}</p>
                </div>
            )}

            {/* Campo E-mail */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        name="email"
                        type="email"
                        defaultValue={typeof window !== 'undefined' ? localStorage.getItem("remembered_email") || "" : ""}
                        className={`flex h-12 w-full rounded-xl border ${errors.email ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50'} bg-white pl-12 pr-4 py-2 text-sm font-bold transition-all outline-none`} 
                        placeholder="exemplo@empresa.ao" 
                        required
                    />
                </div>
                {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.email}</p>}
            </div>

            {/* Campo Password */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <button type="button" className="text-[10px] font-black text-blue-600 uppercase hover:underline">Esqueceu a senha?</button>
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className={`flex h-12 w-full rounded-xl border ${errors.password ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50'} bg-white pl-12 pr-12 py-2 text-sm font-bold transition-all outline-none`} 
                        placeholder="••••••••"
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.password}</p>}
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center gap-2 px-1">
                <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                    Lembrar-me neste dispositivo
                </label>
            </div>

            {/* Botão Entrar */}
            <div className="pt-4">
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-[#0f172a] text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            A autenticar...
                        </>
                    ) : (
                        "Entrar no Sistema"
                    )}
                </button>
            </div>
        </form>
    );
}