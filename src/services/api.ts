import { supabase } from '@/lib/supabase';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

async function apiFetch(endpoint: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Erro na API');
  }

  return res.json();
}

export const invoicesApi = {
  getAll: (company_id: number) =>
    apiFetch(`/invoices/?company_id=${company_id}`),

  create: (data: {
    company_id: number;
    total_amount: number;
    invoice_date?: string;
  }) => apiFetch('/invoices/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const insightsApi = {
  askAI: (query: string) =>
    apiFetch('/insights/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  getChurnRisk: (company_id: number) =>
    apiFetch(`/insights/churn-risk/${company_id}`),
};

export const adminApi = {
  getStats: () => apiFetch('/admin/dashboard'),
  getUsers: () => apiFetch('/admin/users'),
  suspendUser: (userId: number) => apiFetch(`/admin/users/${userId}/suspend`, { method: 'POST' }),
  activateUser: (userId: number) => apiFetch(`/admin/users/${userId}/activate`, { method: 'POST' }),
};

// Compatibilidade com código existente
export async function getChurnRisk(companyId: number) {
  return insightsApi.getChurnRisk(companyId);
}