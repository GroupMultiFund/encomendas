# Encomendas — o que falta fazer

São quatro passos. Só é preciso fazê-los uma vez.

---

## 1. Criar o repositório no GitHub

Em github.com, com a conta **GroupMultiFund**:

1. Botão **New** (novo repositório)
2. Nome: `encomendas`
3. Marcar **Add a README file**
4. **Create repository**

Diga-me quando estiver criado — eu carrego lá todos os ficheiros.

> Para o endereço funcionar sem custos, o repositório tem de ser **público**, tal como o
> `inventario`. Isso não expõe nada de sensível: as credenciais estão cifradas e o destinatário
> está fixo do lado do Google. Se preferir mantê-lo privado, é possível, mas o GitHub cobra
> cerca de 4 USD/mês pelo plano Pro.

Depois de eu carregar os ficheiros: **Settings → Pages → Source: Deploy from a branch →
main / (root) → Save**. Passados 1 a 2 minutos o endereço fica ativo em
`https://groupmultifund.github.io/encomendas/`.

---

## 2. Criar o script que envia os emails

Este passo é igual ao que já fez no inventário.

1. Ir a **script.google.com** com a conta `logistica@groupmultifund.pt` → **Novo projeto**
2. Apagar o que lá estiver e colar o conteúdo de **`Codigo.gs`**
3. No topo do ficheiro, confirmar o destinatário:

   ```js
   const DESTINO = 'logistica@sulfrio.pt';
   ```

   Se quiser cópia interna de todas as encomendas, preencher também `CC`.

4. **Implementar → Nova implementação → Aplicação Web**
   - Executar como: **Eu (logistica@groupmultifund.pt)**
   - Quem tem acesso: **Qualquer pessoa**
5. Autorizar quando o Google pedir (vai aparecer um aviso de "app não verificada" —
   *Avançadas → Aceder ao projeto*, é o seu próprio script)
6. **Copiar o URL da aplicação web** — termina em `/exec`

> Vantagem face ao EmailJS: o email sai mesmo da vossa conta Google, sem serviços terceiros,
> sem limite de 200/mês e sem qualquer credencial dentro da página.

---

## 3. Gerar o cofre (utilizador e password)

1. Abrir **`gerador.html`** (no computador, com duplo clique, ou pelo endereço depois de publicado)
2. Escolher **utilizador** e **password** de acesso à aplicação
3. Carregar em **Gerar token novo** e **copiar o token**
4. Voltar ao Google Apps Script e substituir `'COLE-AQUI-O-TOKEN'` por esse token.
   Guardar e **implementar de novo** (Implementar → Gerir implementações → editar → Nova versão)
5. No gerador, colar o **URL do script** (o que termina em `/exec`)
6. **Gerar bloco cifrado** → **Verificar** → **Copiar**
7. Enviar-me o bloco copiado

O bloco é ilegível sem a sua password, por isso pode ser enviado sem preocupação.
**A password não deve ser enviada a ninguém, nem a mim.**

---

## 4. Instalar no telemóvel

Com o endereço já ativo:

- **Android:** abrir o link no Chrome → menu **⋮** → **Adicionar ao ecrã principal**
  (ou o botão *Instalar no ecrã principal* que aparece dentro da app)
- **iPhone:** abrir o link no Safari → **Partilhar** → **Adicionar ao Ecrã Principal**

Fica com ícone próprio e abre em ecrã inteiro. Ao entrar pede utilizador e password; se marcar
*Manter sessão iniciada*, só volta a pedir se terminar sessão ou limpar os dados do browser.

Se um dia limpar tudo no telemóvel, a aplicação não se perde: basta abrir o link outra vez.

---

## Resumo de quem sabe o quê

| | Onde está | Quem consegue ler |
|---|---|---|
| Password de acesso | Em lado nenhum — só na sua cabeça | Só o senhor |
| Token e endereço do script | Cifrados dentro da app | Quem souber a password |
| Destinatário das encomendas | Fixo no script Google | Só quem entrar na conta Google |
| Histórico de encomendas | Cifrado, no próprio telemóvel | Quem souber a password |
