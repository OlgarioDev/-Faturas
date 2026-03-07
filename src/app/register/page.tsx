"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Link href="/" className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Link>

            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* SIDEBAR INFO */}
                <div className="hidden md:flex md:w-5/12 bg-[#0f172a] p-8 flex-col text-white justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-4">+Facturas</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start text-sm text-slate-300">
                                <CheckCircle2 className="mr-3 h-5 w-5 text-green-400 flex-shrink-0" />
                                1º Mês Totalmente Grátis
                            </li>
                            <li className="flex items-start text-sm text-slate-300">
                                <CheckCircle2 className="mr-3 h-5 w-5 text-green-400 flex-shrink-0" />
                                Sem fidelização forçada
                            </li>
                            <li className="flex items-start text-sm text-slate-300">
                                <CheckCircle2 className="mr-3 h-5 w-5 text-green-400 flex-shrink-0" />
                                Certificado pela AGT
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg text-xs leading-relaxed text-slate-300">
                        "Junte-se a nós! Vamos enviar-lhe lembretes antes da sua subscrição expirar para garantir que nunca pare de faturar."
                    </div>
                </div>

                {/* FORM */}
                <div className="w-full md:w-7/12 p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[#0f172a]">Crie a sua Conta</h2>
                        <p className="text-slate-500 text-sm">Comece a faturar em menos de 2 minutos.</p>
                    </div>

                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome da Empresa</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Ex: TecnoAngola Lda" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">NIF</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="0000000000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Telemóvel (para notificações)</label>
                            <div className="flex">
                                <span className="flex items-center justify-center h-10 px-3 border border-r-0 rounded-l-md bg-slate-100 text-slate-500 text-sm border-input">
                                    +244
                                </span>
                                <input className="flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="923 000 000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">E-mail Profissional</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" type="email" placeholder="geral@suaempresa.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" type="password" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirmar</label>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" type="password" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button className="w-full h-12 bg-[#0f172a] text-white rounded-md font-bold hover:bg-[#0f172a]/90 transition-colors shadow-lg text-base">
                                Criar Conta e Começar Grátis
                            </button>
                        </div>
                    </form>
                    <p className="mt-4 text-center text-xs text-slate-400">
                        Ao clicar em "Criar Conta", concorda com os nossos Termos de Serviço e Política de Privacidade.
                    </p>
                </div>
            </div>
        </div>
    );
}
