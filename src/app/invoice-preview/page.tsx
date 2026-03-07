"use client";
import React, { useEffect, useState } from 'react';

export default function InvoicePreviewPage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Busca os dados que guardaste nas Configurações
    const saved = localStorage.getItem('empresa_config');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  if (!config) {
    return (
      <div className="p-10 text-center">
        <p>Nenhuma configuração encontrada. Por favor, preencha os dados nas <a href="/settings" className="text-blue-600 underline">Configurações</a>.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 p-8 flex justify-center">
      [cite_start]{/* CONTENTOR DA FATURA A4 [cite: 84] */}
      <div className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl font-sans text-slate-800 relative">
        
        [cite_start]{/* CABEÇALHO: IDENTIDADE DA TUA EMPRESA [cite: 57-64, 85-92] */}
        <div className="flex justify-between items-start mb-10 border-b-2 border-slate-100 pb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">
              {config.nomeEmpresa || "Nome da Empresa"}
            </h1>
            <div className="text-[13px] leading-relaxed text-slate-600">
              <p>{config.endereco}</p>
              <p>Tel: (+244) {config.telefone}</p>
              <p>Web: {config.website}</p>
              <p>E-mail: {config.email}</p>
              <p className="font-bold text-slate-900 mt-2">Contribuinte: {config.nif}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-slate-900 text-white px-4 py-1 text-xs font-bold mb-2 inline-block">ORIGINAL</div>
            <h2 className="text-2xl font-light text-slate-400">FACTURA</h2>
            <p className="text-lg font-bold">N.º FT 2026/1</p>
          </div>
        </div>

        [cite_start]{/* DADOS DO CLIENTE (EXEMPLO UNITEL) [cite: 65, 93] */}
        <div className="mb-10 flex justify-between">
          <div className="w-1/2">
            <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Exmo.(s) Sr(s)</p>
            <div className="text-[14px] border-l-4 border-slate-200 pl-4">
              <p className="font-bold">UNITEL, SA</p>
              <p>Rua Kwame N'Krumah N-53 A</p>
              <p>Luanda, Angola</p>
            </div>
          </div>
          <div className="w-1/3 text-[12px]">
            <div className="grid grid-cols-2 gap-y-1">
              <span className="text-slate-500">Data Documento:</span> <span className="font-medium text-right">2026-01-25</span>
              <span className="text-slate-500">Vencimento:</span> <span className="font-medium text-right">2026-03-09</span>
            </div>
          </div>
        </div>

        [cite_start]{/* TABELA DE ITENS [cite: 71, 99] */}
        <table className="w-full text-left text-[12px] mb-10">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <th className="py-2 px-2">Código</th>
              <th className="py-2">Descrição</th>
              <th className="py-2 text-right">Preço Uni.</th>
              <th className="py-2 text-right">Qtd.</th>
              <th className="py-2 text-right">IVA %</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-4 px-2">01</td>
              <td className="py-4 font-medium uppercase">Prestação de serviços - Publicidade</td>
              <td className="py-4 text-right">3.000.000,00 Kz</td>
              <td className="py-4 text-right">1.00</td>
              <td className="py-4 text-right">0.00</td>
              <td className="py-4 text-right font-bold">3.000.000,00 Kz</td>
            </tr>
          </tbody>
        </table>

        [cite_start]{/* SUMÁRIO E TOTAIS [cite: 74, 102] */}
        <div className="flex justify-end mb-20">
          <div className="w-1/3 text-[13px] space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span>Total ilíquido:</span> <span>3.000.000,00 Kz</span>
            </div>
            <div className="flex justify-between font-black text-lg pt-2 border-t-2 border-slate-900">
              <span>TOTAL:</span> <span>3.000.000,00 Kz</span>
            </div>
          </div>
        </div>

        [cite_start]{/* RODAPÉ FINANCEIRO: DADOS QUE CONFIGURASTE [cite: 75-76, 79-81, 107-109] */}
        <div className="absolute bottom-[15mm] left-[15mm] right-[15mm] border-t-2 border-slate-100 pt-6">
          <div className="grid grid-cols-2 gap-8 text-[11px]">
            <div>
              <p className="font-bold uppercase text-slate-400 mb-2">Regime de IVA</p>
              <p className="text-[13px] font-medium capitalize">Regime de {config.regimeIva}</p>
              <p className="text-slate-400 mt-1 italic leading-tight">
                Os bens/serviços foram colocados à disposição do adquirente na data e local do documento.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="font-bold uppercase text-slate-400 mb-2">Dados Bancários</p>
              <div className="space-y-1 text-[12px]">
                <p><span className="text-slate-500">Banco:</span> <span className="font-bold">{config.banco}</span></p>
                <p><span className="text-slate-500">Conta:</span> <span className="font-bold">{config.numeroConta}</span></p>
                <p><span className="text-slate-500">IBAN:</span> <span className="font-bold tracking-tighter">{config.iban}</span></p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 text-[9px] text-slate-400 uppercase tracking-widest border-t pt-4">
            Processado por programa validado n.º 000/AGT/2026 | +Facturas
          </div>
        </div>

      </div>
    </div>
  );
}