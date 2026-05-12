// src/lib/api.ts
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let token = "";
  
  try {
    // 1. PRIORIDADE MÁXIMA: O token oficial do Supabase
    const supabaseKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
    if (supabaseKey) {
      const supabaseData = JSON.parse(localStorage.getItem(supabaseKey) || "{}");
      token = supabaseData.access_token || "";
    }

    // 2. FALLBACK: Se o Supabase falhar, tenta o user_session
    if (!token) {
      const sessionData = localStorage.getItem("user_session") || "";
      if (sessionData.split('.').length === 3) {
        token = sessionData;
      } else {
        try {
          const parsed = JSON.parse(sessionData);
          token = parsed.access_token || "";
        } catch(e) {}
      }
    }
  } catch (e) {
    console.error("Erro ao ler token de autenticação", e);
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    console.warn("[DEBUG API] Nenhum token JWT válido encontrado no Frontend!");
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  // CORREÇÃO CRÍTICA: Garante que o URL final é sempre válido (ex: /api/clients/)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const finalUrl = `${BASE_URL}${cleanEndpoint}`;

  console.log(`[DEBUG API] A tentar contactar: ${finalUrl}`);
  console.log(`[DEBUG API] Token: ${token ? token.substring(0, 15) + "..." : "NENHUM"}`);

  try {
    const response = await fetch(finalUrl, config);
    
    console.log(`[DEBUG API] Resposta de ${finalUrl}: Status ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG API] ERRO DO SERVIDOR:`, errorText);
      throw new Error(`Erro na API (${response.status}): ${errorText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
    
  } catch (error) {
    console.error(`[DEBUG API] FALHA DE REDE ao contactar ${finalUrl}:`, error);
    throw error;
  }
}