# 🐼 Panda Loterias - API (Back-end)

Esta é a API RESTful e o servidor back-end para a plataforma de simulação de apostas "Panda Loterias". Este projeto foi construído como parte de um trabalho de faculdade.

Ele é responsável por toda a lógica de negócios, incluindo:
* Gerenciamento de usuários e autenticação (JWT).
* Lógica complexa de apostas e regras do jogo.
* Processamento de sorteios e apuração automática de resultados.
* Pagamento de prêmios (créditos virtuais) aos vencedores.
* Validação de entrada e agendamento de apostas ("roll-over" para o dia seguinte).

---

## 🚀 Tecnologias Utilizadas

* **Node.js**: Ambiente de execução.
* **Express**: Framework para a API RESTful.
* **Prisma**: ORM para a comunicação com o banco de dados.
* **SQLite**: Banco de dados (usado para desenvolvimento).
* **jsonwebtoken (JWT)**: Para autenticação e gerenciamento de sessão.
* **bcrypt**: Para hashing e segurança de senhas.
* **cors**: Para permitir a comunicação com o front-end.

---

## 🏁 Como Rodar (Instalação e Execução)

**Pré-requisito:** Você precisa ter o [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado.

### 1. Instalar Dependências

Navegue até a pasta do projeto e instale todos os pacotes necessários:
```bash
npm install

2. Configurar o Ambiente

Este projeto precisa de um arquivo .env na raiz para armazenar "segredos".

Crie um arquivo chamado .env na pasta raiz.

Adicione a seguinte variável (você pode gerar um segredo novo e complexo):

Snippet de código
JWT_SECRET=SEU_SEGREDO_SUPER_SEGURO_AQUI
(O DATABASE_URL já está configurado no schema.prisma para usar o SQLite e não precisa estar no .env)

3. Criar e Popular o Banco de Dados

Nós usamos um único comando "mágico" do Prisma que faz tudo:

Apaga qualquer banco de dados antigo (se existir).

Roda as "migrations" (cria as tabelas).

Roda o "seed" (popula o banco com todas as regras de jogo, horários e taxas de pagamento).

Execute no seu terminal:

Bash
npx prisma migrate reset
(Você precisará confirmar com y (yes) para apagar o banco)

4. Iniciar o Servidor

Agora, basta iniciar o servidor de desenvolvimento:

Bash
npm start
O servidor nodemon será iniciado. Você deverá ver a mensagem:
🐼 Servidor rodando na porta 3000

O back-end está 100% funcional e pronto para receber requisições do front-end.

🗺️ Mapa da API (Endpoints)
Autenticação (/api/auth)

POST /register: Cria um novo usuário.

POST /login: Loga um usuário e retorna um token JWT.

Usuário (/api/user) - (Protegido)

GET /me: Retorna o perfil (nome, saldo) do usuário logado.

GET /bets: Retorna o histórico de apostas do usuário logado.

Apostas (/api/bets) - (Protegido)

POST /: Cria uma nova aposta.

Regras do Jogo (/api/game) - (Público)

GET /rules: Retorna um JSON com todas as regras (Horários, Modalidades, Condições, Taxas) para o front-end.

Sorteios (/api/draws) - (Público)

GET /results: Retorna os resultados publicados (padrão: hoje, ou filtrável por ?date=...).

Admin (/api/admin) - (Protegido por Admin)

POST /results/:id: Publica o resultado de um sorteio (e dispara a apuração).