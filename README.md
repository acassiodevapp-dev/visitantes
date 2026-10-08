# ⛪ Sistema de Boas-Vindas & Gestão de Visitantes da Igreja

Sistema web completo para recepção de visitantes da igreja com acompanhamento em tempo real, auto-cadastro via WhatsApp, chatbot guiado, projeção no telão (datashow) e filtros avançados por culto e turno.

---

## 🚀 Como subir este projeto para o GitHub e acessar online

### 1. Como subir para o GitHub (Passo a Passo)

#### Opção A: Usando o Terminal / Visual Studio Code
1. Abra a pasta do projeto no **VS Code** ou abra o terminal na pasta.
2. Crie um novo repositório no seu GitHub (ex: `visitantes-igreja`):
   - Acesse [github.com/new](https://github.com/new)
   - Nomeie como `visitantes-igreja`
   - Pode deixar **Público** (seus dados de visitantes não sobem pro GitHub, ficam seguros localmente).
   - Clique em **Create repository**.
3. No terminal do VS Code, execute os comandos:
   ```bash
   git init
   git add .
   git commit -m "Primeira versao do app de visitantes da igreja"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/visitantes-igreja.git
   git push -u origin main
   ```
*(Substitua `SEU_USUARIO` pelo seu usuário do GitHub)*.

---

### 2. Como publicar na Web (Gratuito e com link permanente)

A forma mais fácil e rápida de publicar um app React/Vite na web é usando a **Vercel** ou **Netlify**:

#### Publicando na Vercel (Recomendado - 2 minutos):
1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique em **"Add New..."** ➔ **"Project"**.
3. Selecione o repositório `visitantes-igreja` que você acabou de subir.
4. A Vercel já detecta automaticamente que é um projeto **Vite**.
5. Clique em **"Deploy"**.
6. Pronto! Em 30 segundos você terá um link público seguro (ex: `https://visitantes-igreja.vercel.app`) para usar em celulares, tablets na recepção e no computador do telão!

---

### 3. Como funciona a Privacidade dos Dados?
- **Código público, dados privados**: O repositório no GitHub contém apenas o código-fonte do sistema.
- **Armazenamento Seguro Local**: Os nomes, telefones e pedidos de oração dos visitantes são armazenados no armazenamento local (`localStorage`) do dispositivo em uso.
- **PIN de Segurança**: O painel possui um modo de bloqueio por PIN (padrão `1234`), que mascara telefones e pedidos confidenciais para que voluntários no telão ou pessoas próximas não vejam dados pessoais.
- **Exportação Excel**: Você pode baixar a qualquer momento um arquivo `.csv` para abrir no Excel ou gerar backup em `.json`.

---

## 🛠️ Tecnologias Utilizadas
- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Lucide Icons**
- **QRCode & Canvas-Confetti**
