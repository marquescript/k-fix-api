# k-fix-api

API desenvolvida em Node.js utilizando Serverless Framework, MongoDB e AWS Lambda.

## Pré-requisitos

- Node.js 20.x ou superior
- NPM
- Serverless Framework (`npm install -g serverless`)
- MongoDB (local ou Atlas)
- Conta AWS (para deploy)

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/marquescript/k-fix-api.git
cd k-fix-api
npm install
```

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
NODE_ENV=dev
MONGODB_URI=sua_string_de_conexao
MONGODB_URI_DEV=sua_string_de_conexao_dev
JWT_SECRET=sua_jwt_secret
JWT_REFRESH_SECRET=sua_jwt_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=3600
REFRESH_TOKEN_EXPIRES_IN=86400
SENDER_EMAIL=seu@email.com
ARN_SES_IDENTITY=arn:aws:ses:us-east-1:123456789012:identity/seu@email.com
```

## Rodando localmente

Para rodar o projeto localmente com Serverless Offline:

```bash
npm start
```

A API estará disponível em `http://localhost:3000` (ou outra porta configurada).

## Deploy na AWS

Para fazer deploy em ambiente de desenvolvimento:

```bash
npm run deploy:dev
```

Para produção:

```bash
npm run deploy:prod
```

## Remover stack da AWS

Para remover o deploy do ambiente de desenvolvimento:

```bash
npm run remove:dev
```

---