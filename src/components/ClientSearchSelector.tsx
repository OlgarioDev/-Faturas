"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

// 1. Atualizada a interface para aceitar defaultValue
interface ClientSearchSelectorProps {
  onClientSelect?: (client: any) => void;
  defaultValue?: string; 
}

export default function ClientSearchSelector({ 
  onClientSelect, 
  defaultValue 
}: ClientSearchSelectorProps) {
  // 2. O estado inicial agora considera o defaultValue
  const [query, setQuery] = useState(defaultValue || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("facturas_clients") : null;
    if (saved) {
      try {
        const clients = JSON.parse(saved);
        setAllClients(clients);
        
        // 3. Se houver defaultValue, tentamos encontrar o cliente nos dados guardados
        if (defaultValue) {
          const found = clients.find((c: any) => c.nome === defaultValue);
          if (found) {
            setSelectedClient(found);
            if (onClientSelect) onClientSelect(found);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar clientes:", e);
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [defaultValue, onClientSelect]); // Adicionada dependência para reagir a mudanças no valor inicial

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 0 && !selectedClient) {
        const filtered = allClients.filter(client =>
          client.nome.toLowerCase().includes(query.toLowerCase()) ||
          client.nif.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query, allClients, selectedClient]);

  const handleSelect = (client: any) => {
    setQuery(client.nome);
    setSelectedClient(client);
    setShowSuggestions(false);
    if (onClientSelect) onClientSelect(client);
  };

  const resetSearch = () => {
    setQuery("");
    setSelectedClient(null);
    if (onClientSelect) onClientSelect(null);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest ml-1">
        Procurar Cliente
      </label>
      <div className="relative">
        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${selectedClient ? 'text-green-500' : 'text-slate-400'}`} size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedClient) setSelectedClient(null);
          }}
          placeholder="Nome ou NIF..."
          className={`w-full pl-11 pr-11 py-3 bg-white border rounded-2xl outline-none transition-all text-sm font-medium ${
            selectedClient ? 'border-green-200 bg-green-50/30 ring-4 ring-green-50' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
          }`}
        />
        {selectedClient ? (
          <button type="button" onClick={resetSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-red-500">
            <CheckCircle2 size={20} className="animate-in zoom-in" />
          </button>
        ) : query.length > 0 && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
            <XCircle size={18} />
          </button>
        )}
      </div>

      {selectedClient && (
        <p className="text-xs text-green-600 font-bold mt-2">
          ✓ Fatura será emitida para: {selectedClient.nome} (NIF: {selectedClient.nif})
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((client) => (
              <button key={client.id} type="button" onClick={() => handleSelect(client)} className="w-full flex items-center justify-between p-3.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                    {client.nome.substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">{client.nome}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-tighter">NIF: {client.nif}</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}