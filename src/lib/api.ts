// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.5:5000";

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
      // Um JWT tem sempre 3 partes separadas por pontos. Se não tiver, ignoramos.
      if (sessionData.split('.').length === 3) {
        token = sessionData;
      } else {
        try {
          // Pode ser que o user_session seja um objeto JSON que contém o token
          const parsed = JSON.parse(sessionData);
          token = parsed.access_token || "";
        } catch(e) {
          // Ignorar, não é um token válido
        }
      }
    }
  } catch (e) {
    console.error("Erro ao ler token de autenticação", e);
  }

  // Deixa um pequeno rasto na consola do browser (F12) para debug
  console.log("A enviar token:", token ? token.substring(0, 15) + "..." : "NENHUM TOKEN ENCONTRADO");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    console.warn("Nenhum token JWT válido encontrado no Frontend!");
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API (${response.status}): ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}