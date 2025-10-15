# 🐼 Panda Loterias - Projeto Full-Stack

Bem-vindo à Panda Loterias! Esta é uma plataforma completa de simulação de apostas, construída como um projeto acadêmico. O sistema permite que usuários se cadastrem, gerenciem créditos virtuais, realizem apostas em diversas modalidades e acompanhem os resultados, que são apurados automaticamente pelo sistema.

O projeto é dividido em duas partes principais:
1.  **API Back-end (`/panda-loterias`):** Um servidor Node.js que gerencia toda a lógica de negócios, dados e autenticação.
2.  **App Front-end (`/panda-loterias-web`):** Uma Single Page Application (SPA) construída em React que consome a API e fornece a interface do usuário.

---

## 🏛️ Arquitetura e Tecnologias

### Back-end (API)
* **Node.js** com **Express** para a API RESTful.
* **Prisma** como ORM para gerenciar a comunicação com o banco de dados.
* **SQLite** como banco de dados para simplicidade no desenvolvimento.
* **JSON Web Tokens (JWT)** para autenticação de sessão segura.
* **bcrypt** para hashing de senhas.
* **Joi** para validação robusta de esquemas de entrada na API.
* **Lógica de Negócios:** Módulos dedicados para a lógica do jogo (`gameLogic.js`), validação (`validationService.js`) e apuração (`payoutService.js`).

### Front-end (Web App)
* **React** com **Vite** para uma experiência de desenvolvimento rápida e moderna.
* **React Router** para roteamento e navegação entre as páginas.
* **Chakra UI** como biblioteca de componentes para um design limpo, profissional e responsivo.
* **Context API** do React para gerenciamento de estado global (Autenticação, Carrinho de Apostas, Regras do Jogo).
* **Axios** para fazer requisições HTTP para o back-end, com um interceptador que anexa automaticamente o token de autenticação.
* **CSS Customizado** e um tema Chakra extendido para alinhar o design com a identidade visual da marca.

---

## 🏁 Como Rodar o Projeto Completo

**Pré-requisitos:**
* [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado.
* Você precisará de **dois terminais** abertos para rodar o back-end e o front-end simultaneamente.

### Passo 1: Configurar e Rodar o Back-end (Terminal 1)

1.  **Navegue até a pasta do back-end:**
    ```bash
    cd panda-loterias
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o `.env`:**
    * Crie um arquivo chamado `.env` nesta pasta.
    * Adicione a variável de ambiente para o segredo do JWT:
      ```.env
      JWT_SECRET=SEU_SEGREDO_SUPER_SEGURO_AQUI
      ```

4.  **Crie e Popule o Banco de Dados:**
    Este comando irá resetar o banco de dados e rodar o *seed* com todas as regras do jogo.
    ```bash
    npx prisma migrate reset
    ```
    (Confirme com `y` quando solicitado).

5.  **Inicie o servidor back-end:**
    ```bash
    npm start
    ```
    O servidor deverá estar rodando em `http://localhost:3000`. **Mantenha este terminal aberto.**

### Passo 2: Configurar e Rodar o Front-end (Terminal 2)

1.  **Abra um novo terminal.**
2.  **Navegue até a pasta do front-end:**
    ```bash
    cd panda-loterias-web
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O servidor Vite será iniciado e abrirá automaticamente o seu navegador em `http://localhost:5173`.

Agora a plataforma "Panda Loterias" está totalmente funcional no seu ambiente local!

---