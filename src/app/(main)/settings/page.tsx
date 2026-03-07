"use client";

import React, { useState, useEffect, useRef } from 'react'; // Adicionado useRef
import { Camera, Building2, CreditCard, Save, Globe, Mail, Phone, MapPin, Landmark } from 'lucide-react';

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null); // Referência para o input
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    nif: '',
    regimeIva: 'exclusao',
    endereco: '',
    telefone: '',
    email: '',
    website: '',
    banco: '',
    numeroConta: '',
    iban: '',
    logo: '' // Adicionado campo logo ao estado
  });

  useEffect(() => {
    const savedData = localStorage.getItem('empresa_config');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // LÓGICA DE UPLOAD
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.nomeEmpresa || !formData.nif) {
      alert("Por favor, preencha o Nome da Empresa e o NIF.");
      return;
    }
    localStorage.setItem('empresa_config', JSON.stringify(formData));
    alert("Configurações guardadas com sucesso!");
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-[#0f172a]">Configurações da Empresa</h1>
          <p className="text-slate-500 text-sm">Configure a identidade fiscal e bancária para os seus documentos.</p>
        </header>

        <div className="grid gap-6">
          {/* LOGÓTIPO - LÓGICA ATIVADA */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
              <Camera size={20} className="text-blue-600" /> Logótipo da Empresa
            </h2>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden">
                {/* Mostra a imagem se existir, senão mostra o ícone */}
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="text-slate-300" size={40} />
                )}
              </div>
              <div className="flex flex-col gap-2">
                {/* Input escondido para o upload */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Upload Foto
                </button>
                <p className="text-xs text-slate-400">Recomendado: PNG ou JPG (Máx. 2MB)</p>
              </div>
            </div>
          </section>

          {/* O resto do teu código permanece EXATAMENTE igual abaixo daqui */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-100 text-slate-600 rounded-lg"><Globe size={24} /></div>
              <h2 className="font-bold text-lg text-slate-800">Identidade Fiscal e Contactos</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome da Empresa</label>
                <input 
                  value={formData.nomeEmpresa}
                  onChange={(e) => setFormData({...formData, nomeEmpresa: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                  placeholder="Ex: Empresa Lda." 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Contribuinte (NIF)</label>
                <input 
                  value={formData.nif}
                  onChange={(e) => setFormData({...formData, nif: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="500012345" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Regime de IVA</label>
                <select 
                  value={formData.regimeIva}
                  onChange={(e) => setFormData({...formData, regimeIva: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                >
                  <option value="geral">Regime Geral</option>
                  <option value="exclusao">Regime de Exclusão</option>
                  <option value="simplificado">Regime Simplificado</option>
                  <option value="caixa">IVA - Regime de Caixa</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço / Morada</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Ex: Talatona, Edificio2, 2º andar, Luanda" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
                <div className="flex gap-2">
                  <span className="flex items-center justify-center px-3 bg-slate-100 border border-slate-300 rounded-lg text-sm font-medium text-slate-600">+244</span>
                  <input 
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="923 000 000" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="geral@suaempresa.ao" 
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Web Site</label>
                <input 
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="www.suaempresa.ao" 
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
              <CreditCard size={20} className="text-green-600" /> Informações para Pagamento
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Banco</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    value={formData.banco}
                    onChange={(e) => setFormData({...formData, banco: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Ex: BAI" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Número de Conta</label>
                <input 
                  value={formData.numeroConta}
                  onChange={(e) => setFormData({...formData, numeroConta: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Número de conta bancária" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">IBAN</label>
                <input 
                  value={formData.iban}
                  onChange={(e) => setFormData({...formData, iban: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="AO06.0000.0000..." 
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end mt-4">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#0f172a] text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-xl active:scale-95"
            >
              <Save size={20} /> Guardar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}