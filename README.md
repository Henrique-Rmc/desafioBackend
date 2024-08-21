# desafioBackend
Dasafio Back End Developer

# Tecnologias
NodeJS com PostgreSQL

# Etapas:
Compreender a API do Pix

Estudo do Manual do Governo para requisições do PIX
Fonte: 
https://www.bcb.gov.br/content/estabilidadefinanceira/cedsfn/Manual%20das%20Interfaces%20de%20Comunicacao-1.11.pdf

páginas 20-26

É responsabilidade do PSP buscar as mensagens disponíveis a ele. Para isso, deve
iniciar a leitura da saída através de um GET como o que segue:
GET /api/v1/out/{ispb}/stream/start

{ispb} corresponde ao código ISPB do PSP.
O PSP pode optar por receber mensagens avulsas (uma por requisição) ou receber
pacotes com uma ou mais mensagens em uma mesma resposta. A escolha é feita
através do cabeçalho “Accept”. Quando o cabeçalho for inexistente ou seu valor for
“application/xml”, a API retornará apenas uma mensagem. Quando seu valor for
“multipart/mixed”, poderá retornar múltiplas mensagens em uma mesma reposta.
A API retorna, no máximo, 10 mensagens a cada requisição com multipart.