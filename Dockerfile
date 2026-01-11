ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

# Instalamos o Angular CLI globalmente para evitar o erro de "not found"
RUN npm install -g @angular/cli

# Copiamos apenas os arquivos de dependências primeiro
COPY package*.json ./

# Instalamos as dependências
RUN npm install

# Copiamos o restante do código
COPY . .

EXPOSE 4200

# Usamos o comando direto do angular cli
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]