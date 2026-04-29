import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Obtemos o token ou sessão (aqui simulamos com um cookie ou header)
  // No Next.js Client Side usamos localStorage, mas o Middleware corre no Server.
  // Para uma proteção real, verificaríamos um Cookie de sessão.
  const session = request.cookies.get('user_session');

  const { pathname } = request.nextUrl;

  // 2. Definir rotas que PRECISAM de login (ex: dashboard, documentos, conta)
  const isPrivatePage = pathname.startsWith('/dashboard') || 
                        pathname.startsWith('/documents') || 
                        pathname.startsWith('/account') ||
                        pathname.startsWith('/reports');

  // 3. Se a página for privada e NÃO houver sessão, redireciona para o login
  
  if (isPrivatePage && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  

  // 4. Se o utilizador JÁ estiver logado e tentar ir ao login/register, manda para o dashboard
  
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  

  return NextResponse.next();
}

// 5. Configurar em quais caminhos o middleware deve atuar

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/documents/:path*',
    '/account/:path*',
    '/reports/:path*',
    '/login',
    '/register'
  ],
};
