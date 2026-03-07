"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Package, ChevronDown, CheckCircle2 } from "lucide-react";

interface Product {
  id: string | number;
  descricao: string;
  preco: number;
}

export default function ProductSearchSelector({ 
  onProductSelect,
  value 
}: { 
  onProductSelect: (product: Product | null) => void;
  value: string;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("facturas_products") : null;
    if (saved) {
      try { setAllProducts(JSON.parse(saved)); } catch (e) { console.error(e); }
    } else {
      // Dados de teste caso a pasta de produtos esteja vazia
      const demo = [
        { id: 1, descricao: "Consultoria Técnica", preco: 50000 },
        { id: 2, descricao: "Manutenção de Software", preco: 25000 },
        { id: 3, descricao: "Licença Anual Cloud", preco: 120000 }
      ];
      setAllProducts(demo);
    }

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0 && showSuggestions) {
      const filtered = allProducts.filter(p => p.descricao.toLowerCase().includes(query.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions(allProducts);
    }
  }, [query, allProducts, showSuggestions]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center bg-transparent">
        <input
          type="text"
          value={query}
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onProductSelect({ id: 'manual', descricao: e.target.value, preco: 0 });
          }}
          placeholder="Procure ou escreva o serviço..."
          className="w-full bg-transparent border-none text-sm font-bold text-slate-800 outline-none focus:ring-0 p-0"
        />
        <ChevronDown size={14} className="text-slate-300 ml-1" />
      </div>

      {showSuggestions && (
        <div className="absolute z-[110] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 left-0">
          <div className="max-h-60 overflow-y-auto">
            {suggestions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setQuery(p.descricao);
                  onProductSelect(p);
                  setShowSuggestions(false);
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-blue-50 border-b border-slate-50 last:border-0 text-left"
              >
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{p.descricao}</div>
                    <div className="text-[10px] text-blue-600 font-bold">{p.preco.toLocaleString()} Kz</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}