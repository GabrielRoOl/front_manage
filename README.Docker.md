### Executando a aplicação com Docker

Quando quiser iniciar a aplicação, execute:
`docker compose up --build`

A aplicação ficará disponível em: http://localhost:4200

### Publicando a imagem na nuvem

1. Crie a imagem localmente:

   `docker build -t meuapp .`

   Se a sua nuvem usar outra arquitetura (por exemplo: você em um Mac M1 e a nuvem for amd64), gere a imagem para essa plataforma:

   `docker build --platform=linux/amd64 -t meuapp .`

2. Envie a imagem para o seu registro (substitua pelo seu endereço):

   `docker push meu-registry.com/meuapp`

Para mais detalhes sobre como criar e enviar imagens, consulte a documentação do Docker:
https://docs.docker.com/get-started/

### Referências
* Guia do Docker para Node.js: https://docs.docker.com/language/nodejs/