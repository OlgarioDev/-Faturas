"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase"; // Importação da conexão
import { 
  Camera, Building2, CreditCard, Save, Globe, 
  Mail, Phone, MapPin, Landmark, Plus, Trash2, 
  Link as LinkIcon, Edit3 
} from 'lucide-react';

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    nif: '',
    regimeIva: 'exclusao',
    endereco: '',
    telefone: '',
    email: '',
    website: '',
    logo: '',
    bancos: [{ banco: '', numeroConta: '', iban: '' }]
  });

  // 1. CARREGAR DADOS DO SUPABASE
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        // Busca o primeiro perfil (Num SaaS real usaríamos .eq('id', user.id))
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .maybeSingle();

        if (data) {
          const mappedData = {
            nomeEmpresa: data.nome_empresa || '',
            nif: data.nif || '',
            regimeIva: data.regime_iva || 'exclusao',
            endereco: data.endereco || '',
            telefone: data.telefone_empresa || '',
            email: data.email_empresa || '',
            website: data.website || '',
            logo: data.logo_url || '',
            bancos: data.bancos || [{ banco: '', numeroConta: '', iban: '' }]
          };
          setFormData(mappedData);
          // Manter o localStorage atualizado para compatibilidade com as outras páginas
          localStorage.setItem('empresa_config', JSON.stringify(mappedData));
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (e) {
        console.error("Erro ao carregar dados da nuvem");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // GESTÃO DE BANCOS
  const addBanco = () => {
    setFormData(prev => ({
      ...prev,
      bancos: [...prev.bancos, { banco: '', numeroConta: '', iban: '' }]
    }));
  };

  const removeBanco = (index: number) => {
    const filtered = formData.bancos.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, bancos: filtered }));
  };

  const updateBanco = (index: number, field: string, value: string) => {
    const updated = [...formData.bancos];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, bancos: updated }));
  };

  // UPLOAD DE LOGO (Base64 para compatibilidade simples por enquanto)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("O ficheiro excede o limite de 5MB para sincronização rápida!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. GUARDAR NO SUPABASE
  const handleSave = async () => {
    if (!formData.nomeEmpresa || !formData.nif) {
      alert("Por favor, preencha o Nome da Empresa e o NIF.");
      return;
    }

    setLoading(true);
    try {
      // Buscamos o ID do perfil atual se existir
      const { data: existing } = await supabase.from('profiles').select('id').maybeSingle();

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: existing?.id, // Se existir, ele faz update. Se não, gera um novo (em produção usaríamos user_id)
          nome_empresa: formData.nomeEmpresa,
          nif: formData.nif,
          regime_iva: formData.regimeIva,
          endereco: formData.endereco,
          telefone_empresa: formData.telefone,
          email_empresa: formData.email,
          website: formData.website,
          logo_url: formData.logo,
          bancos: formData.bancos
        });

      if (error) throw error;

      localStorage.setItem('empresa_config', JSON.stringify(formData));
      setIsEditing(false);
      alert("✓ Perfil sincronizado com a nuvem!");
    } catch (error: any) {
      alert("Erro ao guardar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-300">Sincronizando com a Nuvem...</div>;
  }

  // --- MODO VISUALIZAÇÃO ---
  if (!isEditing) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen font-sans">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a]">Configurações da Empresa</h1>
              <p className="text-slate-500 text-sm">Estes dados aparecerão nos seus documentos fiscais.</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
              <Edit3 size={18} /> Editar Dados
            </button>
          </header>

          <div className="bg-white p-8 rounded-3xl border shadow-sm flex gap-8">
            <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border">
              {formData.logo ? <img src={formData.logo} className="w-full h-full object-contain p-2" /> : <Building2 className="text-slate-300" size={40} />}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-tight">{formData.nomeEmpresa}</h2>
              <p className="text-blue-600 font-bold text-xs uppercase mt-1">NIF: {formData.nif} • Regime: {formData.regimeIva}</p>
              <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-2 font-medium"><Mail size={14} className="text-slate-400"/> {formData.email}</span>
                <span className="flex items-center gap-2 font-medium"><LinkIcon size={14} className="text-slate-400"/> {formData.website}</span>
                <span className="flex items-center gap-2 col-span-2 font-medium"><MapPin size={14} className="text-slate-400"/> {formData.endereco}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-green-600"/> Contas Bancárias</h3>
            <div className="grid gap-4">
              {formData.bancos?.map((b, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.banco || "Banco"}</p>
                    <p className="font-mono font-bold text-slate-700">
                        <span className="text-slate-400 mr-2">IBAN:</span>{b.iban || "---"}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-500">Conta: {b.numeroConta || "---"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MODO EDIÇÃO ---
  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#0f172a]">Editar Empresa</h1>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">Cancelar</button>
        </header>

        <section className="bg-white p-6 rounded-2xl border shadow-sm">
          <h2 className="font-bold mb-4 flex items-center gap-2 text-slate-800"><Camera size={20} className="text-blue-600"/> Logótipo da Empresa</h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden">
              {formData.logo ? <img src={formData.logo} className="w-full h-full object-contain" /> : <Building2 className="text-slate-300" size={40}/>}
            </div>
            <div className="flex flex-col gap-2">
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition shadow-sm">Upload Foto</button>
              <p className="text-[10px] text-red-500 font-black uppercase italic tracking-widest">Aviso: Máximo 5MB para Sincronização</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <h2 className="font-bold flex items-center gap-2 text-slate-800"><Globe size={20} className="text-blue-600"/> Identidade e Website</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nome da Empresa</label>
              <input value={formData.nomeEmpresa} onChange={e => setFormData({...formData, nomeEmpresa: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">NIF</label>
              <input value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Regime de IVA</label>
              <select value={formData.regimeIva} onChange={e => setFormData({...formData, regimeIva: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold cursor-pointer">
                <option value="exclusao">Regime de Exclusão</option>
                <option value="geral">Regime Geral</option>
                <option value="simplificado">Regime Simplificado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Website</label>
              <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="www.minhaempresa.ao" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Morada Completa</label>
              <input value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">E-mail de Contacto</label>
              <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Telefone</label>
              <input value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold flex items-center gap-2 text-slate-800"><CreditCard size={20} className="text-green-600"/> Informações Bancárias</h2>
            <button onClick={addBanco} className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition">
              <Plus size={14} /> Adicionar Banco
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.bancos?.map((b, i) => (
              <div key={i} className="grid md:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl relative border border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Banco</label>
                  <input value={b.banco} onChange={e => updateBanco(i, 'banco', e.target.value)} placeholder="Ex: BAI, BFA..." className="w-full p-2.5 rounded-xl border-slate-200 outline-none text-sm font-bold shadow-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Nº Conta</label>
                  <input value={b.numeroConta} onChange={e => updateBanco(i, 'numeroConta', e.target.value)} placeholder="00000000" className="w-full p-2.5 rounded-xl border-slate-200 outline-none text-sm font-bold shadow-sm" />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">IBAN</label>
                  <input 
                    value={b.iban} 
                    onChange={e => updateBanco(i, 'iban', e.target.value)} 
                    placeholder="AO06.0000..." 
                    className="w-full p-2.5 rounded-xl border-slate-200 outline-none text-sm font-bold shadow-sm" 
                  />
                  {formData.bancos.length > 1 && (
                    <button onClick={() => removeBanco(i)} className="absolute -top-8 -right-2 text-red-400 hover:text-red-600 transition"><Trash2 size={16}/></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#0f172a] text-white py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-slate-800 transition shadow-2xl active:scale-95 disabled:opacity-50"
        >
          <Save size={20} /> {loading ? "Sincronizando..." : "Guardar e Atualizar Perfil"}
        </button>
      </div>
    </div>
  );
}