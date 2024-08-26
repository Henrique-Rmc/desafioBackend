Aqui está uma versão aprimorada e organizada do seu README para o GitHub:

---

# Desafio Backend

Desafio Back-End Developer

## Tecnologias Utilizadas

- **Node.js**
- **PostgreSQL**
- **Sequelize (ORM)**

## Sobre o Desafio

Este projeto foi desenvolvido para implementar um sistema de mensagens, garantindo consistência, controle de concorrência e eficiência na distribuição das mensagens. Durante o desenvolvimento, utilizei boas práticas para a modelagem do banco de dados e gestão de dados, sempre focando em escalabilidade e manutenibilidade.

## Modelagem do Banco de Dados

O banco de dados foi modelado usando **Sequelize** com suporte a migrations, permitindo que o esquema do banco evolua de maneira controlada e consistente entre diferentes ambientes. A modelagem principal envolve duas tabelas:

1. **Clientes**: Armazena as informações dos pagadores e recebedores.
2. **Mensagens**: Armazena as mensagens e cria relações com os dados dos pagadores e recebedores, que são gerenciados como chaves estrangeiras na tabela de mensagens.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

### 1. **Index**

- O arquivo `index.js` é responsável por configurar a aplicação, carregar as rotas da API e iniciar o servidor.

### 2. **Rotas**

- As rotas estão configuradas para gerenciar as operações da API e redirecionar as requisições para os respectivos controllers.

### 3. **Controllers**

- Os controllers são responsáveis por receber os dados das requisições HTTP, processá-los e enviá-los para os services.

### 4. **Services**

- Os services contêm a lógica de negócio principal. É onde acontece o processamento das mensagens e o gerenciamento dos coletores. Gostaria de ter criado uma classe para os coletores mas estava tendo problemas e o tempo nao me permitiu.

#### Mensagem Service

O `mensagemService.js` possui métodos fundamentais para o funcionamento da aplicação, como:

- **Controle de Coletores Ativos**: Garante que existam no máximo 6 coletores para cada ISPB.
- **Controle de Conflitos**: Evita condições de corrida entre as chamadas.
- **Distribuição de Mensagens**: Garante que as mensagens sejam distribuídas de forma eficiente e que não sejam processadas mais de uma vez.

##### Principais Propriedades

- **`iterationIds`**: Armazena os IDs de iteração para cada ISPB. Esses IDs garantem que as mensagens sejam processadas de forma única para cada sessão de monitoramento.

- **`messageAssignments`**: Controla as mensagens já atribuídas a um coletor específico para evitar duplicidade no processamento.

- **`pullNextUris`**: Armazena o próximo URI a ser chamado caso não haja mensagens disponíveis, mantendo a continuidade da conexão de streaming.

- **`activeCollectors`**: Mantém uma lista de coletores ativos para cada ISPB, com um limite de 6 coletores por ISPB. Isso ajuda a gerenciar a carga e garantir que o sistema opere dentro das restrições.

## Como Executar o Projeto

1. Clone o repositório:

   ```bash
   git clone https://github.com/Henrique-Rmc/desafioBackend.git
   cd desafioBackend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o ambiente:

   - Crie um arquivo `.env` na raiz do projeto com as configurações do banco de dados e outras variáveis necessárias.


DB_USERNAME=postgres

DB_PASSWORD=010204

DB_DATABASE=pixMessages

DB_HOST=db

DB_PORT=5432

NODE_ENV=production

   

4. Execute as migrations para configurar o banco de dados:

   ```bash
   npx sequelize db:migrate
   ```

5. Inicie a aplicação:
   ```bash
   npm start
   ```

## Docker

Você também pode usar o Docker para rodar o projeto:

1. Construa a imagem:

   ```bash
   docker build -t desafio-backend .
   ```

2. Rode o container:
   ```bash
   docker run -p 3000:3000 desafio-backend
   ```

## Considerações Finais

Esse projeto foi uma excelente oportunidade para explorar o desenvolvimento de APIs escaláveis com Node.js e PostgreSQL. A organização das responsabilidades e a implementação das boas práticas no controle de coletores e distribuição de mensagens foram os principais focos deste desafio.

---

Espero que isso esteja em conformidade com o que vocês esperavam! Agradeço por seu tempo validando meu projeto!
