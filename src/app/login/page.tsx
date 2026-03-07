"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <Link href="/" className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar 
            </Link>

            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
               
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-[#0f172a]">Bem-vindo de volta</h1>
                        <p className="text-slate-500">Insira as suas credenciais para aceder.</p>
                    </div>

                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">E-mail</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" type="email" placeholder="nome@empresa.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" type="password" placeholder="••••••••" />
                        </div>
                        <button className="w-full h-10 bg-[#0f172a] text-white rounded-md font-bold hover:bg-[#0f172a]/90 transition-colors">
                            Entrar
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-slate-500">
                            Ainda não tem conta?{" "}
                            <Link href="/register" className="font-bold text-blue-600 hover:underline">
                                Criar Conta Grátis
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
