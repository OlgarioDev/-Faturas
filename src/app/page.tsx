"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Check, X, Shield, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfiniteMarquee } from "@/components/InfiniteMarquee";
import { TestimonialsSection } from "@/components/TestimonialsSection";

type BillingCycle = "monthly" | "quarterly" | "semiannual" | "annual";

const cycles: { value: BillingCycle; label: string }[] = [
    { value: "monthly", label: "Mensal" },
    { value: "quarterly", label: "Trimestral" },
    { value: "semiannual", label: "Semestral" },
    { value: "annual", label: "Anual" },
];

export default function LandingPage() {
    const [cycle, setCycle] = useState<BillingCycle>("quarterly");

    const isMonthly = cycle === "monthly";

    return (
        <div className="flex min-h-screen flex-col font-sans bg-slate-50">
            {/* NAVBAR */}
            <header className="sticky top-0 z-50 w-full bg-[#0f172a] text-white border-b border-white/10">
                <div className="container mx-auto px-4 flex h-20 items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-2xl">
                        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-[#0f172a]">
                            <span className="font-extrabold">+</span>
                        </div>
                        <span>+Facturas</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="#hero" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Início
                        </Link>
                        <Link href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Sobre
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Serviços
                        </Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/login"
                            className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-6 bg-white text-[#0f172a] hover:bg-slate-200 transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-6 border border-white/20 text-white hover:bg-white/10 transition-colors"
                        >
                            Começar Grátis
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* HERO SECTION */}
               <section id="hero" className="relative w-full bg-[#0f172a] pt-12 pb-32 md:pt-24 md:pb-48 overflow-hidden">
    <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                    Novo: Exportação SAFT-AO em 1 clique
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white leading-tight">
                    A Gestão do seu Negócio <br />
                    <span className="text-blue-500">em boas mãos.</span>
                </h1>
                <p className="text-lg text-slate-400 md:text-xl font-light max-w-lg">
                    Faturação online certificada pela AGT. Simples, poderosa e feita para o mercado angolano.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link
                        href="/register"
                        className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-base font-bold text-white shadow-lg hover:bg-blue-500 transition-all transform hover:scale-105"
                    >
                        Começar Agora
                    </Link>
                </div>
            </div>

            {/* AQUI ENTRA A TUA ILUSTRAÇÃO (+Facturas Mockup) */}
            <div className="relative h-[400px] lg:h-[550px] w-full flex items-center justify-center">
                <div className="relative w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float">
                    <Image
                        src="/images/ilustration.png" 
                        alt="Interface do +Facturas em múltiplos dispositivos"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                {/* Elementos decorativos atrás da imagem */}
                <div className="absolute -z-10 h-[300px] w-[300px] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>
        </div>
    </div>
</section>

                {/* SEGMENTATION SECTION (OVERLAP) */}
                <section className="relative z-20 -mt-24 pb-20">
                    <div className="container mx-auto px-4">
                        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100">
                            <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
                                <div>
                                    <h2 className="text-3xl font-bold text-[#0f172a] mb-4">Mais que Software de Negócios.</h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        Uma solução completa adaptada à realidade angolana. Desde o freelancer que trabalha no café ao grande armazém logístico, temos as ferramentas certas para si.
                                    </p>
                                    <Link
                                        href="#pricing"
                                        className="inline-flex mt-6 h-10 items-center justify-center rounded-md bg-[#0f172a] px-6 text-sm font-medium text-white shadow transition-colors hover:bg-[#0f172a]/90"
                                    >
                                        Ver Planos
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group relative overflow-hidden rounded-xl bg-slate-100 aspect-[4/3] shadow-md hover:shadow-lg transition-all">
                                        <Image
                                            src="/images/businessman.png"
                                            alt="Grandes Negócios"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                            <span className="text-white font-bold text-sm">Para Grandes Negócios</span>
                                        </div>
                                    </div>
                                    <div className="group relative overflow-hidden rounded-xl bg-slate-100 aspect-[4/3] shadow-md hover:shadow-lg transition-all">
                                        <Image
                                            src="/images/freelancer.png"
                                            alt="Freelancers"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                            <span className="text-white font-bold text-sm">Para Freelancers</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ABOUT US SECTION */}
                <section id="about" className="w-full py-20 bg-slate-50">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid gap-12 lg:grid-cols-2 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Desenvolvido por Angolanos
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-[#0f172a]">
                                    Feito em Angola, para Angola.
                                </h2>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    "Nascemos com o propósito de eliminar a burocracia. Com uma equipa local e suporte em tempo real, garantimos que a sua faturação nunca pare."
                                </p>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm w-full">
                                        <Users className="h-6 w-6 text-[#0f172a] mt-1" />
                                        <div>
                                            <h3 className="font-bold text-[#0f172a]">Suporte Local</h3>
                                            <p className="text-sm text-slate-500">Apoio técnico via Telefone e WhatsApp.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm w-full">
                                        <Briefcase className="h-6 w-6 text-[#0f172a] mt-1" />
                                        <div>
                                            <h3 className="font-bold text-[#0f172a]">Certificado AGT</h3>
                                            <p className="text-sm text-slate-500">Software validado nº XXX/AGT/2024.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                                <Image
                                    src="/images/about-team.png"
                                    alt="Equipa +Facturas"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section id="pricing" className="w-full py-24 bg-white">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-5xl text-[#0f172a]">
                                Planos Flexíveis
                            </h2>
                            <p className="mx-auto max-w-[600px] text-slate-500 md:text-xl">
                                Comece grátis e evolua conforme o seu negócio cresce.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-lg mt-6">
                                {cycles.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => setCycle(c.value)}
                                        className={cn(
                                            "px-4 py-2 text-sm font-semibold rounded-md transition-all",
                                            cycle === c.value
                                                ? "bg-white text-[#0f172a] shadow-sm ring-1 ring-slate-200"
                                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                                        )}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
                            {/* PLANO STANDARD */}
                            <div className="flex flex-col p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                                <div className="space-y-2 mb-6">
                                    <h3 className="text-2xl font-bold text-[#0f172a]">Standard</h3>
                                    <p className="text-slate-500 text-sm">Freelancers e Prestadores de Serviços.</p>
                                </div>
                                <div className="mb-8 p-4 bg-slate-50 rounded-lg text-center">
                                    <span className="text-4xl font-extrabold text-[#0f172a]">
                                        {cycle === "monthly" ? "7.500" : cycle === "quarterly" ? "18.000" : cycle === "semiannual" ? "35.000" : "65.000"}
                                    </span>
                                    <span className="text-sm font-medium text-slate-500 ml-1">Kz</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-center text-sm text-slate-600">
                                        <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                                        2 Utilizadores
                                    </li>
                                    <li className="flex items-center text-sm text-slate-600">
                                        <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                                        Até 30 Faturas/mês
                                    </li>
                                    <li className="flex items-center text-sm text-slate-600">
                                        <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                                        1º Mês Grátis
                                    </li>
                                </ul>
                                <Link
                                    href="/register"
                                    className="w-full inline-flex h-12 items-center justify-center rounded-lg border-2 border-[#0f172a] bg-transparent text-sm font-bold text-[#0f172a] hover:bg-[#0f172a] hover:text-white transition-colors"
                                >
                                    Registar Agora
                                </Link>
                            </div>

                            {/* PLANO MEDIUM */}
                            <div className="flex flex-col p-8 bg-[#0f172a] text-white rounded-2xl shadow-2xl scale-105 z-10 relative workflow-card">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                                    Mais Popular
                                </div>
                                <div className="space-y-2 mb-6">
                                    <h3 className="text-2xl font-bold">Medium</h3>
                                    <p className="text-slate-300 text-sm">Empresas em Crescimento.</p>
                                </div>
                                <div className="mb-8 p-4 bg-white/10 rounded-lg text-center backdrop-blur-sm min-h-[100px] flex items-center justify-center">
                                    {isMonthly ? (
                                        <span className="text-sm font-medium text-red-300">
                                            Disponível apenas em planos Trimestral, Semestral ou Anual
                                        </span>
                                    ) : (
                                        <div>
                                            <span className="text-5xl font-extrabold text-white">
                                                {cycle === "quarterly" ? "20.000" : cycle === "semiannual" ? "39.000" : "74.000"}
                                            </span>
                                            <span className="text-sm font-medium text-slate-300 ml-1">Kz</span>
                                        </div>
                                    )}
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-center text-sm text-slate-200">
                                        <Check className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0" />
                                        6 Utilizadores
                                    </li>
                                    <li className="flex items-center text-sm text-slate-200">
                                        <Check className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0" />
                                        Até 500 Faturas/mês
                                    </li>
                                    <li className="flex items-center text-sm text-slate-200 font-medium">
                                        <Check className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0" />
                                        Gestão de Stock & Inventário
                                    </li>
                                </ul>
                                <Link
                                    href="/register"
                                    className="w-full inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-500 transition-colors shadow-lg"
                                >
                                    Começar Grátis
                                </Link>
                            </div>

                            {/* PLANO PREMIUM */}
                            <div className="flex flex-col p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                                <div className="space-y-2 mb-6">
                                    <h3 className="text-2xl font-bold text-[#0f172a]">Premium</h3>
                                    <p className="text-slate-500 text-sm">Grandes Empresas e Armazéns.</p>
                                </div>
                                <div className="mb-8 p-4 bg-slate-50 rounded-lg text-center min-h-[100px] flex items-center justify-center">
                                    {isMonthly ? (
                                        <span className="text-sm font-medium text-red-500">
                                            Disponível apenas em planos Trimestral, Semestral ou Anual
                                        </span>
                                    ) : (
                                        <div>
                                            <span className="text-4xl font-extrabold text-[#0f172a]">
                                                {cycle === "quarterly" ? "26.000" : cycle === "semiannual" ? "45.000" : "85.000"}
                                            </span>
                                            <span className="text-sm font-medium text-slate-500 ml-1">Kz</span>
                                        </div>
                                    )}
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-center text-sm text-slate-600">
                                        <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                                        10 Utilizadores
                                    </li>
                                    <li className="flex items-center text-sm text-slate-600 font-bold">
                                        <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                                        Faturas Ilimitadas
                                    </li>
                                    <li className="flex items-center text-sm text-slate-600">
                                        <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                                        Multi-armazém & Fornecedores
                                    </li>
                                    <li className="flex items-center text-sm text-slate-600">
                                        <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                                        Impressão A4 & Térmica
                                    </li>
                                </ul>
                                <Link
                                    href="/register"
                                    className="w-full inline-flex h-12 items-center justify-center rounded-lg border-2 border-[#0f172a] bg-transparent text-sm font-bold text-[#0f172a] hover:bg-[#0f172a] hover:text-white transition-colors"
                                >
                                    Registar Agora
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LOGO TICKER */}
                <div className="border-t border-slate-100 pt-16">
                    <p className="text-center text-sm font-medium text-slate-400 mb-8 uppercase tracking-widest">Empresas que confiam no +Facturas</p>
                    <InfiniteMarquee speed="slow">
                        {/* Repeat logos to ensure seamless scroll even on wide screens */}
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500 justify-around w-full">
                                <div className="relative h-12 w-32"><Image src="/images/logos-1.png" alt="Client Logo" fill className="object-contain" /></div>
                                <div className="relative h-12 w-32"><Image src="/images/logos-2.png" alt="Client Logo" fill className="object-contain" /></div>
                                <div className="font-bold text-2xl text-slate-400">UNITEL</div>
                                <div className="relative h-12 w-32"><Image src="/images/logos-1.png" alt="Client Logo" fill className="object-contain" /></div>
                                <div className="font-bold text-2xl text-slate-400">KIANGO</div>
                                <div className="relative h-12 w-32"><Image src="/images/logos-2.png" alt="Client Logo" fill className="object-contain" /></div>
                            </div>
                        ))}
                    </InfiniteMarquee>
                </div>

                {/* TEAM & CLIENTS */}
                <section className="w-full py-24 bg-slate-50">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-8">Nossa Equipa</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="h-24 w-24 mx-auto bg-slate-200 rounded-full mb-4 overflow-hidden relative">
                                    <Image src="/images/businessman.png" alt="CEO" fill className="object-cover" />
                                </div>
                                <h3 className="font-bold text-[#0f172a]">João Silva</h3>
                                <p className="text-sm text-slate-500">CEO & Fundador</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="h-24 w-24 mx-auto bg-slate-200 rounded-full mb-4 relative overflow-hidden">
                                    <Image src="/images/freelancer.png" alt="CTO" fill className="object-cover" />
                                </div>
                                <h3 className="font-bold text-[#0f172a]">Maria Costa</h3>
                                <p className="text-sm text-slate-500">Diretora Técnica</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="h-24 w-24 mx-auto bg-slate-200 rounded-full mb-4 flex items-center justify-center font-bold text-slate-400">
                                    PF
                                </div>
                                <h3 className="font-bold text-[#0f172a]">Pedro Ferreira</h3>
                                <p className="text-sm text-slate-500">Gestor de Contas</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[#0f172a] mb-8">Quem Confia em Nós</h2>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="font-bold text-2xl text-slate-400">TECNOANGOLA</div>
                            <div className="font-bold text-2xl text-slate-400">KIANGO</div>
                            <div className="font-bold text-2xl text-slate-400">LUBIT</div>
                            <div className="font-bold text-2xl text-slate-400">UNITEL (Parceiro)</div>
                        </div>
                    </div>
                </section>

                <TestimonialsSection />
            </main>

            {/* FOOTER */}
            <footer className="py-10 bg-[#0f172a] text-slate-300">
                <div className="container mx-auto px-4 text-center md:text-left grid md:grid-cols-4 gap-8">
                    <div>
                        <span className="text-2xl font-bold text-white">+Facturas</span>
                        <p className="mt-4 text-sm">O parceiro ideal para o crescimento do seu negócio em Angola.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Produto</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Preços</li>
                            <li>Funcionalidades</li>
                            <li>API</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Empresa</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Sobre Nós</li>
                            <li>Carreiras</li>
                            <li>Contactos</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Termos de Uso</li>
                            <li>Privacidade</li>
                            <li>Livro de Reclamações</li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
