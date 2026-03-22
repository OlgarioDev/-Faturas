"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { validateEmail } from "@/lib/auth-validation";

export default function LoginForm() {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // 1. Lógica para carregar e-mail guardado (Lembrar-me)
    useEffect(() => {
        const savedEmail = localStorage.getItem("remembered_email");
        if (savedEmail) {
            setRememberMe(true);
            // Poderíamos pré-preencher o campo aqui se usássemos um estado para o email
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Validações básicas
        let newErrors: Record<string, string> = {};
        if (!validateEmail(email)) newErrors.email = "Introduza um e-mail válido.";
        if (password.length < 4) newErrors.password = "A password é obrigatória.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        // 2. Simulação de Autenticação
        setTimeout(() => {
            if (rememberMe) {
                localStorage.setItem("remembered_email", email);
            } else {
                localStorage.removeItem("remembered_email");
            }

            // Simulação de sucesso: guarda sessão e redireciona
            localStorage.setItem("user_session", JSON.stringify({ email, role: "admin" }));
            document.cookie = "user_session=true; path=/; max-age=86400"; // Expira em 24h
            window.location.href = "/dashboard";
        }, 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
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
                    <a href="#" className="text-[10px] font-black text-blue-600 uppercase hover:underline">Esqueceu a senha?</a>
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