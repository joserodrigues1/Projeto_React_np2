# Documentação Completa do Projeto React

## Visão Geral

Este projeto é uma aplicação React com Vite que fornece uma calculadora de tributação para comparar dados de Pessoa Física (PF) e Pessoa Jurídica (PJ). A aplicação inclui:

- Formulário de entrada para renda, custos e profissão
- Cálculo local de imposto para PF e PJ
- Comparação visual de resultados entre PF e PJ
- Página de ajuda
- Formulário de contato que envia mensagens para um backend
- Chatbot integrado via webhook n8n
- Rotas auxiliares de cadastro e login

---

## Estrutura de Pastas

```
projeto-react/
  package.json
  README.md
  DOCUMENTATION.md
  vite.config.js
  .env
  public/
  src/
    App.jsx
    App.css
    index.css
    main.jsx
    components/
      CalculadoraForm.jsx
      CalculadoraIR.jsx
      ResultadoComparacao.jsx
      Header.jsx
      Footer.jsx
      Logo.jsx
      AjudaPage/AjudaPage.jsx
      ContatoForm/ContatoForm.jsx
      cadastro/CadastroUsuario.jsx
      cadastro/LoginUsuario.jsx
      Chatbot/ChatbotUI.jsx
      Chatbot/ChatbotToggle.jsx
      Chatbot/IconChatbot.jsx
    assets/
      logoUnichristus.webp
      IconChatbootIA.png
```

---

## Dependências Principais

- `react`, `react-dom` - biblioteca principal de UI
- `react-router-dom` - roteamento entre páginas
- `react-hook-form` - gerenciamento de formulários e validação
- `axios` - chamadas HTTP para backend
- `react-markdown`, `remark-gfm` - renderização de respostas markdown no chatbot
- `vite` - bundler e servidor de desenvolvimento

Scripts importantes em `package.json`:

- `npm run dev` - inicia servidor de desenvolvimento Vite
- `npm run build` - gera build de produção
- `npm run preview` - executa preview local do build
- `npm run lint` - verifica projeto com ESLint

---

## Arquivo Principal: `src/App.jsx`

### Função principal

`App.jsx` é o componente de layout e roteamento da aplicação. Ele:

- importa componentes globais e rotas
- mantém estados principais:
  - `dadosFormulario` - dados de entrada do calculador
  - `resultadoPF` - resultado do cálculo PF
  - `resultadoPJ` - resultado do cálculo PJ
  - `isChatOpen` - controle de abertura do chatbot
- define funções de negócio:
  - `handleCalculo` - calcula localmente usando `CalculadoraIR.jsx`
  - `handleSendContato` - envia dados de contato para o backend
  - `toggleChat` - abre/fecha o chatbot

### Rotas

- `/` - página principal com `CalculadoraForm` e `ResultadoComparacao`
- `/cadastro` - formulário de cadastro de usuário
- `/login` - formulário de login
- `/ajuda` - página de ajuda
- `/contato` - formulário de contato

### Fluxo de dados

1. Usuário preenche `CalculadoraForm`
2. `CalculadoraForm` chama `onDataSubmit` com payload normalizado
3. `App.jsx` chama `calculadoraIRPF` e `calculadoraIRPJ`
4. Resultados são armazenados em estado e passados para `ResultadoComparacao`
5. Se opção de email estiver ativa, `App.jsx` tenta enviar os dados via API

### Observações

- A função `getBackendBaseUrl()` detecta se o app foi aberto em Codespaces e ajusta a URL do backend.
- A função `handleSendContato` retorna objeto `{ success, error }` para o formulário de contato tratar mensagens.

---

## Componentes de Cálculo

### `src/components/CalculadoraForm.jsx`

Responsável pelo formulário da calculadora. Principais pontos:

- usa `react-hook-form`
- aceita entrada de texto para `rendaMensal` e `custosMensais`
- valida caracteres numéricos com vírgula ou ponto
- converte valores de string para número usando `replace(',', '.')`
- define `tipoCalculo` como `PF` ou `PJ` conforme a profissão
- permite, em lógica comentada, escolher enviar email ao final

Campos:

- `rendaMensal` - obrigatório, até R$ 15.000
- `custosMensais` - obrigatório, não pode ser negativo
- `profissao` - psicólogo, advogado ou arquiteto
- `enviarEmail` / `emailUsuario` - opção atualmente comentada no JSX, mas mantida na lógica

### `src/components/CalculadoraIR.jsx`

Contém as regras de negócio do cálculo de impostos.

#### `calculadoraIRPF(rendaMensal, custosMensais)`

- calcula `basePF = renda - custos`
- aplica faixas progressivas de IRPF com deduções fixas
- aplica tabela de redução adicional (`valorReducao`) para rendas até R$ 7.350
- calcula `imposto` final com `Math.max(0, imposto - valorReducao)`
- entrega:
  - `rendaMensal`
  - `custosMensais`
  - `basePF`
  - `deducao`
  - `imposto`
  - `rendaLiquida`

#### `calculadoraIRPJ(rendaMensal, profissao)`

- caso `psicologo` ou `arquiteto`:
  - `simples_nac = renda * 0.06`
  - `pro_labore = renda * 0.28`
  - `inss = pro_labore * 0.11`
  - `imposto = simples_nac + inss`
  - `rendaLiquida = renda - imposto`
- caso `advogado`:
  - `simples_nac = renda * 0.045`
  - `pro_labore = 1621` (fixo)
  - `inss = pro_labore * 0.11`
  - `inss_patronal = pro_labore * 0.20`
  - `imposto = simples_nac + inss + inss_patronal`
  - `rendaLiquida = renda - imposto`

---

## Exibição de Resultado

### `src/components/ResultadoComparacao.jsx`

Mostra lado a lado os resultados para PF e PJ.

Principais responsabilidades:

- recebe `dadosEntrada`, `resultadoPF` e `resultadoPJ`
- formata valores com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- decide melhor opção comparando `rendaLiquida` de PF e PJ
- mostra cards separados:
  - card PF com `basePF`, `imposto` e `rendaLiquida`
  - card PJ com dados diferentes para advogado e outros profissionais
- exibe iframe de vídeo condicionado a:
  - profissão selecionada
  - melhor opção (PF/PJ)

Notas:

- Os URLs dos vídeos são placeholders: `VIDEO_ID_PF_PSICOLOGO`, etc.
- Para ativar o vídeo, substitua o ID do YouTube real.

---

## Header / Navegação

### `src/components/Header.jsx`

Componente de topo fixo da aplicação. Responsável por:

- exibir logo com `Logo.jsx`
- mostrar título e subtítulo
- renderizar links de navegação com `react-router-dom`:
  - Home
  - Perguntas Frequentes

Notas:

- Há links comentados para `Contato`, `Cadastrar` e `Login`.
- O estilo é inline e aplica efeito hover via `onMouseEnter` / `onMouseLeave`.

### `src/components/Logo.jsx`

Renderiza a imagem `logoUnichristus.webp` com largura automática e altura fixa.

### `src/components/Footer.jsx`

Footer simples com texto de direitos autorais e ano atual.

---

## Páginas Auxiliares

### `src/components/AjudaPage/AjudaPage.jsx`

Página de ajuda com explicações detalhadas de:

- Renda Mensal
- Custos Mensais

Também apresenta botão para voltar à página inicial.

### `src/components/ContatoForm/ContatoForm.jsx`

Formulário de contato que:

- usa `react-hook-form`
- valida `nome`, `email` e `duvida`
- chama `onSubmitContato` recebido por props
- exibe mensagens de sucesso ou erro
- navega de volta à home ao cancelar

Observações:

- `onSubmitContato` é definido em `App.jsx`
- o formulário envia `formData` para o backend com `axios.post`
- a UI está preparada para mostrar falhas de rede ou erros retornados pela API

---

## Cadastro e Login

### `src/components/cadastro/CadastroUsuario.jsx`

Formulário de cadastro de usuário com validação manual:

- `nome` obrigatório, mínimo 3 caracteres
- `email` obrigatório e formato válido
- `idade` entre 18 e 120
- `senha` obrigatório, mínimo 6 caracteres

No envio, envia `POST http://localhost:3000/auth/register` com nome, email e senha.

### `src/components/cadastro/LoginUsuario.jsx`

Formulário de login básico:

- `email` obrigatório
- `senha` obrigatório
- envia `POST http://localhost:3000/auth/login`
- armazena `token` no `localStorage` quando recebe resposta bem-sucedida
- redireciona para `/`

---

## Chatbot

### `src/components/Chatbot/ChatbotUI.jsx`

Componente completo do painel do chatbot.

Responsabilidades:

- renderiza histórico de mensagens
- permite enviar texto via input ou botão
- faz requisição `POST` para `API_URL` (webhook n8n)
- usa `ReactMarkdown` para renderizar respostas do modelo
- mantém `sessionId` único para cada conversa
- suporta limpeza de chat e expansão/retração do painel

Dados e configurações:

- `API_URL` é definido por `import.meta.env.VITE_N8N_WEBHOOK_URL` ou fallback `http://localhost:5678/webhook/chatbot-unichristus`
- se o webhook retornar `resposta`, `output`, `text` ou `response`, o componente usa esse texto

### `src/components/Chatbot/ChatbotToggle.jsx`

Botão flutuante que abre o chatbot.

- usa estado local para mostrar tooltip ao passar o mouse
- fixa o botão no canto inferior direito

### `src/components/Chatbot/IconChatbot.jsx`

Imagem simples com layout definido e borda arredondada.

---

## Estilos Globais

### `src/index.css`

Define: 

- fonte `Montserrat`
- `box-sizing: border-box`
- fundo em `linear-gradient`
- layout básico de `body` e `#root`

### `src/App.css`

Define classes reutilizáveis para formulários e botões:

- `.container-principal`
- `.calculadora-form`
- `.form-input`, `.btn-primary`, `.btn-secondary`
- estilos de erro e mensagens de sucesso
- estilos para seção de contato e textarea

Observação: muitos componentes usam estilos inline em vez de classes CSS.

---

## Comportamento do Projeto

### Fluxo principal

1. Usuário acessa `/`
2. Preenche `Renda Mensal`, `Custos Mensais` e `Profissão`
3. Clica em `Calcular`
4. Aplicação calcula PF e PJ localmente
5. `ResultadoComparacao` exibe comparativo e indica a melhor opção
6. Se vídeo estiver configurado, exibe um iframe relacionado

### Tratamento de erros

- `CalculadoraForm` valida inputs e só envia valores válidos
- `App.jsx` encapsula cálculo e envio de email em `try/catch`
- `ContatoForm` mostra `success` e `error` retornados pelo backend

---

## Pontos Importantes para Ajustes

- Os IDs de vídeo em `ResultadoComparacao.jsx` precisam ser trocados pelos vídeos reais do YouTube.
- O formulário de envio por email tem parte do checkbox comentado; reativar se quiser enviar resultados por email.
- As rotas de autenticação (`/auth/register`, `/auth/login`) usam `localhost:3000`. Ajustar se o backend estiver em outro host.
- O chatbot depende de um webhook n8n; verifique `VITE_N8N_WEBHOOK_URL` no `.env` se necessário.

---

## Recomendações de evolução

- mover estilos inline para CSS/SCSS para facilitar manutenção
- adicionar `reset()` em `react-hook-form` quando o formulário for enviado
- validar respostas do backend de maneira mais robusta
- criar hooks customizados para formulários e cálculos
- adicionar testes unitários para `CalculadoraIR.jsx`

---

## Resumo de arquivos principais

- `App.jsx` - container da aplicação e roteamento
- `CalculadoraForm.jsx` - captura os dados do usuário
- `CalculadoraIR.jsx` - regras de imposto PF/PJ
- `ResultadoComparacao.jsx` - exibição e comparação dos resultados
- `Header.jsx` / `Footer.jsx` / `Logo.jsx` - layout superior e inferior
- `ContatoForm.jsx` - formulário de contato com envio para backend
- `AjudaPage.jsx` - página de conteúdo explicativo
- `CadastroUsuario.jsx` / `LoginUsuario.jsx` - rotas de autenticação
- `ChatbotUI.jsx` + `ChatbotToggle.jsx` + `IconChatbot.jsx` - assistente integrado

---

## Como usar esta documentação

- Use `DOCUMENTATION.md` como referência para entender cada parte do projeto
- Atualize os placeholders de vídeo e os endpoints conforme o ambiente
- Se quiser, posso também gerar comentários linha a linha dentro dos arquivos de código
