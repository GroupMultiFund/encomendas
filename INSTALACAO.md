# Encomendas — estado e utilização

**Endereço:** https://groupmultifund.github.io/encomendas/

Tudo está instalado e a funcionar. Este documento fica como referência.

---

## O que está montado

| Peça | Onde |
|---|---|
| Aplicação | GitHub Pages, a partir deste repositório |
| Envio dos emails | Apps Script "Encomendas Sulfrio - envio de email", na conta logistica@groupmultifund.pt |
| Token do script | Apps Script → Definições do projeto → Propriedades do script → `TOKEN` |
| Credenciais de acesso | `cofre.js`, cifrado com a password |

O email sai de `logistica@groupmultifund.pt` para `logistica@sulfrio.pt`. O destinatário está
fixo no script, do lado do Google: a aplicação não o pode alterar.

## Instalar no telemóvel

- **Android:** abrir o endereço no Chrome → menu **⋮** → *Adicionar ao ecrã principal*
  (ou o botão *Instalar no ecrã principal* dentro da própria app)
- **iPhone:** abrir no Safari → **Partilhar** → *Adicionar ao Ecrã Principal*

Fica com ícone próprio e abre em ecrã inteiro. Ao entrar pede utilizador e password; marcando
*Manter sessão iniciada*, só volta a pedir se terminar sessão em ⚙ ou limpar os dados do browser.
Se limpar tudo no telemóvel, nada se perde — basta abrir o endereço outra vez.

## Como usar

- A **referência** (`ENC-20260916-01`) é automática e segue a data escolhida.
- **+ Adicionar produto** acrescenta linhas; **−/+** ajustam a quantidade.
- Os produtos já usados aparecem como sugestões; o tamanho é texto livre.
- **Ver email antes de enviar** mostra a mensagem tal como sai.
- Em **Últimas encomendas**, *Repetir* copia os produtos de uma encomenda anterior.
- O botão **✉** abre a app de email com a encomenda preenchida — alternativa que funciona sempre.
- Em ⚙ há **Email de teste** (envia para a própria caixa, nunca para o fornecedor) e
  **Terminar sessão**.

## Segurança

- Login com utilizador e password no arranque.
- O endereço do script e o token estão cifrados em `cofre.js` (AES-GCM 256, chave derivada do
  utilizador + password por PBKDF2-SHA256, 310 000 iterações). Não são legíveis no código.
- Histórico e sugestões guardados no telemóvel também ficam cifrados com a mesma chave.
- A password não está guardada em lado nenhum. Se a perder, gera-se um cofre novo.

## Trocar a password (ou o utilizador)

1. Abrir `gerador.html` no endereço acima
2. Escrever o novo utilizador/password, colar o **token** e o **endereço do script** (os mesmos)
3. **Gerar bloco cifrado** → **Copiar**
4. Substituir o conteúdo do ficheiro `cofre.js` neste repositório por esse bloco

Os telemóveis apanham a alteração na abertura seguinte.

## Trocar o token do script

1. No gerador, **Gerar token novo** e copiar
2. Apps Script → Definições do projeto → Propriedades do script → editar `TOKEN` → guardar
3. Gerar um cofre novo com esse token e substituir o `cofre.js`

Não é preciso reimplementar o script — a propriedade tem efeito imediato.

## Atualizar a aplicação

Substituir os ficheiros neste repositório. Os telemóveis apanham a versão nova na abertura
seguinte e mostram o aviso "Nova versão disponível".
