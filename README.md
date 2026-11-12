# AAA XX DE MARÇO

<div align="center">

**Esporte, união e tradição.**

Site institucional da Associação Atlética Acadêmica XX DE MARÇO.

</div>

## Sobre o projeto

Uma página para apresentar a atlética, seus esportes, eventos, conquistas e equipe. O visual usa a identidade azul e amarela da XX de Março, com animações e layout responsivo para celular e computador.

## O que tem no site

- **Página inicial:** mosaico de fotos, eventos, esportes e chamadas para contato.
- **Carrosséis:** imagens de eventos e conquistas com avanço automático, controles e gesto de deslizar no celular.
- **Jogo do Viking:** corrida estilo endless runner por paisagens de Franca em pixel art, da região central até a chegada à Unifran, com o Cérbero lançando bolas de fogo e canecas, livros e cones como obstáculos. Inclui sprites em pixel art, animação de agachamento, salto pelas setas no computador e gestos de toque no celular.
- **Quem Somos:** apresentação da atlética e cartões da equipe separados por Diretoria Geral, Gestão e Diretoria Esportiva.
- **Área do Atleta:** menu de perfil, carrinho, histórico e acesso de Gestão condicionado à lista de usuários autorizados.
- **Login e cadastro:** telas estáticas com formulário de verificação por código, preparadas para futura integração com autenticação e envio de e-mail.
- **Links externos:** grupo da delegação no WhatsApp, contato e site da Uni-FACEF.

## Tecnologias

- HTML
- CSS
- JavaScript

As animações e interações atuais usam CSS e JavaScript. O projeto não tem React nem servidor configurado.

## Abrir no VS Code

1. Baixe e extraia `xx-marco-site.zip`.
2. No VS Code, selecione **Arquivo → Abrir Pasta** e abra a pasta `xx-marco-site`.
3. Abra `index.html` no navegador. Para recarregar a página automaticamente durante a edição, use a extensão **Live Server** e clique em **Go Live**.

## Arquivos principais

```text
index.html                  Página inicial
quem-somos.html             Apresentação e equipe
eventos.html                Página de eventos
produtos.html               Página de produtos
login.html                  Login, cadastro e verificação visual
styles/
  styles.css                Estilos gerais do site
  game.css                  Estilos da janela do jogo
scripts/
  script.js                 Navegação, carrosséis e Área do Atleta
  game.js                   Jogo do Viking e controles
  login.js                  Guias, cadastro e verificação visual
assets/
  images/                   Fotos, escudos, logos e ícones
  game/                     Cenários, sprites e obstáculos
    source/                 Fichas e artes originais de referência
```

## Integrações pendentes

Login, cadastro, envio e validação de código por e-mail ainda são apenas interfaces e dependem de um serviço de autenticação conectado.

A aba Gestão também depende de autenticação. A lista de usuários permitidos em `scripts/script.js` controla a exibição da aba, mas o acesso real a dados deve ser validado no servidor.

---

<div align="center">
  <img src="assets/images/escudo.png" alt="Escudo da Associação Atlética Acadêmica XX de Março" width="180">
</div>
