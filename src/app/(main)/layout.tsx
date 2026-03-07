"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Menu, X } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* BOTÃO HAMBURGUER (Apenas visível em Smartphones < 768px) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* SIDEBAR: Fixo em Tablets (md) e PC (lg) | Hamburguer em Mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar />
      </div>

      {/* OVERLAY: Apenas para Smartphone */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 overflow-y-auto w-full bg-slate-50">
        {/* Padding superior apenas no telemóvel para não sobrepor o botão */}
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}