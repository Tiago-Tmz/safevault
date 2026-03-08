Abra o primeiro terminal na raiz do projeto e escreva os comandos abaixo:
cd backend
npm run dev
(Deixe este terminal aberto. A API estara rodando em http://localhost:4000)

Passo 2: Ligar o Frontend (Site)
Abra um segundo terminal (mantendo o primeiro aberto) e escreva:
cd frontend
npm run dev
(Deixe este terminal aberto. Acesse o site em http://localhost:5173)

Passo 3: Ligar o Prisma Studio 
Para ver ou editar as tabelas visualmente, abra um terceiro terminal e escreva:
cd backend
npx prisma studio
(O painel abrira em http://localhost:5555)