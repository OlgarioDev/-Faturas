// Definição dos Cargos (Roles) e suas permissões de navegação
export const ROLE_PERMISSIONS = {
  admin: ["dashboard", "documents", "clients", "products", "reports", "settings", "account"],
  gestor: ["dashboard", "documents", "clients", "products", "reports"],
  vendedor: ["dashboard", "documents", "clients", "products"], // Sem acesso a relatórios e configurações
  contabilista: ["documents", "reports"] // Foco na exportação de dados para a AGT
};

// Tipo para ajudar o TypeScript a não cometer erros
export type UserRole = keyof typeof ROLE_PERMISSIONS;

// Função utilitária para verificar permissão em qualquer parte do código
export function hasPermission(role: UserRole, module: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(module) ?? false;
}