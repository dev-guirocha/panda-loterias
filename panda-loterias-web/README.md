# 🐼 Panda Loterias - Interface (Front-end)

Esta é a interface de usuário (Front-end) construída em React para a plataforma de simulação de apostas "Panda Loterias".

Ela consome a API do back-end (`panda-loterias`) para fornecer uma experiência de usuário completa e reativa (Single Page Application - SPA).

### Funcionalidades Principais
* Construído com **React** e **Vite**.
* Gerenciamento de estado global para autenticação (`AuthContext`).
* Roteamento com **React Router**, incluindo rotas públicas e privadas.
* Interface de usuário bonita e responsiva construída com **Chakra UI** e um tema customizado baseado na logo.
* Formulário de apostas dinâmico com *dropdowns* em cascata (lógica de regras).
* Atualização de saldo em tempo real após a aposta.
* Consumo de API seguro e centralizado com **Axios** (incluindo interceptador de token JWT).

---

## 🚀 Tecnologias Utilizadas

* **React**: Biblioteca principal da interface.
* **Vite**: Ferramenta de build e servidor de desenvolvimento.
* **React Router (`react-router-dom`)**: Para o roteamento das páginas.
* **Axios**: Cliente HTTP para fazer requisições à API.
* **Chakra UI**: Biblioteca de componentes para o design.
* **React Icons**: Pacote de ícones.

---

## 🏁 Como Rodar (Instalação e Execução)

### 🚨 Pré-requisito Essencial

Este projeto é **apenas** o front-end. Ele é inútil sem o servidor back-end.

**Antes de começar, você DEVE seguir as instruções do projeto `panda-loterias` (API) e garantir que o servidor back-end esteja rodando em `http://localhost:3000`.**

### 1. Instalar Dependências

Navegue até a pasta deste projeto (`panda-loterias-web`) e instale todos os pacotes necessários:
```bash
npm install

2. Iniciar o Servidor Front-end

Com o back-end já rodando, inicie o servidor de desenvolvimento do Vite:

Bash
npm run dev
O servidor Vite será iniciado. Você deverá ver a mensagem:
➜ Local: http://localhost:5173/

3. Acessar a Plataforma

Abra seu navegador e acesse o endereço fornecido:
http://localhost:5173/

Você pode agora se registrar, logar e usar a plataforma completa.

