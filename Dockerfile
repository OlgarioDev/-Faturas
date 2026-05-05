FROM node:20-slim

WORKDIR /app

# Copia apenas o que é necessário para instalar dependências
COPY package*.json ./
RUN npm install

# Copia o resto dos ficheiros (o .dockerignore vai filtrar o resto)
COPY . .

# Comando de build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]