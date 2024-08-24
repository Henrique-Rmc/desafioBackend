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

# Recebimento de mensagens para um ispb:
cabeçalho Accept.

## inexistente ou application/json
retorna uma mensagem,  200, pull next

## multipart/json
pode retornar multiplas mensagens, máximo 10

Quando nao há mensagens, 204

Analisando, percebi que existe a necessidade de que mensagem contenham entidades e relacionamentos com pagador e recebedor, reestruturei o código de criação de mensagens

