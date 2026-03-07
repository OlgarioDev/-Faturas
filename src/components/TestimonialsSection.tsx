import Image from "next/image";
import { InfiniteMarquee } from "@/components/InfiniteMarquee";

const testimonials = [
    {
        name: "Carlos Mendes",
        role: "CEO, Logística Mendes",
        text: "O +Facturas revolucionou a nossa gestão. A emissão de guias é instantânea.",
        image: "/images/businessman.png",
    },
    {
        name: "Ana Silva",
        role: "Freelancer de Design",
        text: "Simples, rápido e certificado. Tudo o que eu precisava para estar legal.",
        image: "/images/freelancer.png",
    },
    {
        name: "Pedro Gomes",
        role: "Gestor, Cafetaria Central",
        text: "O suporte é incrível. Resolveram a minha dúvida num domingo à tarde!",
        image: "/images/about-team.png",
    },
    {
        name: "Mariana Costa",
        role: "Diretora, TechAngola",
        text: "A integração com a AGT é impecável. Nunca mais tive problemas fiscais.",
        image: "/images/freelancer.png",
    },
];

export function TestimonialsSection() {
    return (
        <div className="w-full py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-4 mb-12 text-center">
                <h2 className="text-3xl font-bold text-[#0f172a]">O que dizem os nossos clientes</h2>
            </div>

            <InfiniteMarquee direction="right">
                {testimonials.map((t, i) => (
                    <div
                        key={i}
                        className="relative h-full w-[350px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mr-4"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                                <Image
                                    src={t.image}
                                    alt={t.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[#0f172a]">{t.name}</h4>
                                <p className="text-xs text-slate-500">{t.role}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">"{t.text}"</p>
                    </div>
                ))}
            </InfiniteMarquee>
        </div>
    );
}
