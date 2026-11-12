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
index.html       Página inicial
quem-somos.html  Apresentação e equipe
login.html       Login, cadastro e verificação visual
styles.css       Estilos e layout responsivo
script.js        Interações da página e Área do Atleta
login.js         Guias, tela de cadastro e verificação
assets/          Fotos, escudos e ícones
```

## Integrações pendentes

Login, cadastro, envio e validação de código por e-mail ainda são apenas interfaces e dependem de um serviço de autenticação conectado.

A aba Gestão também depende de autenticação. A lista comentada em `script.js` serve para configurar a exibição da aba, mas o controle real de acesso a dados deve ser validado no servidor.

---

<div align="center">
  <img src="assets/escudo.png" alt="Escudo da Associação Atlética Acadêmica XX de Março" width="180">
</div>