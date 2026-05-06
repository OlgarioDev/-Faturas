This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


🚀 +Facturas | Sistema de Facturação Digital
O +Facturas é uma solução moderna de facturação digital desenvolvida com Next.js 15 e Flask, focada na conformidade com as normas da AGT (Angola) e facilidade de gestão documental.

🛠️ Stack Tecnológica
Frontend: Next.js (App Router), Tailwind CSS, Lucide React.

Backend: Flask (Python), SQLAlchemy, PostgreSQL.

Segurança: JWT (JSON Web Tokens) e Middleware de Autenticação.

Infraestrutura: Docker & Docker Compose.

🐳 Como Rodar com Docker (Recomendado)
A forma mais rápida de subir todo o ecossistema (Base de Dados + Backend + Frontend):

Garante que tens o Docker instalado.

Executa o comando na raiz do projeto:

docker-compose up --build


Acede às aplicações:

Frontend: http://localhost:3000

Backend (API): http://localhost:5000

Documentação API: http://localhost:5000/apidocs (Se configurado com Flasgger)


.
├── backend/                # API Flask & Lógica de Negócio
│   ├── app/
│   │   ├── models/        # Modelos de Dados (SQLAlchemy)
│   │   ├── routes/        # Endpoints da API
│   │   └── middleware/    # Proteção de Rotas
│   ├── Dockerfile
│   └── run.py
├── frontend/               # Interface Next.js
│   ├── src/app/           # Páginas e Componentes
│   ├── src/lib/           # Utilitários e API Fetch
│   └── Dockerfile
└── docker-compose.yml      # Orquestração do Sistema


Método,Rota,Descrição
GET,/api/invoices/,Lista todos os documentos (FT/FR).
POST,/api/invoices/,Emite um novo documento fiscal.
GET,/api/invoices/<id>,"Detalhes completos, linhas e morada do cliente."
PUT,/api/invoices/<id>,Atualiza estado (Liquidado/Anulada).


Método,Rota,Descrição
GET,/clients/,Lista de clientes para facturação.
GET,/products/,Inventário de serviços e produtos.

Cria um ficheiro .env no backend para configurar o acesso à base de dados:

DATABASE_URL=postgresql://user_admin:password_segura@db:5432/facturas_v1
JWT_SECRET_KEY=tua_chave_secreta_aqui

🚀 Desenvolvimento Local (Sem Docker)
Se preferires rodar os serviços manualmente:

Backend

cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate no Windows
pip install -r requirements.txt
python run.py

Frontend

cd frontend
npm install
npm run dev

Notas de Versão v1.0

Geração de QR Code padrão AGT.
Cálculo automático de retenção e IVA (14%).
Gestão de moradas fiscais dinâmicas.
Suporte a Notas de Crédito para anulação.