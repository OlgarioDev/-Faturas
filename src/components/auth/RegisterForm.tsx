"use client";

import { useState } from "react";
import { validateNIF, validateEmail, validatePassword } from "@/lib/auth-validation";

export default function RegisterForm() {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const email = formData.get("email") as string;
        const nif = formData.get("nif") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        let newErrors: Record<string, string> = {};

        if (!validateEmail(email)) newErrors.email = "E-mail inválido.";
        if (!validateNIF(nif)) newErrors.nif = "NIF inválido (9-10 dígitos).";
        if (!validatePassword(password)) newErrors.password = "Mínimo 8 caracteres (letras e números).";
        if (password !== confirmPassword) newErrors.confirm = "As senhas não coincidem.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        console.log("Enviando dados:", Object.fromEntries(formData));
        // Aqui você faria o redirecionamento ou salvamento no localStorage
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight">Nome da Empresa</label>
                <input name="companyName" required className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none" placeholder="Ex: TecnoAngola Lda" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight">NIF</label>
                <input name="nif" required className={`flex h-10 w-full rounded-md border ${errors.nif ? 'border-red-500' : 'border-slate-200'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none`} placeholder="0000000000" />
                {errors.nif && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.nif}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight">E-mail Profissional</label>
                <input name="email" type="email" required className={`flex h-10 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-slate-200'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none`} placeholder="geral@suaempresa.com" />
                {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium tracking-tight">Password</label>
                    <input name="password" type="password" required className={`flex h-10 w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-slate-200'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none`} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium tracking-tight">Confirmar</label>
                    <input name="confirmPassword" type="password" required className={`flex h-10 w-full rounded-md border ${errors.confirm ? 'border-red-500' : 'border-slate-200'} bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 outline-none`} />
                </div>
            </div>
            {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.password}</p>}
            {errors.confirm && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.confirm}</p>}

            <div className="pt-4">
                <button type="submit" className="w-full h-12 bg-[#0f172a] text-white rounded-md font-bold hover:bg-[#0f172a]/90 transition-all shadow-lg text-base active:scale-[0.98]">
                    Criar Conta e Começar Grátis
                </button>
            </div>
        </form>
    );
}