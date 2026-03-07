export function PlanUsage({ used = 18, limit = 30 }) {
  const percentage = Math.min((used / limit) * 100, 100);

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#0f172a]">Uso do Plano Standard</h3>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">
          Limite: {limit} / mês
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <p className="text-slate-500">Faturas emitidas</p>
          <p className="font-bold text-[#0f172a]">{used} de {limit}</p>
        </div>
        
        {/* Barra de Progresso Manual com Tailwind */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${percentage >= 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {percentage >= 80 && (
        <p className="mt-4 text-[11px] text-amber-600 font-medium italic">
          ⚠️ Quase a atingir o seu limite de 30 faturas!
        </p>
      )}
      
      <button className="w-full mt-6 py-2.5 text-sm font-bold text-white bg-[#0f172a] rounded-lg hover:bg-slate-800 transition-all">
        Fazer Upgrade para Medium
      </button>
    </div>
  );
}