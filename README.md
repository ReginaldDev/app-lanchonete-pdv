# App Lanchonete - Controle de Vendas e Estoque
Projeto de Extensão Acadêmica para um aplicativo de Ponto de Venda (PDV) e Gestão de Estoque, desenvolvido em React Native (Expo) com foco em microempresas.

## 1. 🚀 Aplicativo Finalizado (.apk)
Você pode baixar e instalar o aplicativo Android finalizado (.apk) diretamente através deste link:

**[Baixar o Aplicativo (Produção .apk)](https://expo.dev/accounts/rsajr/projects/app-lanchonete/builds/6cf82e5a-faa6-4795-94f1-1b5822c998a0)**

*(O app foi construído em "Modo de Produção", é 100% independente e não precisa de nenhum servidor para rodar).*

---

## 2. O Problema (O Porquê)
O projeto foi desenvolvido para a "Lanchonete Sabor da Vila", uma microempresa familiar que realizava 100% do seu controle de vendas e estoque em cadernos manuais. Isso gerava problemas operacionais graves:
* **Lentidão** no atendimento, causando filas.
* **Erros** frequentes no fechamento de caixa.
* **Desperdício** de produtos perecíveis (estimado em 15% do estoque).
* **Falta** de produtos populares por má gestão de compras.
* **Ausência** de dados históricos para tomar decisões.

## 3. A Solução (O Quê)
Foi desenvolvido um aplicativo multiplataforma (Android) 100% offline-first, capaz de substituir o caderno e fornecer controle em tempo real para a proprietária e seus funcionários.

### Funcionalidades Principais
O app é dividido em três módulos (abas):

#### 📊 1. Relatórios
Uma tela de **relatório simples** que exibe um resumo das vendas (com base nos dados do banco local):
* **Resumo de Hoje:** Total faturado no dia e o item mais vendido.
* **Faturamento Total:** Soma de todas as vendas já registradas.
* **Vendas Recentes:** Uma lista com os últimos itens vendidos.

#### 🛒 2. Registrar Venda (PDV)
Uma tela de Ponto de Venda (PDV) otimizada para agilidade:
* Lista os produtos disponíveis com estoque.
* Permite adicionar itens a um carrinho de compras.
* O carrinho possui controle de quantidade (+/-) para ajuste rápido de itens.
* Ao **"Finalizar Venda"**:
    * Dá baixa automática no estoque (comando `UPDATE` no SQLite).
    * Registra a venda no histórico (comando `INSERT` no SQLite).

#### 📦 3. Produtos e Estoque (CRUD)
Um módulo completo de gestão de inventário (CRUD):
* **Criar (Create):** Formulário para cadastrar novos produtos (nome, preço, estoque).
* **Ler (Read):** Lista todos os produtos cadastrados.
* **Atualizar (Update):** Permite editar nome, preço e estoque de produtos existentes.
* **Excluir (Delete):** Permite remover produtos do cadastro.

## 4. Tecnologias Utilizadas (O Como)
* **React Native com Expo:** Framework principal para o desenvolvimento multiplataforma.
* **TypeScript:** Para segurança e robustez do código.
* **Expo Router (v3):** Sistema de navegação baseado em arquivos (file-system routing).
* **Expo-SQLite:** Para o banco de dados relacional local, garantindo o funcionamento 100% offline.
* **Expo Application Services (EAS):** Utilizado para criar os *Development Builds* (para testes) e os *Production Builds* (o `.apk` final).

## 5. Como Rodar o Projeto (Modo de Desenvolvimento)

Este projeto utiliza `expo-sqlite`, que é uma biblioteca nativa. Por isso, ele **não funciona** no aplicativo "Expo Go" padrão da Play Store. Ele precisa de um "Build de Desenvolvimento" customizado.

1.  **Clone o repositório:**
    `git clone https://github.com/ReginaldDev/app-lanchonete-pdv.git`
2.  **Entre na pasta:**
    `cd app-lanchonete`
3.  **Instale as dependências:**
    `npm install`
4.  **Construa o .apk de desenvolvimento (necessário apenas uma vez):**
    `npx eas build --profile development --platform android`
5.  **Instale o .apk** baixado no seu celular Android.
6.  **Inicie o servidor de desenvolvimento:**
    `npx expo start --dev-client`
7.  **Abra o app "app-lanchonete"** no seu celular (ele vai se conectar ao servidor).

## 6. Autor
**[Reginaldo Silva de Albuquerque Junior](https://github.com/ReginaldDev)**